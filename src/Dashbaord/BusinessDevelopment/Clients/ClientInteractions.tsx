import React, { useState, useEffect } from 'react'
import { FaPhone, FaVideo, FaUsers, FaMapMarkerAlt, FaEnvelope, FaDesktop } from 'react-icons/fa'
import { deleteInteraction, getClientInteractions, type Interaction } from './interactionsApi'
import SkeletonLoading from '@/components/other/Loader/SkeletonLoading/SkeletonLoading'
import { toast } from "sonner"
interface ClientInteractionsProps {
  clientData?: any
  clientId?: string
  refreshKey?: number
  onAddInteraction?: () => void
}

const getInteractionIcon = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'MEETING':
    case 'WORKSHOP':
      return <FaUsers className="text-white" size={14} />
    case 'CALL':
    case 'VIDEO_CALL':
      return type?.toUpperCase() === 'VIDEO_CALL' ? <FaVideo className="text-white" size={14} /> : <FaPhone className="text-white" size={14} />
    case 'EMAIL':
      return <FaEnvelope className="text-white" size={14} />
    case 'DEMO':
      return <FaDesktop className="text-white" size={14} />
    case 'SITE_VISIT':
      return <FaMapMarkerAlt className="text-white" size={14} />
    default: return <FaUsers className="text-white" size={14} />
  }
}

const getInteractionColor = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'MEETING':
    case 'WORKSHOP':
      return 'bg-blue-500'
    case 'CALL':
    case 'VIDEO_CALL':
      return 'bg-green-500'
    case 'EMAIL':
      return 'bg-purple-500'
    case 'DEMO':
      return 'bg-orange-500'
    case 'SITE_VISIT':
      return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

const getInteractionTypeLabel = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'MEETING': return 'Meeting'
    case 'WORKSHOP': return 'Workshop'
    case 'CALL': return 'Phone Call'
    case 'VIDEO_CALL': return 'Video Call'
    case 'EMAIL': return 'Email'
    case 'DEMO': return 'Demo'
    case 'SITE_VISIT': return 'Site Visit'
    default: return type || 'Interaction'
  }
}

export const ClientInteractions = ({ clientData, clientId, refreshKey, onAddInteraction }: ClientInteractionsProps) => {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Interaction | null>(null)
  // Resolve the correct client id from props or fetched data.
  const resolvedClientId = clientId || clientData?.id || clientData?.clientId

  // Fetch interactions for the resolved client id.
  const fetchInteractions = async () => {
    if (!resolvedClientId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const response = await getClientInteractions(resolvedClientId)
      
      if (response.success && response.data) {
        setInteractions(response.data)
      }
    } catch (err: any) {
      console.error('Failed to fetch interactions:', err)
      setError(err.response?.data?.message || 'Failed to load interactions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInteractions()
  }, [resolvedClientId, refreshKey])

  // Perform the delete request and update the list in place.
  const handleDelete = async (interactionId: string) => {
    try {
      setDeletingId(interactionId)
      setError(null)
      await deleteInteraction(interactionId)
      setInteractions((prev) => prev.filter((item) => item.interaction_id !== interactionId))
      if (selectedInteraction?.interaction_id === interactionId) {
        setSelectedInteraction(null)
      }
      toast.success("Interaction deleted successfully.")
    } catch (err: any) {
      console.error('Failed to delete interaction:', err)
      setError(err.response?.data?.message || 'Failed to delete interaction')
      toast.error(err?.response?.data?.message || "Failed to delete interaction.")
    } finally {
      setDeletingId(null)
    }
  }

  const requestDelete = (interaction: Interaction) => {
    setPendingDelete(interaction)
  }

  // Confirmed delete from the dialog.
  const confirmDelete = async () => {
    if (!pendingDelete) return
    const interactionId = pendingDelete.interaction_id
    setPendingDelete(null)
    await handleDelete(interactionId)
  }

  const meetingsCount = interactions.filter(i => ['MEETING', 'WORKSHOP'].includes(i.interaction_type?.toUpperCase())).length
  const callsCount = interactions.filter(i => ['CALL', 'VIDEO_CALL'].includes(i.interaction_type?.toUpperCase())).length
  const emailsCount = interactions.filter(i => i.interaction_type?.toUpperCase() === 'EMAIL').length
  const siteVisitsCount = interactions.filter(i => i.interaction_type?.toUpperCase() === 'SITE_VISIT').length

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`
  }

  if (isLoading) {
    return <SkeletonLoading/>
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <FaUsers className="text-primary" />
            Meetings
          </h3>
          <p className="text-2xl font-bold text-primary">{meetingsCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <FaPhone className="text-green-600" />
            Calls
          </h3>
          <p className="text-2xl font-bold text-green-600">{callsCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <FaEnvelope className="text-purple-600" />
            Emails
          </h3>
          <p className="text-2xl font-bold text-purple-600">{emailsCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <FaMapMarkerAlt className="text-orange-600" />
            Site Visits
          </h3>
          <p className="text-2xl font-bold text-orange-600">{siteVisitsCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">Total Interactions</h3>
          <p className="text-2xl font-bold text-gray-700">{interactions.length}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg px-2 sm:px-4 py-4 flex flex-col gap-4 sm:gap-6">
        <div>
          {error && (
            <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
              <button 
                onClick={fetchInteractions}
                className="text-sm text-red-600 underline mt-2"
              >
                Retry
              </button>
            </div>
          )}
          
          {interactions.length > 0 ? (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-4 sm:space-y-6">
                {interactions.map((interaction) => (
                  <div key={interaction.interaction_id} className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    <div className={`relative z-10 shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getInteractionColor(interaction.interaction_type)}`}>
                      {getInteractionIcon(interaction.interaction_type)}
                    </div>
                    
                    <div className="flex-1 bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getInteractionTypeLabel(interaction.interaction_type)}
                        </h3>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{formatDate(interaction.interaction_date)}</p>
                          <p className="text-xs text-gray-500">{formatTime(interaction.interaction_date)}</p>
                        </div>
                      </div>
                      
                      {interaction.summary && (
                        <p className="text-gray-700 mb-3">{interaction.summary}</p>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Duration:</span>
                          <p className="text-gray-800">{formatDuration(interaction.duration_minutes)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Participants:</span>
                          <p className="text-gray-800">
                            {interaction.action_items?.length > 0 
                              ? interaction.action_items.join(', ') 
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Recorded by:</span>
                          <p className="text-gray-800">{interaction.recorded_by_name || '-'}</p>
                        </div>
                      </div>
                      
                      {interaction.next_steps && interaction.next_steps.length > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm font-medium text-blue-700">Next Steps:</span>
                          <ul className="mt-1 text-sm text-blue-600">
                            {interaction.next_steps.map((step: any, idx: number) => (
                              <li key={idx}>• {step.plan_name} - Due: {step.date ? formatDate(step.date) : 'TBD'}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="mt-3 flex justify-between items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white capitalize ${getInteractionColor(interaction.interaction_type)}`}>
                          {getInteractionTypeLabel(interaction.interaction_type)}
                        </span>
                        
                        <div className="flex gap-2">
                          <button
                            className="text-xs text-blue-600 hover:text-blue-800"
                            onClick={() => setSelectedInteraction(interaction)}
                          >
                            View Details
                          </button>
                          {onAddInteraction && (
                            <button
                              className="text-xs text-green-600 hover:text-green-800"
                              onClick={onAddInteraction}
                            >
                              Follow Up
                            </button>
                          )}
                          <button
                            className="text-xs text-red-600 hover:text-red-800 disabled:opacity-60"
                            onClick={() => requestDelete(interaction)}
                            disabled={deletingId === interaction.interaction_id}
                          >
                            {deletingId === interaction.interaction_id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No interactions recorded for this client.</p>
          )}
        </div>
      </div>

      {/* Lightweight details modal for quick inspection */}
      {selectedInteraction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-lg bg-white p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {getInteractionTypeLabel(selectedInteraction.interaction_type)}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatDate(selectedInteraction.interaction_date)} at {formatTime(selectedInteraction.interaction_date)}
                </p>
              </div>
              <button
                onClick={() => setSelectedInteraction(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            {selectedInteraction.summary && (
              <p className="mt-3 text-sm text-gray-800">{selectedInteraction.summary}</p>
            )}

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-600">Duration:</span>
                <p className="text-gray-800">{formatDuration(selectedInteraction.duration_minutes)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Recorded by:</span>
                <p className="text-gray-800">{selectedInteraction.recorded_by_name || '-'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Participants:</span>
                <p className="text-gray-800">
                  {selectedInteraction.action_items?.length > 0
                    ? selectedInteraction.action_items.join(', ')
                    : '-'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Type:</span>
                <p className="text-gray-800">{getInteractionTypeLabel(selectedInteraction.interaction_type)}</p>
              </div>
            </div>

            {selectedInteraction.next_steps && selectedInteraction.next_steps.length > 0 && (
              <div className="mt-4 rounded-lg bg-blue-50 p-3">
                <span className="text-sm font-medium text-blue-700">Next Steps:</span>
                <ul className="mt-1 text-sm text-blue-600">
                  {selectedInteraction.next_steps.map((step: any, idx: number) => (
                    <li key={idx}>
                      • {step.plan_name} - Due: {step.date ? formatDate(step.date) : 'TBD'}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => requestDelete(selectedInteraction)}
                className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-60"
                disabled={deletingId === selectedInteraction.interaction_id}
              >
                {deletingId === selectedInteraction.interaction_id ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setSelectedInteraction(null)}
                className="rounded-md border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-lg bg-white px-6 py-5 text-sm text-gray-700 shadow">
            <p className="text-lg font-semibold text-gray-900">Delete Interaction</p>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete this interaction? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


