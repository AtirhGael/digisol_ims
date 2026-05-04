export type MemorandumStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface Memorandum {
  id: string;
  thirdPartyName: string;
  contractId: string;
  contractTitle?: string;
  contractNumber?: string;
  thirdPartyNameLocal?: string; // For frontend display if different
  thirdPartyRoleDescription: string;
  digisolRoleDescription: string;
  thirdPartyPercentageGain: number;
  digisolPercentageGain: number;
  status: MemorandumStatus;
  documentUrl: string | null;
  signedAt: string | null;
  dateCreated: string;
  updatedAt: string;
}

export interface MemorandumFormPayload {
  third_party_name: string;
  contract_id: string;
  third_party_role_description: string;
  digisol_role_description: string;
  third_party_percentage_gain: number;
  digisol_percentage_gain: number;
  status: MemorandumStatus;
  document_url: string | null;
  signed_at: string | null;
}

export interface MemorandumApiResponse {
  memorandum_id: string;
  third_party_name: string;
  contract_id: string;
  third_party_role_description: string;
  digisol_role_description: string;
  third_party_percentage_gain: string | number;
  digisol_percentage_gain: string | number;
  status: MemorandumStatus;
  document_url: string | null;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
  contracts?: {
    contract_title: string;
    contract_number: string;
    clients?: {
      client_name: string;
    };
  };
}
