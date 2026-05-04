import React, { useState } from 'react'
import { Upload, X, ChevronLeft } from 'lucide-react'
import { Memorandum, MemorandumStatus } from './Memorandum.types'
import { CustomSelect } from "../../../../components/ui/CustomSelect";
import { toast } from "sonner";
import { useDocumentNameResolver } from "../../../../Hooks/useDocumentNameResolver";


interface NewMemorandumFormProps {
  onCancel: () => void
  onSubmit: (memorandumData: any) => void
  existingContracts?: Array<{ id: string; title: string }>
  initialData?: Memorandum
}

export const NewMemorandumForm = ({ onCancel, onSubmit, existingContracts = [], initialData }: NewMemorandumFormProps) => {
  const { resolveDocumentName } = useDocumentNameResolver();
  const isEditing = !!initialData

  const [formData, setFormData] = useState({
    thirdPartyName: '',
    contractId: '',
    dateCreated: new Date().toISOString().split('T')[0],
    dateSigned: '',
    thirdPartyRole: '',
    dgRole: '',
    third_party_percentage_gain: '',
    digisol_percentage_gain: '',
    status: 'PENDING' as MemorandumStatus,
    document: null as File | null
  })

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        thirdPartyName: initialData.thirdPartyName,
        contractId: initialData.contractId || '',
        dateCreated: initialData.dateCreated.split('/').reverse().join('-') || new Date().toISOString().split('T')[0], // Assuming date format mapping
        dateSigned: initialData.signedAt ? initialData.signedAt.split('T')[0] : '',
        thirdPartyRole: initialData.thirdPartyRoleDescription,
        dgRole: initialData.digisolRoleDescription,
        third_party_percentage_gain: initialData.thirdPartyPercentageGain.toString(),
        digisol_percentage_gain: initialData.digisolPercentageGain.toString(),
        status: initialData.status as MemorandumStatus,
        document: null // Keep existing document if not replaced
      })
    }
  }, [initialData])

  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const contractOptions = [
    { value: "", label: "No contract selected" },
    ...existingContracts.map((contract) => ({
      value: contract.id,
      label: contract.title,
    })),
  ];

  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "ACCEPTED", label: "Accepted" },
    { value: "REJECTED", label: "Rejected" },
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.thirdPartyName.trim()) {
      newErrors.thirdPartyName = 'Third party name is required'
    }

    if (!formData.dateCreated) {
      newErrors.dateCreated = 'Date created is required'
    }

    if (!formData.thirdPartyRole.trim()) {
      newErrors.thirdPartyRole = 'Third party role description is required'
    }

    if (!formData.dgRole.trim()) {
      newErrors.dgRole = 'D.G role description is required'
    }

    if (!isEditing && !formData.document) {
      newErrors.document = 'Memorandum document is required'
    }

    const tpPct = parseFloat(formData.third_party_percentage_gain)
    const dgPct = parseFloat(formData.digisol_percentage_gain)

    if (isNaN(tpPct)) {
      newErrors.third_party_percentage_gain = 'Third party percentage is required'
    }
    if (isNaN(dgPct)) {
      newErrors.digisol_percentage_gain = 'D.G percentage is required'
    }

    if (!isNaN(tpPct) && !isNaN(dgPct) && tpPct + dgPct !== 100) {
      newErrors.percentage_sum = 'Total percentage must sum to 100%'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0]);
    }
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setIsSubmitting(true)
      try {
        const memorandumData = {
          ...formData,
          id: `memo-${Date.now()}`,
          key: `memo-${Date.now()}`,
          contractId: formData.contractId || undefined,
          dateSigned: formData.dateSigned || undefined,
          documentUrl: formData.document ? URL.createObjectURL(formData.document) : undefined
        }
        await onSubmit(memorandumData)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleFileUpload = (file: File) => {
    const isVideo = file.type.toLowerCase().startsWith("video/");
    const isAllowedDocument =
      file.type === "application/pdf" ||
      file.type.includes("document") ||
      /\.(pdf|doc|docx)$/i.test(file.name);

    if (isVideo) {
      const message = "Video files are not allowed. Please upload a PDF, DOC, or DOCX file.";
      toast.error(message);
      setErrors(prev => ({ ...prev, document: message }));
      return;
    }

    if (file && isAllowedDocument) {
      setFormData(prev => ({ ...prev, document: file }))
      setErrors(prev => ({ ...prev, document: '' }))
    } else {
      const message = "Please upload a PDF, DOC, or DOCX file.";
      toast.error(message);
      setErrors(prev => ({ ...prev, document: message }))
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1 text-sm text-gray-400">
        <button onClick={onCancel} className="hover:text-primary flex items-center gap-1 transition-colors">
          <ChevronLeft size={14} /> Back
        </button>
        <span>/</span>
        <span className="text-gray-700 font-medium">{isEditing ? 'Edit Memorandum' : 'New Memorandum'}</span>
      </nav>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex justify-between items-start mb-6 border-b border-gray-50 pb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{isEditing ? 'Edit Memorandum' : 'Add New Memorandum'}</h2>
            <p className="text-gray-600 text-sm mt-1">{isEditing ? 'Update the memorandum of understanding' : 'Create a new memorandum of understanding'}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Third Party Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Third Party Name *
              </label>
              <input
                type="text"
                value={formData.thirdPartyName}
                onChange={(e) => setFormData(prev => ({ ...prev, thirdPartyName: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.thirdPartyName ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="Enter third party name"
              />
              {errors.thirdPartyName && (
                <p className="text-red-500 text-sm mt-1">{errors.thirdPartyName}</p>
              )}
            </div>

            {/* Contract Title (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Contract Title (Optional)
              </label>
              <CustomSelect
                value={formData.contractId}
                onChange={(value) => setFormData(prev => ({ ...prev, contractId: value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                options={contractOptions}
                placeholder="No contract selected"
              />
            </div>

            {/* Date Created */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Created *
              </label>
              <input
                type="date"
                value={formData.dateCreated}
                onChange={(e) => setFormData(prev => ({ ...prev, dateCreated: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.dateCreated ? 'border-red-300' : 'border-gray-300'
                  }`}
              />
              {errors.dateCreated && (
                <p className="text-red-500 text-sm mt-1">{errors.dateCreated}</p>
              )}
            </div>

            {/* Date Signed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Signed
              </label>
              <input
                type="date"
                value={formData.dateSigned}
                onChange={(e) => setFormData(prev => ({ ...prev, dateSigned: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Third Party Role Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Third Party's Role Description *
            </label>
            <textarea
              value={formData.thirdPartyRole}
              onChange={(e) => setFormData(prev => ({ ...prev, thirdPartyRole: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.thirdPartyRole ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Describe the third party's role and responsibilities"
            />
            {errors.thirdPartyRole && (
              <p className="text-red-500 text-sm mt-1">{errors.thirdPartyRole}</p>
            )}
          </div>

          {/* D.G Role Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              D.G Role Description *
            </label>
            <textarea
              value={formData.dgRole}
              onChange={(e) => setFormData(prev => ({ ...prev, dgRole: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.dgRole ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Describe D.G's role and responsibilities"
            />
            {errors.dgRole && (
              <p className="text-red-500 text-sm mt-1">{errors.dgRole}</p>
            )}
          </div>

          {/* Percentage Gains */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Third Party's Percentage gain *
              </label>
              <input
                type="number"
                value={formData.third_party_percentage_gain}
                onChange={(e) => setFormData(prev => ({ ...prev, third_party_percentage_gain: e.target.value }))}
                placeholder="Enter percentage..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.third_party_percentage_gain ? 'border-red-300' : 'border-gray-300'
                  }`}
              />
              {errors.third_party_percentage_gain && (
                <p className="text-red-500 text-sm mt-1">{errors.third_party_percentage_gain}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                D.G Percentage gain *
              </label>
              <input
                type="number"
                value={formData.digisol_percentage_gain}
                onChange={(e) => setFormData(prev => ({ ...prev, digisol_percentage_gain: e.target.value }))}
                placeholder="Enter percentage..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.digisol_percentage_gain ? 'border-red-300' : 'border-gray-300'
                  }`}
              />
              {errors.digisol_percentage_gain && (
                <p className="text-red-500 text-sm mt-1">{errors.digisol_percentage_gain}</p>
              )}
            </div>
          </div>

          {errors.percentage_sum && (
            <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg border border-red-100">{errors.percentage_sum}</p>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <CustomSelect
              value={formData.status}
              onChange={(value) => setFormData(prev => ({ ...prev, status: value as 'PENDING' | 'ACCEPTED' | 'REJECTED' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              options={statusOptions}
            />
          </div>

          {/* Upload Document */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Memorandum Document {!isEditing && '*'}
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : errors.document ? 'border-red-300' : 'border-gray-300'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              {formData.document ? (
                <div>
                  <p className="text-green-600 font-medium">{formData.document.name}</p>
                  <p className="text-sm text-gray-500">File uploaded successfully</p>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, document: null }))}
                    className="text-red-500 text-sm mt-2 hover:underline"
                  >
                    Remove file
                  </button>
                </div>
              ) : isEditing && initialData?.documentUrl ? (
                <div>
                  <p className="text-green-600 font-medium break-all flex justify-center items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
                    </span>
                    Existing Attached Document
                  </p>
                  <p className="text-xs text-gray-600 mt-1 break-all">
                    {resolveDocumentName(initialData.documentUrl)}
                  </p>
                  <p className="text-sm text-gray-500">Existing document (Upload a new file to replace)</p>
                  <label className="text-primary hover:text-primary/80 cursor-pointer text-sm mt-3 inline-block">
                    Browse for new file
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                    />
                  </label>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-1">Drop your memorandum document here, or</p>
                  <label className="text-primary hover:text-primary/80 cursor-pointer">
                    browse files
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
                </div>
              )}
            </div>
            {errors.document && (
              <p className="text-red-500 text-sm mt-1">{errors.document}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  {isEditing ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Save Changes' : 'Create Memorandum'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
