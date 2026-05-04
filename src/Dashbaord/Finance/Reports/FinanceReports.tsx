import { useEffect, useMemo, useState } from 'react'
import { HeadingComponent } from '../../../components/other/HeadingComponent'
import SkeletonLoading from '../../../components/other/Loader/SkeletonLoading/SkeletonLoading'
import { ChartBarMultiple } from '../Dashboard/component/ChartBarMultiple'
import { ChartPieLabelCustom } from '../Dashboard/component/ChartPieLabelCustom'
import { type ChartConfig } from '@/components/ui/chart'
import { CustomSelect } from '../../../components/ui/CustomSelect'
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Calendar,
  Download,
  Filter,
  FileText,
  LineChart,
  PieChart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getBudgetUtilization, type Budget } from '../financeApi'
import useFetchHook from '../../../Hooks/UseFetchHook'

type BudgetHealthRow = {
  name: string
  budget: number
  spent: number
  utilization: number
}

const formatCurrency = (value: number, currency = 'XAF') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0)

const formatCompact = (value: number, currency = 'XAF') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 1,
    notation: 'compact',
  }).format(value || 0)

export const FinanceReports = () => {
  const [departmentRows, setDepartmentRows] = useState<BudgetHealthRow[]>([])
  const [isUtilizationLoading, setIsUtilizationLoading] = useState(false)
  // Report filter state.
  const [startDate, setStartDate] = useState('2026-01-01')
  const [endDate, setEndDate] = useState('2026-03-31')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [exportFormat, setExportFormat] = useState<'pdf' | 'word'>('pdf')
  const [cashFlowRange, setCashFlowRange] = useState('6m')

  const {
    data: dashboardResponse,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useFetchHook<any>('/finance/dashboard', 'finance-dashboard-report')

  const {
    data: budgetsResponse,
    isLoading: isBudgetsLoading,
    isError: isBudgetsError,
    error: budgetsError,
    refetch: refetchBudgets,
  } = useFetchHook<{ data: Budget[] }>('/finance/budgets?page=1&page_size=10', 'finance-budgets-report')

  const dashboardData = dashboardResponse?.data ?? null

  // Build budget rows with utilization once budgets load.
  useEffect(() => {
    if (!budgetsResponse?.data) {
      setDepartmentRows([])
      setIsUtilizationLoading(false)
      return
    }

    let isMounted = true
    const loadUtilization = async () => {
      setIsUtilizationLoading(true)
      const limitedBudgets = budgetsResponse.data.slice(0, 5)
      const utilizationResults = await Promise.all(
        limitedBudgets.map((budget) =>
          getBudgetUtilization(budget.budget_id).catch(() => null)
        )
      )

      if (!isMounted) return

      const mappedRows = limitedBudgets.map((budget, index) => {
        const utilization = utilizationResults[index]
        return {
          name:
            utilization?.department_name ||
            budget.department_name ||
            budget.department?.department_name ||
            'Department',
          budget: utilization?.total_allocated ?? budget.total_amount ?? 0,
          spent: utilization?.total_spent ?? 0,
          utilization: utilization?.utilization_percentage ?? 0,
        }
      })

      setDepartmentRows(mappedRows)
      setIsUtilizationLoading(false)
    }

    loadUtilization()
    return () => {
      isMounted = false
    }
  }, [budgetsResponse?.data])

  // KPI summary cards from dashboard data.
  const kpis = useMemo(() => {
    const summary = dashboardData?.summary
    if (!summary) return []

    const monthlyIncome = summary.monthly_income ?? 0
    const monthlyExpense = summary.monthly_expense ?? 0
    const totalBalance = summary.total_balance ?? 0
    const operatingProfit = monthlyIncome - monthlyExpense
    const netCashFlow = monthlyIncome - monthlyExpense
    const currency = 'XAF'

    return [
      {
        title: 'Total Revenue',
        value: formatCompact(monthlyIncome, currency),
        change: 'Live',
        trend: 'up',
        note: 'last 30 days',
        icon: LineChart,
      },
      {
        title: 'Operating Profit',
        value: formatCompact(operatingProfit, currency),
        change: 'Live',
        trend: operatingProfit >= 0 ? 'up' : 'down',
        note: 'monthly close',
        icon: TrendingUp,
      },
      {
        title: 'Total Expenses',
        value: formatCompact(monthlyExpense, currency),
        change: 'Live',
        trend: 'down',
        note: 'cost controls',
        icon: Wallet,
      },
      {
        title: 'Net Cash Flow',
        value: formatCompact(netCashFlow, currency),
        change: 'Live',
        trend: netCashFlow >= 0 ? 'up' : 'down',
        note: 'vs last month',
        icon: BarChart3,
      },
      {
        title: 'Total Balance',
        value: formatCompact(totalBalance, currency),
        change: 'Live',
        trend: 'up',
        note: 'cash on hand',
        icon: Wallet,
      },
    ]
  }, [dashboardData])

  // Spend composition chart data from backend distributions.
  const spendCompositionChartData = useMemo(() => {
    const distribution = dashboardData?.expense_distribution ?? []
    const total = distribution.reduce((sum: number, item: any) => sum + (item.value || 0), 0)
    const palette = ['#F59E0B', '#38BDF8', '#6366F1', '#34D399', '#FB7185', '#0EA5E9']

    if (!distribution.length) {
      return []
    }

    return distribution.map((item: any, index: number) => ({
      name: item.name,
      value: total ? Math.round((item.value / total) * 100) : 0,
      amount: formatCurrency(item.value || 0),
      fill: palette[index % palette.length],
    }))
  }, [dashboardData])

  const spendComposition = useMemo(
    () =>
      spendCompositionChartData.map((item) => ({
        name: item.name,
        amount: item.amount,
        percent: `${item.value}%`,
      })),
    [spendCompositionChartData]
  )

  // Department filter options.
  const departmentOptions = useMemo(
    () => [
      { value: 'all', label: 'All Departments' },
      ...departmentRows.map((row) => ({ value: row.name, label: row.name })),
    ],
    [departmentRows]
  )

  // Apply the department filter to the table.
  const filteredDepartmentRows = useMemo(() => {
    if (departmentFilter === 'all') {
      return departmentRows
    }
    return departmentRows.filter((row) => row.name === departmentFilter)
  }, [departmentFilter, departmentRows])

  // Cash flow range options for the dropdown.
  const cashFlowRangeOptions = [
    { value: '3m', label: 'Last 3 months' },
    { value: '6m', label: 'Last 6 months' },
    { value: '1y', label: 'Last 1 year' },
  ]

  // Slice cash flow data based on the selected range.
  const cashFlowChartData = useMemo(() => {
    const sourceData = dashboardData?.cash_flow_data ?? []

    if (!sourceData.length) {
      return []
    }

    const data = sourceData.map((item: any) => ({
      month: item.month,
      income: item.income,
      expense: item.expense,
    }))

    if (cashFlowRange === '3m') {
      return data.slice(-3)
    }

    if (cashFlowRange === '6m') {
      return data.slice(-6)
    }

    return data
  }, [cashFlowRange, dashboardData])
  const hasCashFlowData = cashFlowChartData.some(
    (row) => (row.income ?? 0) > 0 || (row.expense ?? 0) > 0
  )

  // Chart color mapping for income vs expense.
  const cashFlowChartConfig = useMemo(
    () =>
      ({
        income: { label: 'Income', color: '#6366F1' },
        expense: { label: 'Expenses', color: '#F43F5E' },
      }) satisfies ChartConfig,
    []
  )

  // Description text that matches the selected range.
  const cashFlowDescription =
    cashFlowRange === '3m'
      ? 'Income vs Expense (last 3 months)'
      : cashFlowRange === '1y'
        ? 'Income vs Expense (last 1 year)'
        : 'Income vs Expense (last 6 months)'

  const reportHighlights = useMemo(
    () => [
      {
        title: 'Pending Approvals',
        value: `${dashboardData?.summary?.pending_approvals ?? 0}`,
        detail: 'Awaiting review',
        icon: BadgeCheck,
      },
      {
        title: 'Pending Invoices',
        value: `${dashboardData?.pending_invoices?.length ?? 0}`,
        detail: 'Open invoices',
        icon: FileText,
      },
      {
        title: 'Variance Watch',
        value: `${departmentRows.filter((row) => row.utilization >= 90).length} departments`,
        detail: 'over 90% budget',
        icon: PieChart,
      },
    ],
    [dashboardData, departmentRows]
  )

  // Format ISO date strings into friendly labels.
  const formatDate = (value: string) => {
    if (!value) return ''
    const date = new Date(`${value}T00:00:00`)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Build an HTML export for PDF/Word.
  const buildReportHtml = () => {
    const rows = filteredDepartmentRows
      .map(
        (row) => `
          <tr>
            <td>${row.name}</td>
            <td>${formatCurrency(row.budget)}</td>
            <td>${formatCurrency(row.spent)}</td>
            <td>${Math.round(row.utilization)}%</td>
          </tr>
        `
      )
      .join('')

    const cashFlowRows = cashFlowChartData
      .map(
        (row) => `
          <tr>
            <td>${row.month}</td>
            <td>${row.income}</td>
            <td>${row.expense}</td>
          </tr>
        `
      )
      .join('')

    const spendRows = spendComposition
      .map(
        (item) => `
          <tr>
            <td>${item.name}</td>
            <td>${item.amount}</td>
            <td>${item.percent}</td>
          </tr>
        `
      )
      .join('')

    const highlightRows = reportHighlights
      .map(
        (item) => `
          <tr>
            <td>${item.title}</td>
            <td>${item.value}</td>
            <td>${item.detail}</td>
          </tr>
        `
      )
      .join('')

    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Finance Report</title>
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; }
            h1 { margin-bottom: 4px; }
            h2 { margin-top: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f8fafc; text-transform: uppercase; letter-spacing: 0.08em; font-size: 10px; }
            .meta { margin-top: 8px; font-size: 12px; color: #475569; }
          </style>
        </head>
        <body>
          <h1>Finance Report</h1>
          <div class="meta">Report Range: ${formatDate(startDate)} - ${formatDate(endDate)}</div>
          <div class="meta">Department: ${departmentFilter === 'all' ? 'All Departments' : departmentFilter}</div>

          <h2>KPIs</h2>
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Change</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              ${kpis
                .map(
                  (kpi) => `
                    <tr>
                      <td>${kpi.title}</td>
                      <td>${kpi.value}</td>
                      <td>${kpi.change}</td>
                      <td>${kpi.note}</td>
                    </tr>
                  `
                )
                .join('')}
            </tbody>
          </table>

          <h2>Cash Flow</h2>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Income</th>
                <th>Expense</th>
              </tr>
            </thead>
            <tbody>
              ${cashFlowRows}
            </tbody>
          </table>

          <h2>Spend Composition</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              ${spendRows}
            </tbody>
          </table>

          <h2>Department Budget Health</h2>
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Budget</th>
                <th>Spent</th>
                <th>Utilization</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <h2>Risk & Compliance</h2>
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              ${highlightRows}
            </tbody>
          </table>
        </body>
      </html>
    `
  }

  // Export report using the selected format.
  const handleExportReport = () => {
    const reportHtml = buildReportHtml()
    const fileSuffix =
      departmentFilter === 'all'
        ? 'all-departments'
        : departmentFilter.toLowerCase().replace(/\s+/g, '-')
    const fileNameBase = `finance-report-${startDate}-to-${endDate}-${fileSuffix}`

    if (exportFormat === 'pdf') {
      const printWindow = window.open('', '_blank', 'width=900,height=700')
      if (!printWindow) return
      printWindow.document.write(reportHtml)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      return
    }

    const blob = new Blob([reportHtml], { type: 'application/msword' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileNameBase}.doc`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const isLoading = isDashboardLoading || isBudgetsLoading || isUtilizationLoading
  const loadError =
    (dashboardError as any)?.response?.data?.message ||
    (budgetsError as any)?.response?.data?.message ||
    null

  if (isLoading) {
    return <SkeletonLoading />
  }

  return (
    <div className="space-y-6">
      {(isDashboardError || isBudgetsError) && loadError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
          <button
            type="button"
            className="ml-3 underline"
            onClick={() => {
              refetchDashboard()
              refetchBudgets()
            }}
          >
            Retry
          </button>
        </div>
      )}
      <HeadingComponent
        heading="Finance Reports"
        subHeading="Executive snapshot of performance, budget health, and risk exposure."
      />

      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white text-black p-6">
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 lg:shrink-0">
            <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
              <Calendar className="h-3 w-3 text-slate-500" />
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="bg-transparent text-xs text-slate-700 focus:outline-none"
                aria-label="Start date"
              />
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
              <Calendar className="h-3 w-3 text-slate-500" />
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="bg-transparent text-xs text-slate-700 focus:outline-none"
                aria-label="End date"
              />
            </label>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 lg:flex-1 lg:justify-center">
            <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
              <Filter className="h-3 w-3 text-slate-500" />
              <select
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
                className="bg-transparent text-xs text-slate-700 focus:outline-none"
                aria-label="Department filter"
              >
                {departmentOptions.map((option) => (
                  <option key={option.value} value={option.value} className="text-slate-900">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
            <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
              <select
                value={exportFormat}
                onChange={(event) => setExportFormat(event.target.value as 'pdf' | 'word')}
                className="bg-transparent text-xs text-slate-700 focus:outline-none"
                aria-label="Export format"
              >
                <option value="pdf">PDF</option>
                <option value="word">Word</option>
              </select>
            </label>
            <Button
              variant="primary"
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90"
              onClick={handleExportReport}
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-500">
            No KPI data available yet.
          </div>
        ) : kpis.slice(0, 4).map((kpi, index) => {
          const Icon = kpi.icon
          const TrendIcon = kpi.trend === 'up' ? ArrowUpRight : ArrowDownRight
          const isPrimary = index === 0
          return (
            <div
              key={kpi.title}
              className={`rounded-2xl border p-5 ${isPrimary ? 'border-transparent text-white' : 'bg-white border-slate-100'}`}
              style={isPrimary ? { background: 'linear-gradient(135deg, #4f46a1 0%, #2f71b7 100%)' } : undefined}
            >
              <div className="flex items-center justify-between">
                <div className={`text-sm font-medium ${isPrimary ? 'text-white/90' : 'text-slate-600'}`}>
                  {kpi.title}
                </div>
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center ${
                    isPrimary ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className={`mt-4 font-semibold ${isPrimary ? 'text-3xl text-white' : 'text-2xl text-slate-900'}`}>
                {kpi.value}
              </div>
              <div className={`mt-3 flex items-center justify-between text-xs ${isPrimary ? 'text-white/70' : 'text-slate-500'}`}>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${
                    isPrimary ? 'bg-white/15 text-white' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <TrendIcon className={`h-3 w-3 ${isPrimary ? 'text-white' : ''}`} />
                  {kpi.change}
                </span>
                <span>{kpi.note}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          {!hasCashFlowData ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-500">
              No cash flow data available yet.
            </div>
          ) : (
            <ChartBarMultiple
              title="Cash Flow Trend"
              description={cashFlowDescription}
              data={cashFlowChartData}
              xKey="month"
              config={cashFlowChartConfig}
              className="rounded-2xl border border-slate-100 bg-white"
              headerClassName="pb-2"
              titleClassName="text-sm font-semibold text-slate-900"
              descriptionClassName="text-xs text-slate-500"
              chartClassName="h-48 w-full"
              legendClassName="w-full justify-center"
              yTickFormatter={(value) => `${value}`}
              headerRight={
                <div className="w-35">
                  <CustomSelect
                    options={cashFlowRangeOptions}
                    value={cashFlowRange}
                    onChange={setCashFlowRange}
                    className="rounded-full border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                  />
                </div>
              }
            />
          )}
        </div>

        <div>
        {spendCompositionChartData.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-500">
            No spend composition data available yet.
          </div>
        ) : (
          <ChartPieLabelCustom data={spendCompositionChartData} showAmount />
        )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Department Budget Health</h3>
              <p className="text-xs text-slate-500">Utilization and variance tracking</p>
            </div>
            <span className="text-xs text-slate-400">2026</span>
          </div>
          <div className="mt-5 overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Budget</th>
                  <th className="px-4 py-3 text-left">Spent</th>
                  <th className="px-4 py-3 text-left">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDepartmentRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                      No budget data available yet.
                    </td>
                  </tr>
                ) : (
                  filteredDepartmentRows.map((row) => (
                    <tr key={row.name} className="text-slate-600">
                      <td className="px-4 py-3 font-medium text-slate-800">{row.name}</td>
                      <td className="px-4 py-3">{formatCurrency(row.budget)}</td>
                      <td className="px-4 py-3">{formatCurrency(row.spent)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {`${Math.round(row.utilization)}%`}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Risk & Compliance</h3>
            <div className="inline-flex items-center gap-2 text-xs text-slate-500">
              <TrendingDown className="h-3 w-3" />
              improved
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {reportHighlights.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs uppercase text-slate-400">{item.title}</div>
                      <div className="mt-2 text-lg font-semibold text-slate-900">{item.value}</div>
                      <div className="text-xs text-slate-500">{item.detail}</div>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
