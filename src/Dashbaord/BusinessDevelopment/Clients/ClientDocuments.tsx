import { Button } from '@/components/ui/button'
import React, { useRef, useState } from 'react'
import { FaFileAlt, FaPlus, FaTimes } from 'react-icons/fa'

interface ClientDocumentsProps {
  clientData?: any
  showHeaderAction?: boolean
  uploadInputRef?: React.RefObject<HTMLInputElement>
}

export const ClientDocuments = ({
  clientData,
  showHeaderAction = true,
  uploadInputRef,
}: ClientDocumentsProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const internalInputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = uploadInputRef ?? internalInputRef

  // Trigger the hidden file input from header button.
  const handlePickFiles = () => {
    fileInputRef.current?.click()
  }

  // Store selected files locally (upload wired later).
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setSelectedFiles(Array.from(e.target.files))
  }

  // Allow removing a selected file before upload.
  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold">Client Documents</h2>
        {showHeaderAction && (
          <Button className="flex items-center gap-2" onClick={handlePickFiles}>
            <FaPlus className="text-sm" />
            Upload Document
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleFilesChange}
        />
      </div>
      
      <div className="bg-white rounded-lg">
        <div className="p-4">
          {selectedFiles.length === 0 ? (
            <div className="text-center py-12">
              <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No documents found</p>
              <p className="text-gray-500 text-sm">Upload documents to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedFiles.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(idx)}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <FaTimes className="text-[10px]" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
