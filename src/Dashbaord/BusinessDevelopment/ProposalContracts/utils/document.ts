export const getDocumentDisplayName = (
  documentValue?: string | null,
  fallback = "Attached file"
): string => {
  if (!documentValue || typeof documentValue !== "string") {
    return fallback;
  }

  const trimmedValue = documentValue.trim();
  if (!trimmedValue) {
    return fallback;
  }

  const withoutQueryOrHash = trimmedValue.split(/[?#]/)[0] ?? trimmedValue;
  const normalizedPath = withoutQueryOrHash.replace(/\\/g, "/");
  const rawFileName = normalizedPath.split("/").pop() || normalizedPath;

  let decodedName = rawFileName;
  try {
    decodedName = decodeURIComponent(rawFileName).replace(/\+/g, " ");
  } catch {
    decodedName = rawFileName;
  }

  const sanitizedName = decodedName
    .replace(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[_-]/i,
      ""
    )
    .replace(/^\d{10,}[_-]/, "")
    .replace(/^[a-f0-9]{24,}[_-]/i, "");

  return sanitizedName || decodedName || fallback;
};

export const getDocumentPublicUrl = (documentValue?: string | null): string => {
  if (!documentValue || typeof documentValue !== "string") {
    return "";
  }

  const trimmedValue = documentValue.trim();
  if (!trimmedValue) {
    return "";
  }

  const normalizedValue = trimmedValue.replace(/\\/g, "/");

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  if (/^https?:\//i.test(trimmedValue)) {
    return trimmedValue.replace(/^https?:\/?/i, (match) =>
      match.toLowerCase().startsWith("https") ? "https://" : "http://"
    );
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
  const bucketName = import.meta.env.VITE_SUPABASE_BUCKET_NAME || "documents";
  const storagePublicPrefix = "/storage/v1/object/public/";

  if (supabaseUrl && normalizedValue.includes(storagePublicPrefix)) {
    return `${supabaseUrl}${normalizedValue.slice(normalizedValue.indexOf(storagePublicPrefix))}`;
  }

  if (supabaseUrl && !normalizedValue.startsWith("/")) {
    const withoutBucketPrefix = normalizedValue.startsWith(`${bucketName}/`)
      ? normalizedValue.slice(bucketName.length + 1)
      : normalizedValue;

    return `${supabaseUrl}${storagePublicPrefix}${bucketName}/${withoutBucketPrefix}`;
  }

  const baseUrl = import.meta.env.VITE_BASE_URL?.replace("/api", "") || "http://localhost:4000";
  return `${baseUrl}${normalizedValue}`;
};
