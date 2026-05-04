'use client'

import { useState, useEffect, useRef } from 'react'
import { FaClock } from 'react-icons/fa'
import { Ellipsis } from 'lucide-react';
import { AttendanceCards } from './components/AttendanceCards';
import { MarkAttendanceModal } from './components/MarkAttendanceModal';
import { TodayAttendanceTab } from '../Attendance/tabs/TodayAttendanceTab';
import { AttendanceHistoryTab } from '../Attendance/tabs/AttendanceHistoryTab';
import { AttendanceReportsTab } from '../Attendance/tabs/AttendanceReportsTab';
import { AttendanceSettingsTab } from '../Attendance/tabs/AttendanceSettingsTab';

import type { AttendanceProps, InputValues } from '../../../Types/Types';
import { attendanceList, attendanceTabTitles, attendanceHistoryData } from '../../../data/attendanceData';






export const Attendance = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<{[key: string]: string}>({});
  const [inputValues, setInputValues] = useState<InputValues>({})
  const [activeIndex, setActiveIndex] = useState(0);
  const tabTitles = attendanceTabTitles;

  // Today's attendance — plain array; ReusableTable handles filtering/pagination
  const list = attendanceList.map(item => ({ ...item }));

  const handleStatusChange = (id: string | number, value: string) => {
    setSelectedStatuses(prev => ({ ...prev, [id]: value }));
  };

  const handleInputChange = (id: number | string, field: string, value: string) => {
    setInputValues(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  // Attendance History — date is the first filter (external), status/search handled by ReusableTable
  const attendanceHistory = attendanceHistoryData;
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(attendanceHistory[0].date);
  const selectedHistoryRecords = (
    attendanceHistory.find(h => h.date === selectedHistoryDate) || attendanceHistory[0]
  ).records;

  const renderTabContent = () => {
    switch (activeIndex) {
      case 0:
        return <TodayAttendanceTab data={list} />;
      case 1:
        return (
          <AttendanceHistoryTab
            records={selectedHistoryRecords}
            attendanceHistory={attendanceHistory}
            selectedHistoryDate={selectedHistoryDate}
            setSelectedHistoryDate={setSelectedHistoryDate}
          />
        );
      case 2:
        return <AttendanceReportsTab />;
      case 3:
        return <AttendanceSettingsTab />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className='flex flex-col gap-5'>
        {/* Header section */}
        <div className='flex justify-between items-center'>
          <div className='flex flex-col gap-1'>
            <h1 className='font-bold text-2xl'>Attendance Tracking</h1>
            <p className='font-light text-gray-500 text-xs'>
              Friday, 12 January 2024
            </p>
          </div>
          <div>
            <button 
              className='px-7 py-3 rounded-xl border flex items-center text-sm text-white bg-[#3D3C7A] gap-2 hover:opacity-85 duration-100'
              onClick={() => setIsOpen(true)}
            >
              < FaClock /> Mark Attendance
            </button>
          </div>
        </div>
        {/* Cards section */}
        <AttendanceCards />
        {/* Body section with tabs */}
        <div className='flex flex-wrap border-b-2 border-gray-200'>
          {tabTitles.map((title, index) => (
            <button
              key={index}
              className={`px-4 sm:px-8 md:px-12 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-gray-500 font-medium ${activeIndex === index ? 'text-primary border-b-2 border-primary' : 'hover:opacity-70 duration-100'} hover:cursor-pointer`}
              onClick={() => setActiveIndex(index)}
            >{title}</button>
          ))}
        </div>
        {/* Tabs Content */}
        <div>
          {renderTabContent()}
        </div>
      </div>
      {/* Mark Attendance Modal */}
      <MarkAttendanceModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        list={list}
        selectedStatuses={selectedStatuses}
        handleStatusChange={handleStatusChange}
        inputValues={inputValues}
        handleInputChange={handleInputChange}
      />
    </>
  )
}
