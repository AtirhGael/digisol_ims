import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
};

export interface Proposal {
  proposal_id: string;
  proposal_number: string;
  proposal_title: string;
  client_id?: string;
  lead_id?: string;
  status: string;
  description?: string;
  services?: string;
  validity?: string;
  created_at: string;
  clients?: {
    client_name: string;
  };
  leads?: {
    company_name: string;
  };
}

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

export interface Client {
  client_id: string;
  client_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
}

export const getAllProposals = async (params?: {
  status?: string;
}): Promise<{ success: boolean; data: Proposal[] }> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_BASE_URL}/proposals-contracts/proposals?${queryString}`
    : `${API_BASE_URL}/proposals-contracts/proposals`;

  const response = await axios.get(url, { headers: getAuthHeaders() });
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

export const getAllClients = async (): Promise<{ success: boolean; data: Client[] }> => {
  const response = await axios.get(`${API_BASE_URL}/client-management/clients`, { headers: getAuthHeaders() });
  return response.data;
};
