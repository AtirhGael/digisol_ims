import { FaFileInvoice } from 'react-icons/fa6';

interface BudgetMetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const BudgetMetricCard: React.FC<BudgetMetricCardProps> = ({
  title,
  value,
  subtitle,
  icon = <FaFileInvoice />
}) => {
  return (
    // Simple metric card with optional icon.
    <div className={`rounded-lg p-6 text-white relative overflow-hidden`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium opacity-90">{title}</h3>
        <div>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold">{value}</p>
        {subtitle && <p className="text-xs opacity-80">{subtitle}</p>}
      </div>
    </div>
  );
};

export default BudgetMetricCard;
