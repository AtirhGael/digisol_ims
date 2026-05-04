import { Send } from "lucide-react";
import type { BasicInfo, ExpenseLine, TeamMember } from '../../../../Types/Types';

interface StepReviewProps {
  basicInfo: BasicInfo;
  expenses: ExpenseLine[];
  team: TeamMember[];
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  canSubmit?: boolean;
}

export function StepReview({
  basicInfo,
  expenses,
  team,
  onBack,
  onSubmit,
  isSubmitting = false,
  canSubmit = true,
}: StepReviewProps) {
  const total = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  const ReviewField = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value || <span className="text-gray-300 font-normal">—</span>}</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Basic Info Review */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
          <h2 className="text-base font-semibold text-gray-800">Basic Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ReviewField label="Title" value={basicInfo.title} />
          <ReviewField label="City" value={basicInfo.city} />
          <ReviewField label="Region" value={basicInfo.region} />
          <ReviewField label="Venue" value={basicInfo.venue} />
          <ReviewField label="Address" value={basicInfo.address} />
          <ReviewField label="Target Audience" value={basicInfo.targetAudience} />
          <ReviewField label="Planned Start Date" value={basicInfo.startDate} />
          <ReviewField label="Planned End Date" value={basicInfo.endDate} />
          <ReviewField label="Expected Contacts" value={basicInfo.expectedContacts} />
        </div>
        {basicInfo.description && (
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Description</p>
            <p className="text-sm text-gray-800">{basicInfo.description}</p>
          </div>
        )}
        {basicInfo.successCriteria && (
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Success Criteria</p>
            <p className="text-sm text-gray-800">{basicInfo.successCriteria}</p>
          </div>
        )}
      </div>

      {/* Budget Review */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
          <h2 className="text-base font-semibold text-gray-800">Budget &amp; Resources</h2>
        </div>
        {expenses.length === 0 ? (
          <p className="text-sm text-gray-400">No expense lines added.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-gray-400 font-normal py-2 pr-4">Type</th>
                  <th className="text-left text-gray-400 font-normal py-2 pr-4">Description</th>
                  <th className="text-right text-gray-400 font-normal py-2">Amount (XAF)</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-b border-gray-50">
                    <td className="py-2.5 pr-4 text-gray-700">{e.type || "—"}</td>
                    <td className="py-2.5 pr-4 text-gray-700">{e.description || "—"}</td>
                    <td className="py-2.5 text-right text-gray-700">
                      {e.amount ? Number(e.amount).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between bg-sky-50 border-l-4 border-primary rounded-lg px-4 py-3">
          <span className="text-sm font-medium text-gray-700">Total Budget Requested</span>
          <span className="text-base font-bold text-secondary">{total.toLocaleString()} XAF</span>
        </div>
      </div>

      {/* Team Review */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
          <h2 className="text-base font-semibold text-gray-800">Team Members</h2>
        </div>
        {team.length === 0 ? (
          <p className="text-sm text-gray-400">No team members added.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {team.map((m) => (
              <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm text-primary font-medium">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                  {(m.name || "?")[0].toUpperCase()}
                </span>
                {m.name || "Unnamed"} {m.department && `· ${m.department}`}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-2">
        <button
          onClick={onBack}
          className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors order-2 sm:order-1"
        >
          Previous
        </button>
        <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
          <button className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            Save as Draft
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !canSubmit}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              isSubmitting || !canSubmit
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/80'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={14} />
                Submit for Approval
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
