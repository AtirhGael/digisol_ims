import type { OffboardingType } from "../offboardingData";

type OffboardingHeaderProps = {
  showTypeSelector: boolean;
  onToggleTypeSelector: () => void;
  onStartOffboarding: (type: OffboardingType) => void;
};

export function OffboardingHeader({
  showTypeSelector,
  onToggleTypeSelector,
  onStartOffboarding,
}: OffboardingHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-gray-900">
          Staff & Interns Offboarding
        </h1>
        <p className="text-sm text-gray-500">
          Manage the offboarding process for employees and interns leaving the company
        </p>
      </div>

      <div className="relative flex flex-wrap gap-2">
        <button
          className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-[#35345f] transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onToggleTypeSelector();
          }}
        >
           Start Offboarding
        </button>

        {showTypeSelector ? (
          <div
            className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Select Type
            </p>
            <button
              type="button"
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              onClick={() => onStartOffboarding("employee")}
            >
              Employee Offboarding
            </button>
            <button
              type="button"
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              onClick={() => onStartOffboarding("intern")}
            >
              Intern Offboarding
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
