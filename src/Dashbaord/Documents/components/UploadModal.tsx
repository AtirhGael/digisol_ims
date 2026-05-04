import React, { useState } from 'react';
import { FaFileLines, FaXmark } from 'react-icons/fa6';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { ROLES } from '../constants';
import { BeatLoader } from 'react-spinners';

interface UploadModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onUpload: (file: File, data: { roles: string[]; description: string }) => void;
    isLoading?: boolean;
}

export const UploadModal = ({ isOpen, setIsOpen, onUpload, isLoading }: UploadModalProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [description, setDescription] = useState("");

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const toggleRole = (role: string) => {
        if (isLoading) return;
        if (selectedRoles.includes(role)) {
            setSelectedRoles(selectedRoles.filter(r => r !== role));
        } else {
            setSelectedRoles([...selectedRoles, role]);
        }
    };

    const handleUpload = () => {
        if (selectedFile && !isLoading) {
            onUpload(selectedFile, {
                roles: selectedRoles,
                description: description
            });
        }
    };

    const triggerFileInput = () => {
        if (!isLoading) {
            fileInputRef.current?.click();
        }
    };

    React.useEffect(() => {
        if (!isOpen) {
            setSelectedFile(null);
            setSelectedRoles([]);
            setDescription("");
        }
    }, [isOpen]);

    return (
        <AlertDialog open={isOpen} onOpenChange={(val) => !isLoading && setIsOpen(val)}>
            <AlertDialogContent className="max-w-2xl bg-white rounded-3xl p-8 border-none shadow-2xl overflow-y-auto max-h-[90vh]">
                <AlertDialogHeader>
                    <div className="flex justify-between items-center mb-4">
                        <AlertDialogTitle className="text-2xl font-bold text-gray-800">Upload Document</AlertDialogTitle>
                        <button
                            onClick={() => !isLoading && setIsOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                            disabled={isLoading}
                        >
                            <FaXmark className="text-gray-500 text-xl" />
                        </button>
                    </div>
                    <AlertDialogDescription className="text-gray-500 mb-6">
                        Upload a document and set its access permissions by role.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-semibold text-gray-700">Select File</label>
                        <div
                            onClick={triggerFileInput}
                            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-4 transition-colors relative ${isLoading ? "bg-gray-100 border-gray-100 cursor-not-allowed" : "border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                                }`}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            />
                            <div className="bg-white p-3 rounded-2xl shadow-sm">
                                <FaFileLines className="text-[#423d8a] text-2xl" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-gray-800 text-sm">
                                    {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                                </p>
                                <p className="text-[10px] text-gray-500 mt-1">PDF, DOCX, XLSX, Images (Max. 50MB)</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-semibold text-gray-700">Document Description</label>
                        <textarea
                            disabled={isLoading}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Briefly describe what this document contains..."
                            className="w-full min-h-25 p-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-[#423d8a] outline-none transition-all text-sm resize-none"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-semibold text-gray-700">
                            Roles with Access <span className="text-gray-400 font-normal">(Leave empty for all roles)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ROLES.map(role => (
                                <button
                                    key={role}
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => toggleRole(role)}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all border-2 disabled:opacity-50 ${selectedRoles.includes(role)
                                        ? "bg-[#32CD32] text-white border-[#32CD32]"
                                        : "bg-white text-gray-600 border-gray-100 hover:border-gray-200"
                                        }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <AlertDialogFooter className="mt-6 gap-4 sm:space-x-4">
                    <AlertDialogCancel
                        className="rounded-xl px-6 h-11 font-bold border-gray-100 hover:bg-gray-50 text-gray-600 border-2 disabled:opacity-50 text-sm"
                        disabled={isLoading}
                    >
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        onClick={handleUpload}
                        disabled={isLoading || !selectedFile}
                        className="bg-[#423d8a] hover:bg-[#34306e] text-white px-8 h-11 rounded-xl font-bold shadow-lg disabled:opacity-50 transition-all min-w-35 text-sm"
                    >
                        {isLoading ? <BeatLoader size={8} color="#ffffff" /> : "Upload Document"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
