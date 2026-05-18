import { Card } from '../../../components/other/Card'
import { HeadingComponent } from '../../../components/other/HeadingComponent'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaMoneyBillWave,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaClipboardCheck,
  FaFileInvoice,
  FaMoneyCheckDollar,
  FaChartLine,
  FaReceipt
} from 'react-icons/fa6'
import { type DashboardResponse } from '../financeApi'
import ChartSkeleton from '../../../components/other/Loader/ChartSkeleton'
import Skeleton from '../../../components/other/Loader/Skeleton'
import useFetchHook from '../../../Hooks/UseFetchHook'
import { ChartLineLabelCustom } from './component/ChartLineLabelCustom'
import { ChartPieLabelCustom } from './component/ChartPieLabelCustom'
import { ChartBarMultiple } from './component/ChartBarMultiple'

// Format large numbers into compact display values (k, M).
const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k`
  }
  return amount.toLocaleString()
}

type DashboardData = DashboardResponse['data']

const normalizeDashboardData = (
  response?: DashboardResponse | DashboardData | null
): DashboardData | null => {
  if (!response) return null

  if ('summary' in response) {
    return response
  }

  if ('data' in response && response.data) {
    return response.data
  }

  return null
}

export const FinanceDashboard = () => {
  const navigate = useNavigate()

  // Fetch dashboard data using the shared hook to keep data-loading consistent.
  const {
    data: dashboardResponse,
    isLoading,
    isError,
    error,
    refetch
  } = useFetchHook<DashboardResponse | DashboardData>(
    '/finance/dashboard',
    'finance-dashboard',
    { staleTime: 60_000 }
  )

  // Normalize response so the UI can safely render even on empty/failed data.
  const hasApiError =
    !!dashboardResponse &&
    'success' in dashboardResponse &&
    dashboardResponse.success === false
  const errorMessage = hasApiError
    ? dashboardResponse?.message || 'Failed to load dashboard'
    : (error as any)?.response?.data?.message || 'Failed to load dashboard'

  const dashboardData = useMemo(
    () => normalizeDashboardData(dashboardResponse),
    [dashboardResponse]
  )
  const summary = dashboardData?.summary
  const cashFlowData = dashboardData?.cash_flow_data || []
  const expenseDistribution = dashboardData?.expense_distribution || []
  const budgetVsActual = dashboardData?.budget_vs_actual || []
  const isPageLoading = isLoading && !dashboardData

  const chartData = cashFlowData.map((item) => ({
    month: item.month,
    inflow: item.income,
    outflow: item.expense,
    netIncome: item.income - item.expense,
  }))
  const hasCashFlowData = chartData.some(
    (item) => item.inflow > 0 || item.outflow > 0 || item.netIncome !== 0
  )

  const distributionColors = ['#3BA4E0', '#10B981', '#F59E0B', '#8B5CF6', '#6B7280', '#EF4444']
  const expenseDistributionTotal = expenseDistribution.reduce(
    (total, item) => total + (Number(item.value) || 0),
    0
  )
  const pieChartData = expenseDistribution.map((item, index) => ({
    name: item.name,
    value: expenseDistributionTotal
      ? Math.round(((Number(item.value) || 0) / expenseDistributionTotal) * 100)
      : 0,
    amount: `${formatCurrency(Number(item.value) || 0)} XAF`,
    fill: distributionColors[index % distributionColors.length],
  }))

  const budgetChartData = budgetVsActual.map((item) => ({
    department: item.department,
    budget: item.allocated,
    actual: item.spent,
  }))

  if (!isPageLoading && (isError || hasApiError)) {
    return (
      <div className='flex flex-col items-center justify-center h-96'>
        <p className='text-red-500 mb-4'>{errorMessage}</p>
        <button
          onClick={() => refetch()}
          className='px-4 py-2 bg-primary text-white rounded-lg'
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className='flex justify-between items-start mb-8'>
        <HeadingComponent
          heading='Dashboard'
          subHeading='Manage transactions and expenses'
        />
      </div>

      {/* Summary metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {isPageLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="min-h-[120px] rounded-[20px] border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
                <div className="mt-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="mt-2 h-3 w-16" />
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <Card
              heading='Total Balance'
              amount={formatCurrency(summary?.total_balance || 0)}
              currency='XAF'
              icons={<FaMoneyBillWave />}
              cardStyle={{ background: 'linear-gradient(135deg, #4f46a1 0%, #2f71b7 100%)' }}
              cardClassName="min-h-[120px]"
              headingClassName="text-white/90"
              amountClassName="text-white text-4xl font-semibold"
              currencyClassName="text-white/80 text-sm"
              iconBackgroundColor="#ffffff"
              iconClassName="text-gray-900 text-lg"
            />
            <Card
              heading='Monthly Income'
              amount={formatCurrency(summary?.monthly_income || 0)}
              currency='XAF'
              icons={<FaArrowTrendUp className='text-white text-xl' />}
            />
            <Card
              heading='Monthly Expense'
              amount={formatCurrency(summary?.monthly_expense || 0)}
              currency='XAF'
              icons={<FaArrowTrendDown className='text-white text-xl' />}
            />
            <Card
              heading='Pending Approvals'
              amount={(summary?.pending_approvals || 0).toString()}
              currency='To be approved'
              icons={<FaClipboardCheck className='text-white text-xl' />}
            />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className='mb-8'>
        <h3 className='text-lg font-semibold mb-4'>Quick Actions</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {isPageLoading ? (
            <>
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="min-h-[96px] rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate('/dashboard/payroll')}
                className='bg-white p-4 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center gap-2'
              >
                <FaMoneyCheckDollar className='text-[#37A5DC] text-2xl' />
                <span className='text-sm font-regular'>Payroll Management</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/budgeting')}
                className='bg-white p-4 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center gap-2'
              >
                <FaChartLine className='text-[#37A5DC] text-2xl' />
                <span className='text-sm font-regular'>
                  Budgeting and Budget Tracking
                </span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/expenses')}
                className='bg-white p-4 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center gap-2'
              >
                <FaReceipt className='text-[#37A5DC] text-2xl' />
                <span className='text-sm font-regular'>Expense Report</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/invoice')}
                className='bg-white p-4 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center gap-2'
              >
                <FaFileInvoice className='text-[#37A5DC] text-2xl' />
                <span className='text-sm font-regular'>Invoice</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Charts row: cash flow + expense distribution */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8'>
        {/* graph */}
        <div className=' p-2 rounded-lg'>
          {isPageLoading ? (
            <ChartSkeleton bodyClassName="h-60" />
          ) : !hasCashFlowData ? (
            <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white text-sm text-gray-500">
              No cash flow data available yet.
            </div>
          ) : (
            <ChartLineLabelCustom chartData={chartData} />
          )}
        </div>
        {/* bar chart */}
        <div>
          {isPageLoading ? (
            <ChartSkeleton bodyClassName="h-60" />
          ) : pieChartData.length === 0 ? (
            <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white text-sm text-gray-500">
              No expense distribution data yet.
            </div>
          ) : (
            <ChartPieLabelCustom data={pieChartData} showAmount />
          )}
        </div>
      </div>

      {/* Budget vs actual */}
      <div className='bg-white rounded-lg overflow-hidden'>
        {isPageLoading ? (
          <ChartSkeleton bodyClassName="h-60" />
        ) : budgetChartData.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white text-sm text-gray-500">
            No budget vs actual data yet.
          </div>
        ) : (
          <ChartBarMultiple
            data={budgetChartData}
            xKey="department"
            config={{
              actual: { label: 'Actual', color: '#3BA4E0' },
              budget: { label: 'Budget', color: '#94A3B8' },
            }}
          />
        )}
      </div>
    </div>
  )
}
