import { Card } from '../../components/other/Card'

import { useState } from 'react';
import { toast } from "sonner";
import { useAuth } from "../../Hooks/useAuth";
import { Button } from "@/components/ui/button";
import { uploadFileToSupabase } from "@/config/fileUpload";

export const MainDashboard = () => {

  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = async () => {
    if (!file) {
      toast.error("No file selected for upload.");
      return;
    }
    try {
      const { publicUrl } = await uploadFileToSupabase(file);
      toast.success("File uploaded successfully!");
      console.log("File URL:", publicUrl);
    } catch (error) {
      toast.error("Failed to upload file.");
    }
  };

  return (
    <div className="grid grid-cols-5 gap-3">
      <Card heading="eating" amount="500k" />
      <Card heading="eating" amount="500k" />
      <Card heading="eating" amount="500k" />
      <Card heading="eating" amount="500k" />
      <Card heading="eating" amount="500k" />

      <div>
          <p>this is for file upload</p>
          <input onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} type="file" placeholder="select a file" />
          <button onClick={() => handleFileUpload()} className="border p-2 cursor-pointer">Upload the file</button>
        </div>
    </div>

    
  );
}
