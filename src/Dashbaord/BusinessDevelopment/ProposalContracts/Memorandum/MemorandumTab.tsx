import React, { useState, useEffect } from 'react'
import ReusableTable from '../../../../components/other/ReusableTable/ReusableTable'
import { createMemorandumColumns } from '@/components/Columns/MemorandumColumn'
import { NewMemorandumForm } from './NewMemorandumForm'
import { MemorandumDetail } from './MemorandumDetail'
import useFetchHook from '../../../../Hooks/UseFetchHook'
import { useDocumentUpload } from "../../../../Hooks/useDocumentUpload";
import { memorandumApi, mapMemorandumToFrontend } from './Memorandum.api'
import { useMemorandumStore } from './Memorandum.store'
import { Memorandum, MemorandumApiResponse } from './Memorandum.types'
import TableSkeleton from '../../../../components/other/Loader/TableSkeleton'
import { toast } from "sonner"
import { Button } from "../../../../components/ui/button"
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

interface MemorandumTabProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  statusFilter: string
  onStatusChange: (status: any) => void
  onExport: () => void
  onNewMemorandum: () => void
  triggerNewMemorandum?: boolean
}

type View = "list" | "new" | "detail"

export const MemorandumTab = ({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusChange, 
  onExport,
  onNewMemorandum,
  triggerNewMemorandum 
}: MemorandumTabProps) => {
  const { uploadDocument } = useDocumentUpload();
  const [view, setView] = useState<View>("list")
  const [selected, setSelected] = useState<Memorandum | null>(null)
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const { memorandums: memorandumsList, setMemorandums } = useMemorandumStore()

  const { data: apiResponse, isLoading, isError, error, refetch } = useFetchHook<any>(
    "/proposals-contracts/memorandums",
    "memorandums-list"
  )

  // Fetch contracts for the form
  const { data: contractsResponse } = useFetchHook<any>(
    "/proposals-contracts/contracts",
    "contracts-list"
  )

  const contractsList = (contractsResponse?.data || [])
    .filter((c: any) => ["ACCEPTED", "ACTIVE", "SIGNED"].includes(c.status))
    .map((c: any) => {
      const date = c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A';
      return {
        id: c.contract_id,
        title: `${c.contract_title} [${c.contract_number}] (${date})`
      };
    })

  useEffect(() => {
    if (apiResponse?.data) {
      const mapped = apiResponse.data.map((item: MemorandumApiResponse) => mapMemorandumToFrontend(item));
      setMemorandums(mapped);
    }
  }, [apiResponse, setMemorandums])

  // Listen for external trigger to show new form
  useEffect(() => {
    if (triggerNewMemorandum) {
      setSelected(null)
      setView("new")
    }
  }, [triggerNewMemorandum])

  useEffect(() => {
    if (!isError) return;
    toast.error(error?.response?.data?.message || error?.message || "Failed to load memorandums.");
  }, [isError, error]);

  const handleViewMemorandum = (id: string) => {
    const memorandum = memorandumsList.find(m => m.id === id)
    if (memorandum) {
      setSelected(memorandum)
      setView("detail")
    }
  }

  const handleEditMemorandum = (id: string) => {
    const memorandum = memorandumsList.find(m => m.id === id)
    if (memorandum) {
      setSelected(memorandum)
      setView("new")
    }
  }

  const handleDeleteMemorandum = (id: string) => {
    setDeleteModalId(id)
  }

  const confirmDelete = async () => {
    if (!deleteModalId) return;
    setIsDeleting(true);
    try {
      await memorandumApi.deleteMemorandum(deleteModalId)
      toast.success("Memorandum deleted successfully")
      refetch()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete memorandum")
    } finally {
      setIsDeleting(false);
      setDeleteModalId(null);
    }
  }

  const cancelDelete = () => {
    setDeleteModalId(null)
  }

  const handleDownloadMemorandum = (id: string) => {
    const memorandum = memorandumsList.find(m => m.id === id)
    if (memorandum && memorandum.documentUrl) {
      window.open(memorandum.documentUrl, '_blank')
    } else {
      toast.error("No document available for download")
    }
  }

  const handleSubmit = async (formData: any) => {
    try {
      let document_url = selected?.documentUrl || null;

      if (formData.document && formData.document instanceof File) {
        document_url = await uploadDocument(formData.document, {
          folder: "proposal-contracts/memorandum",
        });
      }

      // Verify contract selection
      if (!formData.contractId) {
        toast.error("Please select a valid contract");
        return;
      }

      const payload = {
        third_party_name: formData.thirdPartyName,
        contract_id: formData.contractId,
        third_party_role_description: formData.thirdPartyRole,
        digisol_role_description: formData.dgRole,
        third_party_percentage_gain: parseFloat(formData.third_party_percentage_gain),
        digisol_percentage_gain: parseFloat(formData.digisol_percentage_gain),
        status: formData.status as any,
        document_url,
        signed_at: formData.dateSigned || null,
      };

      if (selected) {
        await memorandumApi.updateMemorandum(selected.id, payload);
        toast.success("Memorandum updated successfully");
      } else {
        await memorandumApi.createMemorandum(payload);
        toast.success("Memorandum created successfully");
      }

      await refetch();
      handleBack();
    } catch (err: any) {
      toast.error(err.message || "Failed to save memorandum");
    }
  }

  const handleBack = () => {
    setSelected(null)
    setView("list")
  }

  // Create columns
  const columns = createMemorandumColumns({
    onViewMemorandum: handleViewMemorandum,
    onEditMemorandum: handleEditMemorandum,
    onDeleteMemorandum: handleDeleteMemorandum,
    onDownloadMemorandum: handleDownloadMemorandum,
  })

  const statusFilterOptions = [
    { key: "PENDING", value: "PENDING", label: "Pending" },
    { key: "ACCEPTED", value: "ACCEPTED", label: "Accepted" },
    { key: "REJECTED", value: "REJECTED", label: "Rejected" },
  ]

  if (isLoading && !memorandumsList.length) {
    return <TableSkeleton rows={7} columns={5} showHeader={true} showSearch={true} showFilters={true} />
  }

  if (view === "new") {
    return (
      <NewMemorandumForm 
        onCancel={handleBack} 
        onSubmit={handleSubmit}
        existingContracts={contractsList}
        initialData={selected || undefined}
      />
    )
  }

  if (view === "detail" && selected) {
    return (
      <MemorandumDetail 
        memorandum={selected} 
        onBack={handleBack} 
        onEdit={handleEditMemorandum}
      />
    )
  }

  return (
    <div>
      <ReusableTable
        columns={columns}
        data={memorandumsList}
        heading="All Memorandums"
        filterOptions={statusFilterOptions}
        filterKey="status"
        searchKeys={["thirdPartyName", "contractTitle", "status", "thirdPartyNameLocal"]}
        itemsPerPage={8}
        showSearch={true}
        showFilter={true}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        selectedFilter={statusFilter}
        onFilterChange={onStatusChange}
      />

      <AlertDialog open={deleteModalId !== null} onOpenChange={(open) => !open && cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Memorandum</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this memorandum? This action cannot be undone.
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
                  confirmDelete();
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
