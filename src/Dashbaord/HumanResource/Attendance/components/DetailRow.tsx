import React from 'react'

export const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-gray-100 bg-white p-4">
    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
    <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
  </div>
)
