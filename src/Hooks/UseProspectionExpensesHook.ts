import { useState } from "react";
import axios from "axios";
import { useUserStore } from '../Store/UserStore';

interface Expense {
  expense_id: string;
  expense_date: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  receipt_url: string | null;
  recorded_by: {
    user_id: string;
    name: string;
    email: string;
  };
  created_at: string;
}

interface ExpenseSummary {
  total_expenses: number;
  budget_allocated: number;
  budget_remaining: number;
  currency: string;
}

interface AddExpenseRequest {
  expense_date: string;
  category: string;
  description: string;
  amount: number;
  currency?: string;
  receipt_url?: string;
}

interface ExpenseResponse {
  expenses: Expense[];
  summary: ExpenseSummary;
}

const useProspectionExpenses = (prospectionId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = useUserStore.getState().accessToken;
      const response = await axios.get(
        `${(import.meta as any).env.VITE_BASE_URL}/business-development/prospections/${prospectionId}/expenses`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data: ExpenseResponse = response.data.data;
      setExpenses(data.expenses);
      setSummary(data.summary);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch expenses");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (data: AddExpenseRequest) => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = useUserStore.getState().accessToken;
      const response = await axios.post(
        `${(import.meta as any).env.VITE_BASE_URL}/business-development/prospections/${prospectionId}/expenses`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      await fetchExpenses(); // Refresh the list
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add expense");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeExpense = async (expenseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = useUserStore.getState().accessToken;
      const response = await axios.delete(
        `${(import.meta as any).env.VITE_BASE_URL}/business-development/prospections/${prospectionId}/expenses/${expenseId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      await fetchExpenses(); // Refresh the list
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove expense");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { 
    expenses, 
    summary,
    loading, 
    error, 
    fetchExpenses, 
    addExpense, 
    removeExpense 
  };
};

export default useProspectionExpenses;