import { useMemo } from "react";
import useFetchHook from "./UseFetchHook";
import { getDocumentDisplayName } from "../Dashbaord/BusinessDevelopment/ProposalContracts/utils/document";

type DocumentRecord = {
  file_url?: string | null;
  filename?: string | null;
  document_name?: string | null;
};

const normalizeDocumentPath = (value?: string | null): string => {
  if (!value || typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const withoutQueryOrHash = trimmed.split(/[?#]/)[0] ?? trimmed;
  const normalizedSlashes = withoutQueryOrHash.replace(/\\/g, "/");

  try {
    const parsed = new URL(normalizedSlashes, window.location.origin);
    return parsed.pathname.replace(/\/+$/, "");
  } catch {
    return normalizedSlashes.replace(/\/+$/, "");
  }
};

export const useDocumentNameResolver = () => {
  const { data: documentsResponse } = useFetchHook(
    "/v1/documents?page=1&limit=1000&sortBy=created_at&sortOrder=desc",
    "proposal-contracts-document-names",
    {
      enabled: true,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000,
    }
  );

  const documentNameByPath = useMemo(() => {
    const map = new Map<string, string>();
    const rawItems = Array.isArray(documentsResponse?.data)
      ? documentsResponse.data
      : [];

    rawItems.forEach((item: DocumentRecord) => {
      const path = normalizeDocumentPath(item.file_url);
      const displayName = item.filename || item.document_name || "";

      if (!path || !displayName) {
        return;
      }

      map.set(path, displayName);
    });

    return map;
  }, [documentsResponse]);

  const resolveDocumentName = (
    documentUrl?: string | null,
    fallback = "Attached file"
  ): string => {
    const normalizedPath = normalizeDocumentPath(documentUrl);
    if (normalizedPath && documentNameByPath.has(normalizedPath)) {
      return documentNameByPath.get(normalizedPath) || fallback;
    }

    return getDocumentDisplayName(documentUrl, fallback);
  };

  return { resolveDocumentName };
};

