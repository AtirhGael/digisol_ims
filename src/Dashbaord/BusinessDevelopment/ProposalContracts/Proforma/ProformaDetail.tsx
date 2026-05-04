import React from 'react'
import { ChevronLeft, Download, Edit, FileText, ExternalLink } from "lucide-react"
import { formatDate } from '../utils/dateTime'
import { useDocumentNameResolver } from '../../../../Hooks/useDocumentNameResolver'
import { getDocumentPublicUrl } from '../utils/document'

interface ProformaDetailProps {
  proforma: any
  onBack: () => void
  onEdit?: () => void
}

export const ProformaDetail = ({ proforma, onBack, onEdit }: ProformaDetailProps) => {
  const { resolveDocumentName } = useDocumentNameResolver()
  const dateCreated = formatDate(proforma.dateCreated)
  const dateSent = proforma.dateSent ? formatDate(proforma.dateSent) : "Not sent"
  const dateAdded = formatDate(proforma.dateAdded)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-100 text-emerald-800"
      case "DRAFT":
        return "bg-gray-100 text-gray-800"
      case "SENT":
        return "bg-blue-100 text-blue-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-400">
        <button onClick={onBack} className="hover:text-primary flex items-center gap-1 transition-colors">
          <ChevronLeft size={14} /> Back
        </button>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate">{proforma.proformaTitle}</span>
      </nav>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{proforma.proformaTitle}</h1>
            <p className="text-gray-600">Based on: {proforma.proposalTitle}</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(proforma.status)}`}>
              {proforma.status}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 w-full sm:w-auto">
              <Download size={16} />
              Download
            </button>
            <button 
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 w-full sm:w-auto"
              onClick={onEdit}
            >
              <Edit size={16} />
              Edit Proforma
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Proforma Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-gray-600">Value:</span>
                <span className="font-medium sm:text-right break-words">XAF {proforma.value?.toLocaleString()}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-gray-600">Date Created:</span>
                <span className="font-medium sm:text-right break-words">{dateCreated}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-gray-600">Date Sent:</span>
                <span className="font-medium sm:text-right break-words">{dateSent}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-gray-600">Date Added:</span>
                <span className="font-medium sm:text-right break-words">{dateAdded}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Services Included</h3>
            <div className="space-y-1">
              {proforma.services?.length > 0 ? (
                proforma.services.map((service: string, index: number) => (
                  <div key={index} className="text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-md">
                    {service}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic px-3 py-2">
                  No services specified for this proforma invoice
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Description / Scope of Work</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {proforma.description}
          </p>
        </div>

        {/* Document Section */}
        {proforma.document_url && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Attached Documents</h3>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Proforma Document
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {resolveDocumentName(proforma.document_url, "document.pdf")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a 
                    href={getDocumentPublicUrl(proforma.document_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors whitespace-nowrap"
                  >
                    <ExternalLink size={12} />
                    View
                  </a>
                  <a 
                    href={getDocumentPublicUrl(proforma.document_url)}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors whitespace-nowrap"
                  >
                    <Download size={12} />
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
