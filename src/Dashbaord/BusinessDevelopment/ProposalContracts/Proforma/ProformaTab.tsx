import React, { useState, useEffect } from 'react'
import ReusableTable from '../../../../components/other/ReusableTable/ReusableTable'
import { createProformaColumns } from '../../../../components/Columns/ProformaColumn'
import { NewProformaForm } from './NewProformaForm'
import { ProformaDetail } from './ProformaDetail'
import useFetchHook from '../../../../Hooks/UseFetchHook'
import usePost from '../../../../Hooks/UsePostHook'
import useUpdate from '../../../../Hooks/UseUpdateHook'
import { useDeleteHook } from '../../../../Hooks/UseDeleteHook'
import TableSkeleton from '../../../../components/other/Loader/TableSkeleton'
import { Button } from "../../../../components/ui/button"
import { toast } from "sonner"
import { formatDate } from '../utils/dateTime'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";

interface ProformaTabProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  statusFilter: string
  onStatusChange: (status: any) => void
  onExport: () => void
  onNewProforma: () => void
  triggerNewProforma?: boolean
  onEdit?: (proforma: any) => void
  onDelete?: (proforma: any) => void
  onView?: (proforma: any) => void
}

type View = "list" | "new" | "detail" | "edit"

export const ProformaTab = ({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusChange, 
  onExport,
  onNewProforma,
  triggerNewProforma 
}: ProformaTabProps) => {
  const [view, setView] = useState<View>("list")
  const [editingProforma, setEditingProforma] = useState<any>(null)
  const [selected, setSelected] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [proformaToDelete, setProformaToDelete] = useState<any>(null)

  const { data: fetchedData, isLoading, error, isError, refetch } = useFetchHook('/proposals-contracts/proforma-invoices', 'proforma-data', {
    enabled: true,
    refetchOnWindowFocus: false
  })

  const { mutate: deleteProforma } = useDeleteHook(
    '/proposals-contracts/proforma-invoices',
    ['proforma-data']
  )

  const { postData: createProforma, loading: isCreatingProforma } = usePost()
  const { updateData: updateProforma, loading: isUpdatingProforma } = useUpdate()

  let proformaList: any[] = []
  
  if (fetchedData) {
    if (fetchedData.success && fetchedData.data) {
      const proformasArray = Array.isArray(fetchedData.data) ? fetchedData.data : [fetchedData.data]
      proformaList = proformasArray.map((item: any, index: number) => ({
        id: item.proforma_id,
        proformaTitle: item.proforma_title || "Untitled Proforma",
        proposalTitle: item.proposals?.proposal_title || item.proposal_title || "No Proposal",
        value: parseFloat(item.proforma_value) || 0,
        status: (item.status || "PENDING").toUpperCase(),
        services: item.proforma_invoice_services?.map((s: any) => s.services?.service_name || s.service_name) || [],
        proforma_invoice_services: item.proforma_invoice_services || [],
        dateAdded: formatDate(item.created_at, formatDate(new Date())),
        dateCreated: formatDate(item.created_at, formatDate(new Date())),
        dateSent: (item.sent_at || item.date_sent || item.sent_date) ? formatDate(item.sent_at || item.date_sent || item.sent_date) : null,
        description: item.description || "",
        proforma_number: item.proforma_number,
        proposal_id: item.proposal_id,
        currency: item.currency || "XAF",
        document_url: item.document_url,
        created_by: item.users ? `${item.users.first_name} ${item.users.last_name}` : "Unknown"
      }))
    }
  }

  useEffect(() => {
    if (triggerNewProforma) {
      setView("new")
    }
  }, [triggerNewProforma])

  useEffect(() => {
    if (!isError) return;
    toast.error(error?.response?.data?.message || error?.message || "Failed to load proforma invoices.");
  }, [isError, error]);

  const handleViewProforma = (id: string) => {
    const proforma = proformaList.find(p => String(p.id) === id)
    if (proforma) {
      setSelected(proforma)
      setView("detail")
    }
  }

  const handleEditProforma = (id: string) => {
    const proforma = proformaList.find(p => String(p.id) === id)
    if (proforma) {
      setEditingProforma(proforma)
      setView("edit")
    }
  }

  const handleDeleteProforma = async (id: string) => {
    const proforma = proformaList.find(p => String(p.id) === id)
    if (proforma) {
      setProformaToDelete({ id, proforma })
      setDeleteDialogOpen(true)
    }
  }

  const confirmDeleteProforma = async () => {
    if (!proformaToDelete) return
    
    setIsDeleting(true)
    try {
      await deleteProforma(proformaToDelete.id)
      toast.success('Proforma deleted successfully!')
      await refetch()
    } catch (error) {
      toast.error('Failed to delete proforma. Please try again.')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setProformaToDelete(null)
    }
  }

  const handleNewProforma = () => {
    setEditingProforma(null)
    setView("new")
  }
  
  const handleBack = () => { 
    setView("list")
    setSelected(null)
    setEditingProforma(null)
  }
  
  const handleSubmit = async (proforma: any) => {
    try {
      if (editingProforma) {
        const sentAt = proforma.status === "SENT"
          ? (proforma.dateSent || new Date().toISOString())
          : proforma.dateSent;

        const proformaData = {
          proforma_number: proforma.proforma_number,
          proforma_title: proforma.proformaTitle,
          proposal_id: proforma.proposal_id,
          description: proforma.description,
          proforma_value: proforma.value,
          currency: proforma.currency || "XAF",
          document_url: proforma.document_url,
          status: proforma.status || "PENDING",
          services: proforma.services,
          date_created: proforma.dateCreated,
          sent_at: sentAt,
          date_added: proforma.dateAdded
        }
        
        await updateProforma(`/proposals-contracts/proforma-invoices/${editingProforma.id}`, proformaData)
        toast.success('Proforma updated successfully!')
      } else {
        if (!proforma.proposal_id || proforma.proposal_id === '' || proforma.proposal_id === '0') {
          toast.error('Please select a proposal before creating the proforma invoice.');
          return;
        }
        
        const proformaData = {
          proforma_number: proforma.proforma_number,
          proforma_title: proforma.proformaTitle,
          proposal_id: proforma.proposal_id,
          description: proforma.description,
          proforma_value: proforma.value,
          currency: proforma.currency || "XAF",
          document_url: proforma.document_url,
          status: proforma.status || "PENDING",
          services: proforma.services,
          date_created: proforma.dateCreated,
          date_sent: proforma.dateSent,
          date_added: proforma.dateAdded
        }
        
        await createProforma('/proposals-contracts/proforma-invoices', proformaData)
        toast.success('Proforma created successfully!')
      }
      
      await refetch()
      setView("list")
      setEditingProforma(null)
    } catch (error: any) {
      let errorMessage = `Failed to ${editingProforma ? 'update' : 'create'} proforma. Please try again.`
      if (error?.response?.data?.message) errorMessage = error.response.data.message
      else if (error?.message) errorMessage = error.message
      toast.error(errorMessage)
    }
  }

  const columns = createProformaColumns({
    onViewProforma: handleViewProforma,
    onEditProforma: handleEditProforma,
    onDeleteProforma: handleDeleteProforma,
  })

  const statusFilterOptions = [
    { key: "PENDING", value: "PENDING", label: "Pending" },
    { key: "SENT", value: "SENT", label: "Sent" },
    { key: "ACCEPTED", value: "ACCEPTED", label: "Accepted" },
    { key: "REJECTED", value: "REJECTED", label: "Rejected" },
  ]

  return (
    <div>
      {view === "list" && (
        <div>
          {isLoading && (
            <TableSkeleton rows={7} columns={5} showHeader={true} showSearch={true} showFilters={true} />
          )}
          {!isLoading && (
            <ReusableTable
              columns={columns}
              data={proformaList}
              heading="All Proforma"
              filterOptions={statusFilterOptions}
              filterKey="status"
              searchKeys={["proformaTitle", "proposalTitle", "services"]}
              itemsPerPage={8}
              showSearch={true}
              showFilter={true}
            />
          )}
        </div>
      )}
      {(view === "new" || view === "edit") && (
        <NewProformaForm 
          onCancel={handleBack} 
          onSubmit={handleSubmit}
          editProforma={editingProforma}
        />
      )}
      {view === "detail" && selected && (
        <ProformaDetail 
          proforma={selected} 
          onBack={handleBack}
          onEdit={() => handleEditProforma(selected.id)}
        />
      )}

      <AlertDialog
        open={deleteDialogOpen && proformaToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogOpen(false);
            setProformaToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Proforma Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{proformaToDelete?.proforma?.proformaTitle || "this proforma"}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={isDeleting}>Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={(e) => {
                  e.preventDefault();
                  confirmDeleteProforma();
                }}
                disabled={isDeleting}
                loading={isDeleting}
              >
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
