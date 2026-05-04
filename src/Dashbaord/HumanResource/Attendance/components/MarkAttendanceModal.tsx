'use client';

import type { MarkAttendanceModalProps } from '../../../../Types/Types';


import { useRef, useEffect } from 'react';

export const MarkAttendanceModal: React.FC<MarkAttendanceModalProps> = ({
  isOpen,
  onClose,
  list,
  selectedStatuses,
  handleStatusChange,
  inputValues,
  handleInputChange,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className='z-10 w-full h-full bg-black/40 fixed top-0 left-0 items-center justify-center flex'>
      <div ref={modalRef} className='bg-white rounded-xl flex py-6 px-7 flex-col gap-4'>
        <div className='flex justify-between items-center'>
          <p>Mark Attendance</p>
          <button onClick={onClose} className='hover:text-secondary duration-100'>X</button>
        </div>
        <div>
          <p className='text-xs text-gray-400 font-light'>Date: <span>{new Date().toLocaleDateString()}</span></p>
        </div>
        <div className='flex flex-col gap-4'>
          <div className='flex gap-10'>
            <div className='flex flex-col gap-7'>
              <h1 className='font-medium text-gray-500'>Name</h1>
              {list.map((item) => (
                <p key={item.id} className='text-xs font-light text-gray-500'>{item.name}</p>
              ))}
            </div>
            <div className='flex flex-col gap-7'>
              <h1 className='font-medium text-gray-500'>Department</h1>
              {list.map((item) => (
                <p key={item.id} className='text-xs font-light text-gray-500'>{item.department}</p>
              ))}
            </div>
            <div className='flex flex-col gap-4 items-center'>
              <h1 className='font-medium text-gray-500'>Status</h1>
              {list.map((item) => (
                <select
                  key={item.id}
                  name="status"
                  value={selectedStatuses[item.id] || ''}
                  onChange={(e) => handleStatusChange(item.id, e.target.value)}
                  className='border border-gray-400 rounded-md px-2 py-1 text-xs w-28 text-gray-500 font-light active:border-secondary focus:border-secondary mb-1'
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="onleave">On Leave</option>
                </select>
              ))}
            </div>
            <div className='flex flex-col gap-4 items-center'>
              <h1 className='font-medium text-gray-500'>Check In</h1>
              {list.map((item) => (
                <input
                  key={item.id}
                  name="checkin"
                  value={inputValues[item.id]?.checkin || ''}
                  onChange={(e) => handleInputChange(item.id, 'checkin', e.target.value)}
                  className='border border-gray-400 rounded-md px-2 py-1 text-xs w-28 text-gray-500 font-light active:border-secondary focus:border-secondary mb-1'
                />
              ))}
            </div>
            <div className='flex flex-col gap-4 items-center'>
              <h1 className='font-medium text-gray-500'>Check Out</h1>
              {list.map((item) => (
                <input
                  key={item.id}
                  name="checkout"
                  value={inputValues[item.id]?.checkout || ''}
                  onChange={(e) => handleInputChange(item.id, 'checkout', e.target.value)}
                  className='border border-gray-400 rounded-md px-2 py-1 text-xs w-28 text-gray-500 font-light active:border-secondary focus:border-secondary mb-1'
                />
              ))}
            </div>
          </div>
          <div className='flex justify-end'>
            <button
              className='px-6 py-2 rounded-xl border flex items-center text-sm text-white bg-[#3D3C7A] gap-2 hover:opacity-80 duration-100'
              onClick={onClose}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
