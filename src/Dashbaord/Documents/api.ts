import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${accessToken}`,
  };
};

export interface Document {
  document_id: string;
  filename: string;
  description?: string;
  file_url: string;
  file_size: string;
  file_type: string;
  mime_type?: string;
  category?: string;
  uploaded_by: string;
  upload_date: string;
  departments?: string[];
  roles?: string[];
}

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  data: {
    document_id: string;
    document_name: string;
    file_url: string;
    file_size: string;
    file_type: string;
    mime_type: string;
    description: string;
    created_at: string;
    allowed_departments: string[];
    allowed_roles: string[];
  };
}

export interface DocumentListResponse {
  success: boolean;
  message: string;
  data: Document[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DocumentStatsResponse {
  success: boolean;
  message: string;
  data: {
    total_documents: number;
    total_size_bytes: string;
    file_types: Array<{
      type: string;
      count: number;
    }>;
  };
}

export const uploadDocument = async (
  file: File,
  description: string,
  allowedRoles: string[]
): Promise<DocumentUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', description);
  formData.append('allowed_roles', JSON.stringify(allowedRoles));

  const response = await axios.post(`${API_BASE_URL}/v1/documents/upload-direct`, formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getDocuments = async (
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    file_type?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<DocumentListResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.file_type) queryParams.append('file_type', params.file_type);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_BASE_URL}/v1/documents?${queryString}`
    : `${API_BASE_URL}/v1/documents`;

  const response = await axios.get(url, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const getDocumentById = async (documentId: string): Promise<{ success: boolean; message: string; data: Document }> => {
  const response = await axios.get(`${API_BASE_URL}/v1/documents/${documentId}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const updateDocument = async (
  documentId: string,
  data: {
    description?: string;
    category?: string;
    tags?: string[];
    allowed_roles?: string[];
  }
): Promise<{ success: boolean; message: string; data: any }> => {
  const response = await axios.put(`${API_BASE_URL}/v1/documents/${documentId}`, data, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

export const deleteDocument = async (documentId: string): Promise<{ success: boolean; message: string }> => {
  const response = await axios.delete(`${API_BASE_URL}/v1/documents/${documentId}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const downloadDocument = async (documentId: string): Promise<Blob> => {
  const response = await axios.get(`${API_BASE_URL}/v1/documents/${documentId}/download`, {
    headers: getAuthHeaders(),
    responseType: 'blob',
  });

  return response.data;
};

export const getDocumentStats = async (): Promise<DocumentStatsResponse> => {
  const response = await axios.get(`${API_BASE_URL}/v1/documents/stats`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};
