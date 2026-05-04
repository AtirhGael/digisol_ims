import axios from 'axios';
import { useUserStore } from '../../../../Store/UserStore';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

const getAuthHeaders = () => {
  const accessToken = useUserStore.getState().accessToken;
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
};

export interface Proforma {
  proforma_id: string;
  proforma_number: string;
  proforma_title: string;
  proposal_id?: string;
  status: string;
  proforma_value: number;
  currency: string;
  created_at: string;
  proposals?: {
    proposal_title: string;
  };
}

export interface Service {
  service_id: string;
  service_code: string;
  service_name: string;
  service_category: string;
  description?: string;
  price: number;
  currency: string;
  service_type: string;
  is_active: boolean;
}

export interface ContractService {
  service_id: string;
  quantity: number;
  unit_price: number;
  start_date: string;
  end_date?: string;
}

export interface Contract {
  contract_id: string;
  contract_number?: string;
  contract_title: string;
  client_id?: string;
  proposal_id?: string;
  proforma_id?: string;
  description?: string;
  renewal_type?: string;
  billing_cycle?: string;
  next_billing_date?: string;
  start_date: string;
  end_date: string;
  contract_value: number;
  currency: string;
  document_url?: string;
  status: string;
  signed_date?: string;
  termination_date?: string;
  termination_reason?: string;
  created_at: string;
  clients?: {
    client_name: string;
    contact_person?: string;
  };
  proposals?: {
    proposal_number?: string;
    proposal_title?: string;
    lead_id?: string;
  };
  proforma_invoices?: {
    proforma_number?: string;
    proforma_title?: string;
  };
  users?: {
    first_name: string;
    last_name: string;
  };
  contract_services?: ContractService[];
}

export interface ContractListResponse {
  success: boolean;
  message: string;
  data: Contract[];
}

export interface ContractDetailResponse {
  success: boolean;
  message: string;
  data: Contract;
}

export interface CreateContractRequest {
  contract_title: string;
  proforma_id: string;
  description?: string;
  renewal_type?: string;
  billing_cycle?: string;
  next_billing_date?: string;
  services?: string[];
  start_date: string;
  end_date: string;
  contract_value: number;
  currency?: string;
  document_url?: string;
  status?: string;
}

export interface UpdateContractRequest extends Partial<CreateContractRequest> {
  signed_date?: string;
  termination_date?: string;
  termination_reason?: string;
}

export const getAllContracts = async (params?: {
  status?: string;
  client_id?: string;
}): Promise<ContractListResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.status) queryParams.append('status', params.status);
  if (params?.client_id) queryParams.append('client_id', params.client_id);

  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_BASE_URL}/proposals-contracts/contracts?${queryString}`
    : `${API_BASE_URL}/proposals-contracts/contracts`;

  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
};

export const getContractById = async (contractId: string): Promise<ContractDetailResponse> => {
  const response = await axios.get(`${API_BASE_URL}/proposals-contracts/contracts/${contractId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const createContract = async (data: CreateContractRequest): Promise<{ success: boolean; message: string; data: Contract }> => {
  const response = await axios.post(`${API_BASE_URL}/proposals-contracts/contracts`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateContract = async (
  contractId: string,
  data: UpdateContractRequest
): Promise<{ success: boolean; message: string; data: Contract }> => {
  const response = await axios.put(`${API_BASE_URL}/proposals-contracts/contracts/${contractId}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const deleteContract = async (contractId: string): Promise<{ success: boolean; message: string }> => {
  const response = await axios.delete(`${API_BASE_URL}/proposals-contracts/contracts/${contractId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getAllProformas = async (params?: {
  status?: string;
}): Promise<{ success: boolean; data: Proforma[] }> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_BASE_URL}/proposals-contracts/proforma-invoices?${queryString}`
    : `${API_BASE_URL}/proposals-contracts/proforma-invoices`;

  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
};

export const getAllServices = async (): Promise<{ success: boolean; data: Service[] }> => {
  const response = await axios.get(`${API_BASE_URL}/services`, { headers: getAuthHeaders() });
  return response.data;
};

export const getClientContracts = async (clientId: string, params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ContractListResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_BASE_URL}/client-management/clients/${clientId}/contracts?${queryString}`
    : `${API_BASE_URL}/client-management/clients/${clientId}/contracts`;

  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
};
