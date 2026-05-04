import axios from 'axios';
import { useUserStore } from '../../../Store/UserStore';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

const getAuthHeaders = () => {
  // Prefer in-memory token, fall back to localStorage.
  const accessToken =
    useUserStore.getState().accessToken || localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
};

export interface Interaction {
  interaction_id: string;
  interaction_type: string;
  interaction_date: string;
  duration_minutes?: number;
  summary: string;
  action_items: string[];
  next_steps: any[];
  recorded_by: string;
  recorded_by_name: string;
  created_at: string;
}

export interface InteractionListResponse {
  success: boolean;
  message: string;
  data: Interaction[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateInteractionRequest {
  client_id?: string;
  lead_id?: string;
  interaction_name: string;
  interaction_date: string;
  duration_minutes?: number;
  people_involved?: string[];
  summary?: string;
  next_steps?: any[];
}

export const getClientInteractions = async (
  clientId: string,
  params?: {
    page?: number;
    limit?: number;
    interaction_type?: string;
  }
): Promise<InteractionListResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.interaction_type) queryParams.append('interaction_type', params.interaction_type);

  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_BASE_URL}/client-management/clients/${clientId}/interactions?${queryString}`
    : `${API_BASE_URL}/client-management/clients/${clientId}/interactions`;

  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
};

export const getLeadInteractions = async (
  leadId: string,
  params?: {
    page?: number;
    limit?: number;
    interaction_type?: string;
  }
): Promise<InteractionListResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.interaction_type) queryParams.append('interaction_type', params.interaction_type);

  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_BASE_URL}/client-management/leads/${leadId}/interactions?${queryString}`
    : `${API_BASE_URL}/client-management/leads/${leadId}/interactions`;

  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
};

export const createInteraction = async (
  entityType: 'client' | 'lead',
  entityId: string,
  data: CreateInteractionRequest
): Promise<{ success: boolean; message: string; data: Interaction }> => {
  const endpoint = entityType === 'client' 
    ? `/client-management/clients/${entityId}/interactions`
    : `/client-management/leads/${entityId}/interactions`;

  const payload = {
    ...data,
    [entityType === 'client' ? 'client_id' : 'lead_id']: entityId
  };

  const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateInteraction = async (
  interactionId: string,
  data: Partial<CreateInteractionRequest>
): Promise<{ success: boolean; message: string; data: Interaction }> => {
  const response = await axios.put(`${API_BASE_URL}/client-management/interactions/${interactionId}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const deleteInteraction = async (
  interactionId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await axios.delete(`${API_BASE_URL}/client-management/interactions/${interactionId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
