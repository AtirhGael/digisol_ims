import { ArrowLeft, BriefcaseBusiness, CalendarClock, CircleCheckBig, Users } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { useFetchHook } from "../../../Hooks/UseFetchHook"
import { Button } from "../../../components/ui/button"
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading"
import { ChartBarHorizontal } from "./component/ChartBarHorizontal"
import type { HrRecruitmentPipelineSummary } from "../hrApi"

export function RecruitmentPipelineDetails() {
  const navigate = useNavigate()
  // Expand the compact dashboard pipeline card into the full backend stage breakdown.
  const { data, isLoading } = useFetchHook<{
    success: boolean
    message: string
    data: HrRecruitmentPipelineSummary
  }>("/employees/recruitment/pipeline-summary", "hr-recruitment-pipeline-details")

  const pipelineSummary = data?.data
  const recruitmentPipelineData = pipelineSummary?.stages ?? []
  const summaryCards = pipelineSummary?.summary_cards
  const totalCandidates = summaryCards?.total_value ?? 0

  if (isLoading) {
    return <SkeletonLoading />
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => navigate("/dashboard/humanresource")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to HR Dashboard
      </button>

      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Recruitment Pipeline Details</h1>
            <p className="mt-1 text-sm text-gray-500">
              Live summary from backend HR records for activation, start dates, and active employees.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/dashboard/tasks")}>
              View HR Tasks
            </Button>
            <Button onClick={() => navigate("/dashboard/employees")}>
              Employee Directory
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{summaryCards?.total_label ?? "Total Records"}</span>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-gray-900">{totalCandidates}</p>
          <p className="mt-1 text-xs text-gray-500">{summaryCards?.total_description}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{summaryCards?.primary_rate_label ?? "Primary Rate"}</span>
            <BriefcaseBusiness className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-gray-900">{summaryCards?.primary_rate_value ?? "0%"}</p>
          <p className="mt-1 text-xs text-gray-500">{summaryCards?.primary_rate_description}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{summaryCards?.secondary_rate_label ?? "Secondary Rate"}</span>
            <CircleCheckBig className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-gray-900">{summaryCards?.secondary_rate_value ?? "0%"}</p>
          <p className="mt-1 text-xs text-gray-500">{summaryCards?.secondary_rate_description}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{summaryCards?.next_review_label ?? "Next Review"}</span>
            <CalendarClock className="h-5 w-5 text-violet-500" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-gray-900">{summaryCards?.next_review_value ?? "N/A"}</p>
          <p className="mt-1 text-xs text-gray-500">{summaryCards?.next_review_description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <ChartBarHorizontal
            data={recruitmentPipelineData}
            showCard={false}
            title="Recruitment Pipeline"
            description="Backend-driven HR intake summary"
            ctaLabel="Back to Dashboard"
            ctaTo="/dashboard/humanresource"
            maxValue={Math.max(...recruitmentPipelineData.map((item) => item.value), 1)}
          />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Stage Breakdown</h2>
          <p className="mt-1 text-sm text-gray-500">Current volume at each hiring step</p>
          <div className="mt-6 space-y-4">
            {recruitmentPipelineData.map((item) => (
              <div key={item.stage} className="rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{item.stage}</span>
                  <span className="text-lg font-semibold text-gray-900">{item.value}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{
                      width: `${totalCandidates > 0 ? (item.value / totalCandidates) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
