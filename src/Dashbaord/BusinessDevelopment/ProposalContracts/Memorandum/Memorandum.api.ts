import { useUserStore } from "@/Store/UserStore";
import { 
  Memorandum, 
  MemorandumApiResponse, 
  MemorandumFormPayload} from "./Memorandum.types";
import { getDocumentPublicUrl } from "../utils/document";
import { uploadFileToSupabase } from "@/config/fileUpload";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000/api/v1";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const getAuthHeaders = (): HeadersInit => {
  const token = useUserStore.getState().accessToken || localStorage.getItem("accessToken");
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getJsonHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  ...getAuthHeaders(),
});

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...getJsonHeaders(),
      ...(init?.headers || {}),
    },
  });

  const text = await response.text();
  let body: any = {};
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = {};
    }
  }

  if (!response.ok) {
    const message = body?.error || body?.message || "Request failed";
    throw new Error(message);
  }

  return body as T;
};

export const mapMemorandumToFrontend = (item: MemorandumApiResponse): Memorandum => {
  return {
    id: item.memorandum_id,
    thirdPartyName: item.third_party_name,
    contractId: item.contract_id,
    contractTitle: item.contracts?.contract_title,
    contractNumber: item.contracts?.contract_number,
    thirdPartyNameLocal: item.contracts?.clients?.client_name,
    thirdPartyRoleDescription: item.third_party_role_description,
    digisolRoleDescription: item.digisol_role_description,
    thirdPartyPercentageGain: Number(item.third_party_percentage_gain),
    digisolPercentageGain: Number(item.digisol_percentage_gain),
    status: item.status,
    documentUrl: item.document_url ? getDocumentPublicUrl(item.document_url) : null,
    signedAt: item.signed_at,
    dateCreated: new Date(item.created_at).toLocaleDateString("en-GB"),
    updatedAt: item.updated_at,
  };
};

export const memorandumApi = {
  async getAllMemorandums(): Promise<Memorandum[]> {
    const response = await request<ApiResponse<MemorandumApiResponse[]>>("/proposals-contracts/memorandums");
    return (response.data || []).map(mapMemorandumToFrontend);
  },

  async getMemorandumById(id: string): Promise<Memorandum> {
    const response = await request<ApiResponse<MemorandumApiResponse>>(`/proposals-contracts/memorandums/${id}`);
    return mapMemorandumToFrontend(response.data);
  },

  async createMemorandum(payload: MemorandumFormPayload): Promise<Memorandum> {
    const response = await request<ApiResponse<MemorandumApiResponse>>("/proposals-contracts/memorandums", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return mapMemorandumToFrontend(response.data);
  },

  async updateMemorandum(id: string, payload: Partial<MemorandumFormPayload>): Promise<Memorandum> {
    const response = await request<ApiResponse<MemorandumApiResponse>>(`/proposals-contracts/memorandums/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return mapMemorandumToFrontend(response.data);
  },

  async deleteMemorandum(id: string): Promise<void> {
    await request(`/proposals-contracts/memorandums/${id}`, {
      method: "DELETE",
    });
  },

  async uploadMemorandumDocument(file: File): Promise<{ file_url: string; document_id: string }> {
    const { publicUrl } = await uploadFileToSupabase(file, {
      folder: "proposal-contracts/memorandum",
    });

    return {
      file_url: publicUrl,
      document_id: "supabase-upload",
    };
  },
};
