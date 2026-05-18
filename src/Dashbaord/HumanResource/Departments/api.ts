import axios from 'axios';
import type { Department, CreateDepartmentRequest, UpdateDepartmentRequest, Pagination } from './types';
import { useUserStore } from '../../../Store/UserStore';

const API_BASE_URL = (import.meta as any).env.VITE_BASE_URL || 'http://localhost:4000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = useUserStore.getState().accessToken || localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface DepartmentsResponse {
  success: boolean;
  message: string;
  data: {
    departments: Department[];
    pagination: Pagination;
  };
}

export interface SingleDepartmentResponse {
  success: boolean;
  message: string;
  data: Department;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export const useDepartments = () => {
  const fetchDepartments = async (page: number = 1, limit: number = 10) => {
    const response = await apiClient.get<DepartmentsResponse>('/departments', {
      params: { page, limit }
    });
    return response.data;
  };

  const getDepartmentById = async (departmentId: string) => {
    const response = await apiClient.get<SingleDepartmentResponse>(`/departments/${departmentId}`);
    return response.data;
  };

  return { fetchDepartments, getDepartmentById };
};

export const useCreateDepartment = () => {
  const createDepartment = async (data: CreateDepartmentRequest) => {
    const response = await apiClient.post<SingleDepartmentResponse>('/departments', data);
    return response.data;
  };

  const createSubDepartment = async (data: CreateDepartmentRequest) => {
    const response = await apiClient.post<SingleDepartmentResponse>('/departments/sub', data);
    return response.data;
  };

  return { createDepartment, createSubDepartment };
};

export const useUpdateDepartment = () => {
  const updateDepartment = async (data: UpdateDepartmentRequest) => {
    const response = await apiClient.put<SingleDepartmentResponse>(`/departments/${data.departmentId}`, data);
    return response.data;
  };

  return { updateDepartment };
};

export const useDeleteDepartment = () => {
  const deleteDepartment = async (departmentId: string) => {
    const response = await apiClient.delete<ApiResponse>(`/departments/${departmentId}`);
    return response.data;
  };

  return { deleteDepartment };
};

export const useUsers = () => {
  const fetchUsers = async (params?: { role?: string; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await apiClient.get(`/users${query}`);
    return response.data;
  };

  return { fetchUsers };
};
