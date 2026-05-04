import React from 'react'
import { ChevronLeft, Download, Edit, FileText, ExternalLink, CalendarDays, Wallet, RefreshCcw, Clock3 } from "lucide-react"
import { formatDate, formatDateTime } from '../utils/dateTime'
import { useDocumentNameResolver } from '../../../../Hooks/useDocumentNameResolver'
import { getDocumentPublicUrl } from '../utils/document'

interface ContractDetailProps {
  contract: any
  onBack: () => void
  onEdit?: () => void
}

export const ContractDetail = ({ contract, onBack, onEdit }: ContractDetailProps) => {
  const { resolveDocumentName } = useDocumentNameResolver()
  const startDateText = formatDate(contract.start_date || contract.startDate)
  const endDateText = formatDate(contract.end_date || contract.endDate)
  const nextBillingText = formatDate(contract.next_billing_date || contract.nextBilling)
  const createdAtText = formatDateTime(contract.created_at || contract.dateCreated)

  const parsedStart = startDateText !== 'N/A' ? new Date(startDateText) : null
  const parsedEnd = endDateText !== 'N/A' ? new Date(endDateText) : null
  const durationDays =
    parsedStart && parsedEnd && !Number.isNaN(parsedStart.getTime()) && !Number.isNaN(parsedEnd.getTime())
      ? Math.max(1, Math.ceil((parsedEnd.getTime() - parsedStart.getTime()) / (1000 * 60 * 60 * 24)))
      : null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-800"
      case "DRAFT":
        return "bg-gray-100 text-gray-800"
      case "PENDING":
        return "bg-blue-100 text-blue-800"
      case "EXPIRED":
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
        <span className="text-gray-700 font-medium truncate">{contract.contractTitle || contract.contract_title || 'N/A'}</span>
      </nav>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{contract.contractTitle || contract.contract_title || 'N/A'}</h1>
            <p className="text-gray-600">Based on: {contract.selectedProposal || contract.proposals?.proposal_title || 'N/A'}</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(contract.status || contract.status)}`}>
              {contract.status || 'N/A'}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button className="flex items-center justify-center gap-2 px-2 py-1 md:px-4 md:py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 w-full sm:w-auto">
              <Download size={16} />
              Download
            </button>
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 w-full sm:w-auto"
              onClick={onEdit}
            >
              <Edit size={16} />
              Edit Contract
            </button>
          </div>
        </div>

        <div className="grid mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold mb-2">
                <Wallet size={16} />
                Contract Value
              </div>
              <p className="text-xl font-bold text-gray-900">
                {contract.currency || 'XAF'} {(contract.contractValue ?? contract.contract_value)?.toLocaleString?.() || 'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total signed portfolio amount</p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="flex items-center gap-2 text-blue-700 text-sm font-semibold mb-2">
                <CalendarDays size={16} />
                Contract Window
              </div>
              <p className="text-sm font-semibold text-gray-900">{startDateText}</p>
              <p className="text-xs text-gray-500">to {endDateText}</p>
              <div className="inline-flex mt-2 items-center gap-1 rounded-full bg-white border border-blue-200 px-2 py-0.5 text-xs font-semibold text-blue-700">
                <Clock3 size={12} />
                {durationDays ? `${durationDays} days` : "Duration N/A"}
              </div>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
              <div className="flex items-center gap-2 text-amber-700 text-sm font-semibold mb-2">
                <RefreshCcw size={16} />
                Billing Snapshot
              </div>
              <p className="text-sm text-gray-900 font-semibold">{contract.billingCycle || contract.billing_cycle || 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1">Next billing: {nextBillingText}</p>
              <p className="text-xs text-gray-500 mt-1 capitalize">Renewal: {contract.renewalType || contract.renewal_type || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Contract Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-gray-600">Contract Number</span>
              <span className="font-medium text-gray-900 text-right">{contract.contract_number || 'N/A'}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-600">Client</span>
              <span className="font-medium text-gray-900 text-right">{contract.clientName || contract.clients?.client_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-600">Proposal</span>
              <span className="font-medium text-gray-900 text-right">{contract.selectedProposal || contract.proposals?.proposal_title || 'N/A'}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-600">Date Created</span>
              <span className="font-medium text-gray-900 text-right">{createdAtText}</span>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Description / Scope of Work</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {contract.description || 'N/A'}
          </p>
        </div>

        {/* Document Section */}
        {contract.document_url && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Attached Document</h3>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Contract Document
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {resolveDocumentName(contract.document_url, "document.pdf")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a 
                    href={getDocumentPublicUrl(contract.document_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors whitespace-nowrap"
                  >
                    <ExternalLink size={12} />
                    View
                  </a>
                  <a 
                    href={getDocumentPublicUrl(contract.document_url)}
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
