import React from 'react';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import { Save } from 'lucide-react';

export const AttendanceSettingsTab: React.FC = () => (
  <div className='flex flex-col gap-6 bg-white rounded-lg p-4'>
    <div>
      <h1 className='text-lg font-medium'>Attendance Configuration</h1>
    </div>
    <div className='flex gap-2 flex-col'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <Label className='text-gray-400 font-normal'>Standard Work Start Time </Label>
          <Input type='text' className='mt-2 border border-gray-400' placeholder='8:00' />
        </div>
        <div>
          <Label className='text-gray-400 font-normal'>Standard Work End Time </Label>
          <Input type='text' className='mt-2 border border-gray-400' placeholder='17:00' />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <Label className='text-gray-400 font-normal'>Late Threshold (minutes)</Label>
          <Input type='text' className='mt-2 border border-gray-400' placeholder='30' />
        </div>
        <div>
          <Label className='text-gray-400 font-normal'>Auto-mark Absent Afer </Label>
          <Input type='text' className='mt-2 border border-gray-400' placeholder='10:00' />
        </div>
      </div>
      <div>
        <Label className='text-gray-400 font-normal'>Attendance Method </Label>
        <Input type='text' className='mt-2 border border-gray-400' />
      </div>
    </div>
    <div className='flex flex-col gap-2'>
      <p className='text-sm text-gray-700'>Alert Settings</p>
      <div className='flex flex-col gap-1'>
        <div>
          <div className='flex gap-3 items-center px-4 py-2.5 rounded-lg text-sm text-black-10 font-normal hover:cursor-pointer'>
            <button className='w-4 h-4 bg-gray-200 rounded-xs hover:cursor-pointer'></button>
            <p>Alert department head when staff is absent</p>
          </div>
        </div>
        <div>
          <div className='flex gap-3 items-center px-4 py-2.5 rounded-lg text-sm text-black-10 font-normal hover:cursor-pointer'>
            <button className='w-4 h-4 bg-gray-200 rounded-xs hover:cursor-pointer'></button>
            <p>Alert HR when late arrivals exceed 3 per month</p>
          </div>
        </div>
        <div>
          <div className='flex gap-3 items-center px-4 py-2.5 rounded-lg text-sm text-black-10 font-normal hover:cursor-pointer'>
            <button className='w-4 h-4 bg-gray-200 rounded-xs hover:cursor-pointer'></button>
            <p>Alert Employee for consecutive absences</p>
          </div>
        </div>
      </div>
    </div>
    <div>
      <button className='px-6 py-3 rounded-xl border flex items-center text-sm text-white bg-[#3D3C7A] gap-2 hover:opacity-80 duration-100'>
        <Save /> Save Settings
      </button>
    </div>
  </div>
);
