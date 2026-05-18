import { Send, Plus, X } from "lucide-react";
import type { ExpenseLine, TeamMember } from '../../../../Types/Types';
import { inputClass } from './uiConstants';
import { BUDGET_TYPES } from '../../../../data/prospectionData';
import { CustomSelect } from '../../../../components/ui/CustomSelect';
import useFetchHook from '../../../../Hooks/UseFetchHook';

interface StepBudgetTeamProps {
  expenses: ExpenseLine[];
  team: TeamMember[];
  onAddExpense: () => void;
  onRemoveExpense: (id: number) => void;
  onExpenseChange: (id: number, field: keyof Omit<ExpenseLine, "id">, value: string) => void;
  onAddTeamMember: () => void;
  onRemoveTeamMember: (id: number) => void;
  onTeamChange: (id: number, field: keyof Omit<TeamMember, "id">, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

type Department = {
  department_id: string;
  department_name: string;
}

type DepartmentListResponse = {
  data?: Department[];
  departments?: Department[];
}

const FALLBACK_DEPARTMENTS = [
  'Administration',
  'Business Developments',
  'Construction',
  'Solar Energy',
  'Development department',
  'Facility Management',
  'Finance',
  'Human Resource',
  'Manage and Professional Services',
  'Project Management'
];

export function StepBudgetTeam({
  expenses,
  team,
  onAddExpense,
  onRemoveExpense,
  onExpenseChange,
  onAddTeamMember,
  onRemoveTeamMember,
  onTeamChange,
  onBack,
  onNext,
}: StepBudgetTeamProps) {
  const { data: departmentsResponse } = useFetchHook<DepartmentListResponse | Department[]>(
    '/users/departments',
    'prospection-team-departments'
  );

  const departments = Array.isArray(departmentsResponse)
    ? departmentsResponse
    : departmentsResponse?.data || departmentsResponse?.departments || [];

  const departmentOptions = departments.length
    ? departments.map((dept) => ({
        value: dept.department_name,
        label: dept.department_name,
      }))
    : FALLBACK_DEPARTMENTS.map(dept => ({
        value: dept,
        label: dept
      }));
  const total = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  return (
    <div className="flex flex-col gap-3 sm:gap-5">
      {/* Budget & Resources */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-6 flex flex-col gap-3 sm:gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
            <h2 className="text-sm sm:text-base font-semibold text-gray-800">Budget &amp; Resources</h2>
          </div>
        </div>

        {/* Expense lines */}
        <div className="flex flex-col gap-2 sm:gap-3">
          {/* Desktop header */}
          <div className="hidden sm:grid sm:grid-cols-[20%_60%_auto] gap-3 px-1 pb-2">
            <span className="text-xs font-semibold text-gray-600">Budget Type</span>
            <span className="text-xs font-semibold text-gray-600 pl-2">Description</span>
            <span className="text-xs font-semibold text-gray-600 text-right pr-12">Amount (XAF)</span>
          </div>
          
          {expenses.map((expense) => (
            <div key={expense.id} className="flex flex-col sm:grid sm:grid-cols-[20%_60%_auto] gap-3 p-3 sm:p-4 bg-gray-50/50 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
              <div className="sm:col-span-1">
                <label className="sm:hidden text-xs font-medium text-gray-500 mb-1 block">Budget Type</label>
                <CustomSelect
                  options={BUDGET_TYPES.map(type => ({ value: type, label: type }))}
                  value={expense.type}
                  onChange={(value) => onExpenseChange(expense.id, "type", value)}
                  placeholder="Select Type"
                  className="w-full bg-white"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="sm:hidden text-xs font-medium text-gray-500 mb-1 block pl-2">Description</label>
                <textarea
                  className={`${inputClass} w-full resize-none min-h-15 sm:min-h-10 pl-2`}
                  placeholder="Enter description..."
                  value={expense.description}
                  onChange={(e) => onExpenseChange(expense.id, "description", e.target.value)}
                />
              </div>
              <div className="flex items-start gap-2 sm:col-span-1">
                <label className="sm:hidden text-xs font-medium text-gray-500 mb-1 block">Amount</label>
                <input
                  type="number"
                  className={`${inputClass} w-full text-right pr-2`}
                  placeholder="0"
                  min={0}
                  value={expense.amount}
                  onChange={(e) => onExpenseChange(expense.id, "amount", e.target.value)}
                />
                <button
                  onClick={() => onRemoveExpense(expense.id)}
                  className="text-red-400 hover:text-red-600 shrink-0 p-2 rounded hover:bg-red-50 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add expense */}
        <button
          onClick={onAddExpense}
          className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 border border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 w-fit hover:bg-gray-50 transition-colors"
        >
          <Plus size={14} />
          Add Expense Line
        </button>

        {/* Total */}
        <div className="flex items-center justify-between bg-sky-50 border-l-4 border-primary rounded-lg px-3 sm:px-4 py-2.5 sm:py-3.5 mt-1">
          <span className="text-xs sm:text-sm font-medium text-gray-700">Total Budget Requested</span>
          <span className="text-sm sm:text-base font-bold text-secondary">
            {total.toLocaleString()} XAF
          </span>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-6 flex flex-col gap-3 sm:gap-5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
          <h2 className="text-sm sm:text-base font-semibold text-gray-800">Team Members</h2>
        </div>

        {/* Member rows */}
        <div className="flex flex-col gap-2 sm:gap-3">
          {team.map((member) => (
            <div key={member.id} className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <CustomSelect
                options={departmentOptions}
                value={member.department}
                onChange={(value) => onTeamChange(member.id, "department", value)}
                placeholder="Select Department"
                className="flex-1 min-w-0"
              />
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  className={`${inputClass} flex-1 min-w-0`}
                  placeholder="Team Member"
                  value={member.name}
                  onChange={(e) => onTeamChange(member.id, "name", e.target.value)}
                />
                <button
                  onClick={() => onRemoveTeamMember(member.id)}
                  className="text-red-400 hover:text-red-600 shrink-0 p-1 rounded hover:bg-red-50 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add team member */}
        <button
          onClick={onAddTeamMember}
          className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 border border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 w-fit hover:bg-gray-50 transition-colors"
        >
          <Plus size={14} />
          Add Team Member
        </button>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 pt-2">
        <button
          onClick={onBack}
          className="px-4 sm:px-6 py-2 sm:py-2.5 border border-gray-200 text-gray-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-primary/80 transition-colors"
        >
          <Send size={14} />
          Submit for Approval
        </button>
      </div>
    </div>
  );
}
