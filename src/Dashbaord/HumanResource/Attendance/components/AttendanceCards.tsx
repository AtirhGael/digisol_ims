import { Users, UserPlus, UserMinus } from 'lucide-react';
import { Card } from '../../../../components/other/Card';

interface AttendanceCardsProps {}

export const AttendanceCards: React.FC<AttendanceCardsProps> = () => (
  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2'>
    <Card
      heading='Total Staff'
      amount='10'
      icons={<Users className='text-white' size={18} />}
    />
    <Card
      heading='Present'
      amount='10'
      icons={<UserPlus className='text-white' size={18} />}
      currency='100%'
    />
    <Card
      heading='Absent'
      amount='0'
      icons={<UserMinus className='text-white' size={18} />}
      currency='0%'
    />
    <Card
      heading='Late'
      amount='2'
      icons={<Users className='text-white' size={18} />}
      currency='20%'
    />
    <Card
      heading='On Leave'
      amount='0'
      icons={<Users className='text-white' size={18} />}
      currency='0%'
    />
  </div>
);
