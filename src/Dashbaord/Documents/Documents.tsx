
import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { toast } from 'sonner';
import { DocumentStats } from './components/DocumentStats';
import { DocumentTable } from './components/DocumentTable';
import { UploadModal } from './components/UploadModal';
import { getDocuments, uploadDocument, getDocumentStats, type Document } from './api';
import { BeatLoader } from 'react-spinners';

export const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState({ totalDocuments: 0, totalSize: "0 B" });

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await getDocuments();

      if (response.success && response.data) {
        const mappedDocs: Document[] = response.data.map((doc: any) => ({
          document_id: doc.document_id,
          filename: doc.filename,
          description: doc.description,
          file_url: doc.file_url,
          file_size: doc.file_size,
          file_type: doc.file_type,
          mime_type: doc.mime_type,
          category: doc.category,
          uploaded_by: doc.uploaded_by,
          upload_date: doc.upload_date,
          departments: doc.departments || [],
          roles: doc.roles || [],
        }));

        setDocuments(mappedDocs);

        if (response.meta) {
          setStats({
            totalDocuments: response.meta.total,
            totalSize: formatBytes(parseInt(response.data.reduce((acc: number, doc: any) => acc + parseInt(doc.file_size || 0), 0).toString())),
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getDocumentStats();
      if (response.success && response.data) {
        setStats({
          totalDocuments: response.data.total_documents,
          totalSize: formatBytes(parseInt(response.data.total_size_bytes || '0')),
        });
      }
    } catch (error) {
      console.error("Failed to fetch document stats:", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  const handleUpload = async (file: File, data: { roles: string[]; description: string }) => {
    try {
      setIsUploading(true);
      await uploadDocument(file, data.description, data.roles);
      setIsUploadModalOpen(false);
      await fetchDocuments();
      await fetchStats();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed: " + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const formatBytes = (bytes: number, decimals = 2): string => {
    if (!bytes || isNaN(bytes)) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Documents</h1>
          <p className="text-gray-500 text-xs font-light">Manage and organize your company files</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-primary hover:bg-primary/85 text-white px-6 h-10 rounded-xl text-sm transition-all flex items-center gap-2"
        >
          <FaPlus className="text-sm" />
          Upload Document
        </button>
      </div>

      <DocumentStats
        totalDocuments={stats.totalDocuments}
        totalSize={stats.totalSize}
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <BeatLoader color="#423d8a" />
        </div>
      ) : (
        <DocumentTable documents={documents} onRefresh={fetchDocuments} />
      )}

      <UploadModal
        isOpen={isUploadModalOpen}
        setIsOpen={setIsUploadModalOpen}
        onUpload={handleUpload}
        isLoading={isUploading}
      />
    </div>
  );
};
