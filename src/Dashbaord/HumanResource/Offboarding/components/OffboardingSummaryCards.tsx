import type React from "react";
import { Briefcase, UserMinus, Users } from "lucide-react";
import { Card } from "../../../../components/other/Card";
import type { OffboardingFilter } from "../offboardingData";

const SUMMARY_CARDS: {
  key: OffboardingFilter;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "all", label: "Total Active Staff", subtitle: "Ready for offboarding", icon: UserMinus },
  { key: "employee", label: "Active Employees", subtitle: "Employee records", icon: Briefcase },
  { key: "intern", label: "Active Interns", subtitle: "Intern records", icon: Users },
];

type OffboardingSummaryCardsProps = {
  activeFilter: OffboardingFilter;
  counts: Record<OffboardingFilter, number>;
  onChange: (filter: OffboardingFilter) => void;
};

export function OffboardingSummaryCards({
  activeFilter,
  counts,
  onChange,
}: OffboardingSummaryCardsProps) {
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
