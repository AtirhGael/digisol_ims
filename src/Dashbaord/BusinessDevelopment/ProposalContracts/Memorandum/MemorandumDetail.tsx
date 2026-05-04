import React from 'react'
import { ChevronLeft, Download, Edit } from "lucide-react"
import { Memorandum } from './Memorandum.types'
import { useDocumentNameResolver } from '../../../../Hooks/useDocumentNameResolver'

interface MemorandumDetailProps {
  memorandum: Memorandum
  onBack: () => void
  onEdit?: (id: string) => void
}

export const MemorandumDetail = ({ memorandum, onBack, onEdit }: MemorandumDetailProps) => {
  const { resolveDocumentName } = useDocumentNameResolver()
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDownload = () => {
    if (memorandum.documentUrl) {
      window.open(memorandum.documentUrl, '_blank')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation */}
      <nav className="flex items-center gap-1 text-sm text-gray-400">
        <button onClick={onBack} className="hover:text-primary flex items-center gap-1 transition-colors">
          <ChevronLeft size={14} /> Back
        </button>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate">{memorandum.thirdPartyName}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">MOU: {memorandum.thirdPartyName}</h1>
            <p className="text-gray-600">Contract Partner: <span className="font-semibold">{memorandum.thirdPartyNameLocal || memorandum.thirdPartyName}</span></p>
            {memorandum.contractTitle && (
              <p className="text-gray-600 text-sm">Related Contract: {memorandum.contractTitle}</p>
            )}
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-3 ${getStatusColor(memorandum.status)}`}>
              {memorandum.status}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {memorandum.documentUrl && (
              <button 
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all font-semibold w-full sm:w-auto"
              >
                <Download size={16} />
                Download PDF
              </button>
            )}
            {onEdit && (
              <button 
                onClick={() => onEdit(memorandum.id)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-all font-semibold shadow-sm shadow-primary/20 w-full sm:w-auto"
              >
                <Edit size={16} />
                Edit MOU
              </button>
            )}
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-primary rounded-full"></span>
              Document Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">Date Created:</span>
                <span className="font-semibold text-gray-900 sm:text-right break-words">{memorandum.dateCreated}</span>
              </div>
              {memorandum.signedAt && (
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-gray-200/50 pb-2">
                  <span className="text-gray-500">Date Signed:</span>
                  <span className="font-semibold text-gray-900 sm:text-right break-words">{new Date(memorandum.signedAt).toLocaleDateString("en-GB")}</span>
                </div>
              )}
              {memorandum.contractTitle && (
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-gray-200/50 pb-2">
                  <span className="text-gray-500">Contract Name:</span>
                  <span className="font-semibold text-gray-900 text-right max-w-[180px] truncate" title={memorandum.contractTitle}>{memorandum.contractTitle}</span>
                </div>
              )}
              {memorandum.contractNumber && (
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-gray-200/50 pb-2">
                  <span className="text-gray-500">Contract Number:</span>
                  <span className="font-mono text-gray-900 sm:text-right break-words">{memorandum.contractNumber}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">Current Status:</span>
                <span className="font-semibold text-gray-900 sm:text-right break-words">{memorandum.status}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-gray-500">MOU Partner:</span>
                <span className="font-mono text-primary font-bold sm:text-right break-words">{memorandum.thirdPartyName}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#32CD32] rounded-full"></span>
              Revenue Split (Percentage)
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-600">Digisol Gain</span>
                  <span className="text-primary">{memorandum.digisolPercentageGain}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${memorandum.digisolPercentageGain}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-600">Third Party Gain</span>
                  <span className="text-[#32CD32]">{memorandum.thirdPartyPercentageGain}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#32CD32] h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${memorandum.thirdPartyPercentageGain}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-sm border-t border-gray-200">
                <span className="text-gray-900 font-bold uppercase tracking-tight">Total Allocation</span>
                <span className="text-gray-900 font-black">100.00%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Role Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-3 ml-1">Digisol's Role & Responsibilities</h3>
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm min-h-[120px]">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {memorandum.digisolRoleDescription}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-3 ml-1">Third Party's Role & Responsibilities</h3>
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm min-h-[120px]">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {memorandum.thirdPartyRoleDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Document Section */}
        {memorandum.documentUrl && (
          <div className="mb-2">
            <h3 className="font-bold text-gray-900 mb-3 ml-1 text-sm uppercase tracking-wider text-gray-500">Linked Document</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">Memorandum of Understanding File</p>
                <p className="text-xs text-gray-500 font-medium truncate">
                  {resolveDocumentName(memorandum.documentUrl)}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button 
                  onClick={handleDownload}
                  className="px-4 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-all w-full sm:w-auto"
                >
                  Preview Online
                </button>
                <button 
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/80 transition-all shadow-sm shadow-primary/20 w-full sm:w-auto"
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

