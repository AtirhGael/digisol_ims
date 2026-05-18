import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaUsers,
  FaMoneyBillWave,
  FaArrowTrendUp,
  FaClipboardList,
  FaBuilding,
  FaFileInvoice,
  FaMoneyCheckDollar,
  FaChartLine,
  FaReceipt,
} from 'react-icons/fa6'
import { Card } from '../../components/other/Card'
import { HeadingComponent } from '../../components/other/HeadingComponent'
import Skeleton from '../../components/other/Loader/Skeleton'
import { useFetchHook } from '../../Hooks/UseFetchHook'

interface FinanceDashboardResponse {
  success: boolean
  data: {
    summary: {
      total_balance: number
      monthly_income: number
      monthly_expense: number
      pending_approvals: number
      total_transactions: number
    }
    recent_transactions: Array<{
      transaction_id: string
      transaction_number: string
      transaction_date: string
      transaction_type: 'Income' | 'Expense'
      category: string
      amount: number
      description: string
    }>
  }
}

interface PaginatedResponse {
  success: boolean
  data: unknown[]
  pagination: {
    total_count: number
  }
}

interface DepartmentsListResponse {
  success: boolean
  data: {
    departments: unknown[]
  }
}

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}k`
  return amount.toLocaleString()
}

export const MainDashboard = () => {
  const navigate = useNavigate()

  const { data: financeData, isLoading: financeLoading } =
    useFetchHook<FinanceDashboardResponse>('/finance/dashboard', 'main-finance', { staleTime: 120_000 })

  const { data: employeesRes, isLoading: employeesLoading } =
    useFetchHook<PaginatedResponse>('/employees?page_size=1', 'main-employees', { staleTime: 120_000 })

  const { data: tasksRes, isLoading: tasksLoading } =
    useFetchHook<PaginatedResponse>('/tasks?page_size=1', 'main-tasks', { staleTime: 120_000 })

  const { data: departmentsRes, isLoading: departmentsLoading } =
    useFetchHook<DepartmentsListResponse>('/departments/all', 'main-departments', { staleTime: 120_000 })

  const loading = financeLoading || employeesLoading || tasksLoading || departmentsLoading

  const summary = useMemo(() => {
    const s = financeData?.data?.summary
    return {
      totalBalance: s?.total_balance ?? 0,
      monthlyIncome: s?.monthly_income ?? 0,
      totalTransactions: s?.total_transactions ?? 0,
      pendingApprovals: s?.pending_approvals ?? 0,
    }
  }, [financeData])

  const employeeCount = employeesRes?.pagination?.total_count ?? 0
  const taskCount = tasksRes?.pagination?.total_count ?? 0
  const departmentCount = departmentsRes?.data?.departments?.length ?? 0
  const recentTransactions = financeData?.data?.recent_transactions ?? []

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-start mb-8">
          <HeadingComponent heading="Dashboard" subHeading="Overview of your organization" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="min-h-[120px] rounded-[20px] border border-gray-200 bg-white p-4">
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
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="min-h-[200px] rounded-lg border border-dashed border-gray-200 bg-white p-5">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-3 w-56 mb-4" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
          <div className="min-h-[200px] rounded-lg border border-dashed border-gray-200 bg-white p-5">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-3 w-56 mb-4" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full mb-2 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <HeadingComponent heading="Dashboard" subHeading="Overview of your organization" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card
          heading="Total Employees"
          amount={String(employeeCount)}
          currency="Active workforce"
          icons={<FaUsers className="w-4 h-4" />}
          cardStyle={{ background: 'linear-gradient(135deg, #4f46a1 0%, #2f71b7 100%)' }}
          cardClassName="min-h-[120px]"
          headingClassName="text-white/90"
          amountClassName="text-white text-4xl font-semibold"
          currencyClassName="text-white/80 text-sm"
          iconBackgroundColor="#ffffff"
          iconClassName="text-gray-900 text-lg"
        />
        <Card
          heading="Total Balance"
          amount={formatCurrency(summary.totalBalance)}
          currency="XAF"
          icons={<FaMoneyBillWave className="w-4 h-4 text-white" />}
        />
        <Card
          heading="Monthly Income"
          amount={formatCurrency(summary.monthlyIncome)}
          currency="XAF"
          icons={<FaArrowTrendUp className="w-4 h-4 text-white" />}
        />
        <Card
          heading="Total Tasks"
          amount={String(taskCount)}
          currency="Across all departments"
          icons={<FaClipboardList className="w-4 h-4 text-white" />}
        />
        <Card
          heading="Departments"
          amount={String(departmentCount)}
          currency="Active departments"
          icons={<FaBuilding className="w-4 h-4 text-white" />}
        />
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/humanresource')}
            className="bg-white p-4 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center gap-2 border border-gray-100"
          >
            <FaUsers className="text-[#37A5DC] text-2xl" />
            <span className="text-sm font-regular">Human Resources</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/finance')}
            className="bg-white p-4 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center gap-2 border border-gray-100"
          >
            <FaMoneyCheckDollar className="text-[#37A5DC] text-2xl" />
            <span className="text-sm font-regular">Finance</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/generaltasks')}
            className="bg-white p-4 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center gap-2 border border-gray-100"
          >
            <FaClipboardList className="text-[#37A5DC] text-2xl" />
            <span className="text-sm font-regular">Tasks</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/projects')}
            className="bg-white p-4 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center gap-2 border border-gray-100"
          >
            <FaChartLine className="text-[#37A5DC] text-2xl" />
            <span className="text-sm font-regular">Projects</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-lg p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Recent Transactions</h3>
              <p className="text-sm text-gray-500">Latest financial activity</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard/transactions')}
              className="text-xs text-primary hover:underline"
            >
              View all
            </button>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="flex items-center justify-center min-h-[160px] text-sm text-gray-500">
              No recent transactions.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentTransactions.slice(0, 5).map((txn) => (
                <div key={txn.transaction_id} className="flex items-center gap-3 py-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      txn.transaction_type === 'Income'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {txn.transaction_type === 'Income' ? (
                      <FaArrowTrendUp className="w-4 h-4" />
                    ) : (
                      <FaReceipt className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {txn.description || txn.category}
                    </p>
                    <p className="text-xs text-gray-500">
                      {txn.category} &middot; {new Date(txn.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold whitespace-nowrap ${
                      txn.transaction_type === 'Income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {txn.transaction_type === 'Income' ? '+' : '-'}
                    {formatCurrency(txn.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Quick Stats</h3>
              <p className="text-sm text-gray-500">At a glance overview</p>
            </div>
            <FaFileInvoice className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-lg bg-blue-50">
              <p className="text-xs text-blue-600 font-medium">Transactions</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{summary.totalTransactions}</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50">
              <p className="text-xs text-amber-600 font-medium">Pending Approvals</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">{summary.pendingApprovals}</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50">
              <p className="text-xs text-green-600 font-medium">Tasks</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{taskCount}</p>
            </div>
            <div className="p-4 rounded-lg bg-purple-50">
              <p className="text-xs text-purple-600 font-medium">Departments</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{departmentCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
