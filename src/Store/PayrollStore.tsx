import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface PayrollRecord {
  id: string;
  name: string;
  basicSalary: string;
  department: string;
  payDate: string;
  bonuses: string;
  totalSalary: string;
  status: 'Pending' | 'Paid' | 'Partially Paid';
  payslipNo?: string;
  fullName: string;
  basicWage: string;
  payPeriod: string;
  paymentDate: string;
  allowance?: string;
  deductions?: string;
  jobTitle?: string;
}

interface PayrollContextType {
  payrollRecords: PayrollRecord[];
  addPayrollRecord: (record: PayrollRecord) => void;
  updatePayrollRecord: (id: string, record: Partial<PayrollRecord>) => void;
  deletePayrollRecord: (id: string) => void;
}

const PayrollContext = createContext<PayrollContextType | undefined>(undefined);

export const PayrollProvider = ({ children }: { children: ReactNode }) => {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([
    // Mock data - will be replaced with backend data
    {
      id: 'PAY-001',
      name: 'John Doe',
      basicSalary: '500000FCFA',
      department: 'Engineering',
      payDate: '31/01/2026',
      bonuses: '50000FCFA',
      totalSalary: '550000FCFA',
      status: 'Paid',
      fullName: 'John Doe',
      basicWage: '500000FCFA',
      payPeriod: 'January 2026',
      paymentDate: '31/01/2026',
    },
    {
      id: 'PAY-002',
      name: 'Jane Smith',
      basicSalary: '450000FCFA',
      department: 'Finance',
      payDate: '31/01/2026',
      bonuses: '30000FCFA',
      totalSalary: '480000FCFA',
      status: 'Pending',
      fullName: 'Jane Smith',
      basicWage: '450000FCFA',
      payPeriod: 'January 2026',
      paymentDate: '31/01/2026',
    },
  ]);

  const addPayrollRecord = (record: PayrollRecord) => {
    setPayrollRecords((prev) => [...prev, record]);
  };

  const updatePayrollRecord = (id: string, updatedRecord: Partial<PayrollRecord>) => {
    setPayrollRecords((prev) =>
      prev.map((record) =>
        record.id === id ? { ...record, ...updatedRecord } : record
      )
    );
  };

  const deletePayrollRecord = (id: string) => {
    setPayrollRecords((prev) => prev.filter((record) => record.id !== id));
  };

  return (
    <PayrollContext.Provider
      value={{
        payrollRecords,
        addPayrollRecord,
        updatePayrollRecord,
        deletePayrollRecord,
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
};

export const usePayroll = () => {
  const context = useContext(PayrollContext);
  if (context === undefined) {
    throw new Error('usePayroll must be used within a PayrollProvider');
  }
  return context;
};
