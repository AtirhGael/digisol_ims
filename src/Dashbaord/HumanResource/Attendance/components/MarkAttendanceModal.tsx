'use client';

import type { MarkAttendanceModalProps } from '../../../../Types/Types';

import { useRef, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createAttendanceRecord } from '../../hrApi';

type InputValues = {
  [key: string | number]: {
    checkin?: string;
    checkout?: string;
  };
};

const STATUS_MAP: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {
  present: 'PRESENT',
  absent: 'ABSENT',
  late: 'LATE',
};

export const MarkAttendanceModal: React.FC<MarkAttendanceModalProps> = ({
  isOpen,
  onClose,
  list,
  onSubmitSuccess,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<{ [key: string]: string }>({});
  const [inputValues, setInputValues] = useState<InputValues>({});
  const [submitting, setSubmitting] = useState(false);

  const handleStatusChange = (id: string | number, value: string) => {
    setSelectedStatuses((prev) => ({ ...prev, [id]: value }));
  };

  const handleInputChange = (id: string | number, field: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleBulkSubmit = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const entries = list.filter((item) => {
      const status = selectedStatuses[item.id] || 'present';
      return status !== 'onleave';
    });

    if (entries.length === 0) {
      toast.error('No valid entries to submit.');
      return;
    }

    setSubmitting(true);
    let successCount = 0;
    let failCount = 0;

    for (const item of entries) {
      const status = selectedStatuses[item.id] || 'present';
      const apiStatus = STATUS_MAP[status];
      if (!apiStatus) continue;

      const checkin = inputValues[item.id]?.checkin || '';
      const checkout = inputValues[item.id]?.checkout || '';

      try {
        await createAttendanceRecord({
          employee_id: String(item.id),
          action: 'MANUAL_ENTRY',
          status: apiStatus,
          timestamp: checkin
            ? new Date(`${today}T${checkin}:00`).toISOString()
            : new Date(`${today}T00:00:00Z`).toISOString(),
          check_out_timestamp: checkout
            ? new Date(`${today}T${checkout}:00`).toISOString()
            : undefined,
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    setSubmitting(false);

    if (successCount > 0) {
      toast.success(`Attendance recorded for ${successCount} employee${successCount > 1 ? 's' : ''}.`);
    }
    if (failCount > 0) {
      toast.error(`Failed to record attendance for ${failCount} employee${failCount > 1 ? 's' : ''}.`);
    }

    if (successCount > 0 && onSubmitSuccess) {
      await onSubmitSuccess();
    }

    setSelectedStatuses({});
    setInputValues({});
    onClose();
  };

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
      <div ref={modalRef} className='bg-white rounded-xl w-[min(1100px,calc(100vw-2rem))] max-h-[90vh] overflow-hidden flex flex-col py-6 px-7 gap-4'>
        <div className='flex justify-between items-center'>
          <p>Mark Attendance</p>
          <button onClick={onClose} className='hover:text-secondary duration-100' disabled={submitting}>X</button>
        </div>
        <div>
          <p className='text-xs text-gray-400 font-light'>Date: <span>{new Date().toLocaleDateString()}</span></p>
        </div>
        <div className='flex-1 min-h-0 overflow-auto'>
          {list.length ? (
            <div className='min-w-190'>
              <div className='grid grid-cols-[1.6fr_1.4fr_1fr_1fr_1fr] gap-3 border-b border-gray-200 pb-3 text-sm font-medium text-gray-500'>
                <div>Name</div>
                <div>Department</div>
                <div>Status</div>
                <div>Check In</div>
                <div>Check Out</div>
              </div>

              <div className='space-y-2 pt-3'>
                {list.map((item) => (
                  <div
                    key={item.id}
                    className='grid grid-cols-[1.6fr_1.4fr_1fr_1fr_1fr] gap-3 items-center rounded-lg border border-gray-100 px-3 py-2'
                  >
                    <div className='min-w-0'>
                      <p className='truncate text-sm font-medium text-gray-900'>{item.name}</p>
                    </div>
                    <div className='min-w-0'>
                      <p className='truncate text-sm text-gray-600'>{item.department}</p>
                    </div>
                    <select
                      name="status"
                      value={selectedStatuses[item.id] || 'present'}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      disabled={submitting}
                      className='h-9 rounded-md border border-gray-300 px-2 text-sm text-gray-700 focus:border-secondary focus:outline-none'
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="onleave">On Leave</option>
                    </select>
                    <input
                      type="time"
                      name="checkin"
                      value={inputValues[item.id]?.checkin || ''}
                      placeholder="08:00"
                      onChange={(e) => handleInputChange(item.id, 'checkin', e.target.value)}
                      disabled={submitting}
                      className='h-9 rounded-md border border-gray-300 px-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-secondary focus:outline-none'
                    />
                    <input
                      type="time"
                      name="checkout"
                      value={inputValues[item.id]?.checkout || ''}
                      placeholder="17:00"
                      onChange={(e) => handleInputChange(item.id, 'checkout', e.target.value)}
                      disabled={submitting}
                      className='h-9 rounded-md border border-gray-300 px-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-secondary focus:outline-none'
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500'>
              No employees available to mark attendance.
            </div>
          )}
        </div>
        <div className='flex justify-end'>
          <button
            className='px-6 py-2 rounded-xl border flex items-center text-sm text-white bg-[#3D3C7A] gap-2 hover:opacity-80 duration-100 disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={handleBulkSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};
