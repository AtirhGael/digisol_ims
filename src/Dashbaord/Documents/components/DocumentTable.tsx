import React, { useState, useMemo } from 'react';
import { FaMagnifyingGlass, FaFilter, FaEye, FaDownload, FaTrash } from 'react-icons/fa6';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import type { Document } from '../api';
import { deleteDocument, downloadDocument } from '../api';

interface DocumentTableProps {
    documents: Document[];
    onRefresh?: () => void;
}

export const DocumentTable = ({ documents, onRefresh }: DocumentTableProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const filteredDocuments = useMemo(() => {
        if (!searchQuery) return documents;
        const query = searchQuery.toLowerCase();
        return documents.filter(doc => 
            doc.filename?.toLowerCase().includes(query) ||
            doc.description?.toLowerCase().includes(query) ||
            doc.uploaded_by?.toLowerCase().includes(query)
        );
    }, [documents, searchQuery]);

    const formatBytes = (bytes: string | number): string => {
        const bytesNum = typeof bytes === 'string' ? parseInt(bytes) : bytes;
        if (!bytesNum || isNaN(bytesNum)) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytesNum) / Math.log(k));
        return `${parseFloat((bytesNum / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const handleDownload = async (doc: Document) => {
        try {
            const blob = await downloadDocument(doc.document_id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download document');
        }
    };

    const handleDelete = async (doc: Document) => {
        toast(`Delete "${doc.filename}"?`, {
            description: 'This action cannot be undone.',
            action: {
                label: 'Delete',
                onClick: async () => {
                    try {
                        setDeletingId(doc.document_id);
                        const response = await deleteDocument(doc.document_id);
                        if (response.success) {
                            toast.success('Document deleted successfully');
                            onRefresh?.();
                        } else {
                            toast.error('Failed to delete document');
                        }
                    } catch (error) {
                        console.error('Delete failed:', error);
                        toast.error('Failed to delete document');
                    } finally {
                        setDeletingId(null);
                    }
                },
            },
            cancel: { label: 'Cancel', onClick: () => {} },
            duration: 8000,
        });
    };

    const getFileIcon = (fileType: string | undefined) => {
        if (!fileType) return '📄';
        const type = fileType.toUpperCase();
        if (type === 'PDF') return '📕';
        if (['DOC', 'DOCX'].includes(type)) return '📘';
        if (['XLS', 'XLSX'].includes(type)) return '📗';
        if (['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'].includes(type)) return '🖼️';
        if (['ZIP', 'RAR'].includes(type)) return '📦';
        return '📄';
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-gray-800">All Documents</h3>
                    <div className="flex gap-4">
                        <Button variant="outline" size="icon" className="h-10 w-10 border-gray-200 rounded-lg">
                            <FaFilter className="text-gray-400 text-sm" />
                        </Button>
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Search documents..."
                                className="pl-4 pr-10 py-2 w-72 bg-[#f8f9fa] border-gray-100 rounded-xl focus:ring-primary h-11 border-2"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <FaMagnifyingGlass className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 uppercase tracking-wider">
                                <th className="pb-6 font-semibold text-[#8a8a8a] text-sm">Document</th>
                                <th className="pb-6 font-semibold text-[#8a8a8a] text-sm text-center">Type</th>
                                <th className="pb-6 font-semibold text-[#8a8a8a] text-sm text-center">Uploaded By</th>
                                <th className="pb-6 font-semibold text-[#8a8a8a] text-sm text-center">Date</th>
                                <th className="pb-6 font-semibold text-[#8a8a8a] text-sm text-center">Size</th>
                                <th className="pb-6 font-semibold text-[#8a8a8a] text-sm text-right pr-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDocuments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-gray-500 font-medium italic">
                                        {searchQuery ? 'No documents match your search.' : 'No documents found. Start by uploading one!'}
                                    </td>
                                </tr>
                            ) : (
                                filteredDocuments.map((doc) => (
                                    <tr key={doc.document_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-5">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{getFileIcon(doc.file_type)}</span>
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-base">{doc.filename}</p>
                                                    {doc.description && (
                                                        <p className="text-sm text-gray-500 truncate max-w-xs">{doc.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 text-center">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                                {doc.file_type || 'FILE'}
                                            </span>
                                        </td>
                                        <td className="py-5 text-gray-800 font-bold text-sm text-center">{doc.uploaded_by}</td>
                                        <td className="py-5 text-gray-600 text-base text-center font-medium">{formatDate(doc.upload_date)}</td>
                                        <td className="py-5 text-gray-600 text-base text-center font-medium">{formatBytes(doc.file_size)}</td>
                                        <td className="py-5 text-right pr-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleDownload(doc)}
                                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
                                                    title="Download"
                                                >
                                                    <FaDownload className="text-gray-600 hover:text-primary text-lg" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(doc)}
                                                    disabled={deletingId === doc.document_id}
                                                    className="p-2 hover:bg-red-50 rounded-full transition-colors" 
                                                    title="Delete"
                                                >
                                                    <FaTrash className={`${deletingId === doc.document_id ? 'text-gray-300' : 'text-gray-600 hover:text-red-500'} text-lg`} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredDocuments.length > 0 && (
                    <div className="mt-10 flex justify-between items-center text-base">
                        <p className="text-gray-400 font-medium">
                            Showing {filteredDocuments.length} of {documents.length} documents
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" className="text-gray-400 font-bold hover:bg-gray-50 px-4">Previous</Button>
                            <Button className="bg-[#1e90ff] hover:bg-[#1c86ee] text-white font-bold w-10 h-10 p-0 rounded-lg">1</Button>
                            <Button variant="outline" className="text-gray-400 font-bold hover:bg-gray-50 px-4">Next</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
