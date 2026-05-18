import { Users, UserPlus, UserMinus } from 'lucide-react';
import { Card } from '../../../../components/other/Card';

interface AttendanceCardsProps {
  totalStaff: number;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
}

export const AttendanceCards: React.FC<AttendanceCardsProps> = ({
  totalStaff,
  present,
  absent,
  late,
  onLeave,
}) => {
  const safePercent = (value: number) => (totalStaff > 0 ? `${Math.round((value / totalStaff) * 100)}%` : '0%');

  return (
  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2'>
    <Card
      heading='Total Staff'
      amount={String(totalStaff)}
      icons={<Users className='text-white' size={18} />}
    />
    <Card
      heading='Present'
      amount={String(present)}
      icons={<UserPlus className='text-white' size={18} />}
      currency={safePercent(present)}
    />
    <Card
      heading='Absent'
      amount={String(absent)}
      icons={<UserMinus className='text-white' size={18} />}
      currency={safePercent(absent)}
    />
    <Card
      heading='Late'
      amount={String(late)}
      icons={<Users className='text-white' size={18} />}
      currency={safePercent(late)}
    />
    <Card
      heading='On Leave'
      amount={String(onLeave)}
      icons={<Users className='text-white' size={18} />}
      currency={safePercent(onLeave)}
    />
  </div>
)};
