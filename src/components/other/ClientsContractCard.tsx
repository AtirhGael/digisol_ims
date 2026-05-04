import React from 'react'

interface ContractCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

export const ContractCard = ({ icon, title, value }: ContractCardProps) => {
  return (
    <div className="bg-white rounded-lg px-2 py-3 shadow-xs">
      <div className="flex items-center gap-1 mb-4">
        {icon}
        <span className="text-xs text-gray-500 tracking-wider">{title}</span>
      </div>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  )
}
