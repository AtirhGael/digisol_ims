import type { OnboardingType } from "../onboardingData";

type OnboardingHeaderProps = {
  showTypeSelector: boolean;
  onToggleTypeSelector: () => void;
  onStartForm: (type: OnboardingType) => void;
};

export function OnboardingHeader({
  showTypeSelector,
  onToggleTypeSelector,
  onStartForm,
}: OnboardingHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-gray-900">
          Staff & Interns Onboarding
        </h1>
        <p className="text-sm text-gray-500">
          Track and manage new employee and intern onboarding processes
        </p>
      </div>

      <div className="relative flex flex-wrap gap-2">
        <button
          className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-[#35345f]"
          onClick={(event) => {
            event.stopPropagation();
            onToggleTypeSelector();
          }}
        >
          + Start New Onboarding
        </button>

        {showTypeSelector ? (
          <div
            className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Select Type
            </p>
            <button
              type="button"
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              onClick={() => onStartForm("employee")}
            >
              Employee Onboarding
            </button>
            <button
              type="button"
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              onClick={() => onStartForm("intern")}
            >
              Intern Onboarding
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
