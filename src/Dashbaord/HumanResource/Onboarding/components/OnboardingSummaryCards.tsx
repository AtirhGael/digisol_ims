import type React from "react";
import { Briefcase, UserPlus, Users } from "lucide-react";

import { Card } from "../../../../components/other/Card";
import type { OnboardingFilter } from "../onboardingData";

const SUMMARY_CARDS: {
  key: OnboardingFilter;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "all", label: "Total Onboarding", subtitle: "Active onboarding", icon: UserPlus },
  { key: "employee", label: "Employee Onboarding", subtitle: "Employee records", icon: Briefcase },
  { key: "intern", label: "Interns Onboarding", subtitle: "Intern records", icon: Users },
];

type OnboardingSummaryCardsProps = {
  activeFilter: OnboardingFilter;
  counts: Record<OnboardingFilter, number>;
  onChange: (filter: OnboardingFilter) => void;
};

export function OnboardingSummaryCards({
  activeFilter,
  counts,
  onChange,
}: OnboardingSummaryCardsProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-4">
      {SUMMARY_CARDS.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.key;

        return (
          <Card
            key={card.key}
            asButton
            onClick={() => onChange(card.key)}
            ariaPressed={isActive}
            heading={card.label}
            amount={String(counts[card.key])}
            icons={<Icon className="h-5 w-5 text-white" />}
            currency={card.subtitle}
            cardClassName={`min-h-[120px] h-auto transition-all ${
              isActive
                ? "bg-linear-to-br from-[#2f5bff] to-[#3b3a7a] ring-2 ring-primary/40 border-transparent shadow-md"
                : "hover:border-primary/30 hover:shadow-md"
            }`}
            headingClassName={isActive ? "text-white" : "text-gray-900"}
            amountClassName={isActive ? "text-white" : "text-gray-900"}
            currencyClassName={isActive ? "text-white/80" : "text-primary"}
          />
        );
      })}
    </div>
  );
}
