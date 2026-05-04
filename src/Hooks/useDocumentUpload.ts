import { useState } from "react";
import { uploadFileToSupabase } from "../config/fileUpload";

type UploadDocumentOptions = {
  folder?: string;
  bucket?: string;
  upsert?: boolean;
};

const isVideoFile = (file: File) => {
  const mime = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  return (
    mime.startsWith("video/") ||
    /\.(mp4|mov|avi|mkv|webm|m4v|wmv|flv|mpeg|mpg|3gp)$/i.test(name)
  );
};

export const useDocumentUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadDocument = async (
    file: File,
    options: UploadDocumentOptions = {}
  ): Promise<string> => {
    if (isVideoFile(file)) {
      const message =
        "Video files are not allowed. Please upload a PDF, DOC, or DOCX file.";
      setUploadError(message);
      throw new Error(message);
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      const { publicUrl } = await uploadFileToSupabase(file, options);
      return publicUrl;
    } catch (error: any) {
      const message =
        error?.message || "Failed to upload file to document storage.";
      setUploadError(message);
      throw new Error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadError,
    uploadDocument,
  };
};

export default useDocumentUpload;
