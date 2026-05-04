import React from 'react';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';

export const AttendanceReportsTab: React.FC = () => (
  <div className='flex flex-col gap-6 bg-white rounded-lg p-4'>
    <div>
      <h1 className='text-lg font-medium'>Generate Attendance Report</h1>
    </div>
    <div className='flex flex-col gap-4'>
      <p className='text-xs text-gray-500'>Report Type</p>
      <div className='flex flex-col gap-2'>
        {['Daily Attendance Summary', 'Monthly Attendance Report', 'Department Attendance Analysis', 'Individual Attendance Report', 'Late Arrival Report', 'Absence Trends Report'].map((type, idx) => (
          <div key={type}>
            <button className='w-full'>
              <div className='flex gap-3 items-center border border-gray-300 border-opacity-50 px-4 py-2.5 rounded-lg text-sm text-black-300 font-medium hover:cursor-pointer hover:bg-gray-50 duration-200'>
                <div className='w-3 h-3 bg-black rounded-full'></div>
                <p>{type}</p>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
    <div className='flex gap-2 flex-col'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <Label className='text-gray-400 font-normal'>Start Date </Label>
          <Input type='text' className='mt-2 border border-gray-400' placeholder='mm/dd/yy' />
        </div>
        <div>
          <Label className='text-gray-400 font-normal'>End Date </Label>
          <Input type='text' className='mt-2 border border-gray-400' placeholder='mm/dd/yy' />
        </div>
      </div>
      <div>
        <Label className='text-gray-400 font-normal'>Description </Label>
        <Input type='text' className='mt-2 border border-gray-400' />
      </div>
    </div>
    <div className='flex justify-start gap-3'>
      <div>
        <button className='px-7 py-3 rounded-xl border flex items-center text-sm text-white bg-[#3D3C7A] gap-2 hover:opacity-80 duration-100'>
          Preview Report
        </button>
      </div>
      <div>
        <button className='px-7 py-3 rounded-xl border border-gray-400 flex items-center text-sm text-black bg-white gap-2 hover:bg-gray-50 duration-100'>
          Download PDF
        </button>
      </div>
      <div>
        <button className='px-7 py-3 rounded-xl border border-gray-400 flex items-center text-sm text-black bg-white gap-2 hover:bg-gray-50 duration-100'>
          Download Excel
        </button>
      </div>
    </div>
  </div>
);
