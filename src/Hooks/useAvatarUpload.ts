import { useState } from "react";
import { uploadFileToSupabase } from "../config/fileUpload";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
];

const isImageFile = (file: File): boolean => {
  const mime = (file.type || "").toLowerCase();
  return ACCEPTED_IMAGE_TYPES.includes(mime);
};

export const useAvatarUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!isImageFile(file)) {
      const message =
        "Only image files are allowed (JPEG, PNG, GIF, WebP, AVIF).";
      setUploadError(message);
      throw new Error(message);
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const { publicUrl } = await uploadFileToSupabase(file, {
        folder: "avatars",
        bucket: "documents",
        upsert: true,
      });
      return publicUrl;
    } catch (error: any) {
      const message = error?.message || "Failed to upload image to storage.";
      setUploadError(message);
      throw new Error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadError,
    uploadAvatar,
  };
};

export default useAvatarUpload;
