import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env
  .VITE_SUPABASE_ANON_KEY as string | undefined;
const defaultBucket =
  (import.meta.env.VITE_SUPABASE_BUCKET_NAME as string | undefined) ||
  "documents";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY"
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type UploadOptions = {
  bucket?: string;
  folder?: string;
  upsert?: boolean;
};

type UploadResult = {
  publicUrl: string;
};

const sanitizeFileName = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, "_");

const makeUniqueName = (name: string) => {
  const safeName = sanitizeFileName(name);
  const uniquePart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${uniquePart}-${safeName}`;
};

export const uploadFileToSupabase = async (
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const bucket = options.bucket || defaultBucket;
  const folder = options.folder?.trim() ? `${options.folder.trim()}/` : "";
  const filePath = `${folder}${makeUniqueName(file.name)}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    upsert: options.upsert ?? false,
    contentType: file.type || undefined,
  });

  if (error) {
    throw new Error(error.message || "Failed to upload file to Supabase.");
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return {
    publicUrl: data.publicUrl,
  };
};
