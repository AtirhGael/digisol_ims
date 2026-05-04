import React from "react";

export const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-white placeholder:text-gray-300 transition-all";
const selectCls = `${inputCls} appearance-none cursor-pointer`;

export function Field({ 
  label, 
  required, 
  children 
}: { 
  label: string; 
  required?: boolean; 
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export function SelectField({ 
  value, 
  onChange, 
  children 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select 
        className={selectCls} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▾</span>
    </div>
  );
}

export function TextAreaField({ 
  value, 
  onChange, 
  placeholder, 
  rows = 4 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  placeholder?: string; 
  rows?: number;
}) {
  return (
    <textarea
      className={inputCls}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
  );
}

export function SectionCard({ 
  title, 
  subtitle, 
  children 
}: { 
  title: string; 
  subtitle?: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 transition-all duration-200 hover:shadow-md">
      <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-gray-400 mb-6">{subtitle}</p>}
      {children}
    </div>
  );
}