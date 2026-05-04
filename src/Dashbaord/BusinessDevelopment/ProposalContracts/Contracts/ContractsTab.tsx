import React, { useState, useEffect, useMemo } from 'react'
import { toast } from "sonner"
import { Button } from "../../../../components/ui/button"
import ReusableTable from '../../../../components/other/ReusableTable/ReusableTable'
import { createContractsColumns } from '@/components/Columns/ContractsColumn'
import { NewContractForm } from './NewContractForm'
import { ContractDetail } from './ContractDetail'
import { useUserStore } from '../../../../Store/UserStore'
import TableSkeleton from '../../../../components/other/Loader/TableSkeleton'
import { getAllContracts, deleteContract, type Contract } from './api'
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

interface ContractsTabProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  statusFilter: string
  onStatusChange: (status: any) => void
  onExport: () => void
  onNewContract: () => void
  triggerNewContract?: boolean
}

interface ContractType {
  contract_id: string
  contract_number: string
  contract_title: string
  client_id?: string
  proposal_id?: string
  proforma_id?: string
  description: string
  renewal_type: string
  billing_cycle: string
  next_billing_date: string
  start_date: string
  end_date: string
  contract_value: string
  currency: string
  document_url?: string
  status: 'PENDING' | 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED'
  signed_date?: string
  termination_date?: string
  termination_reason?: string
  created_by: string
  created_at: string
  updated_at: string
  clients?: any
  proposals?: {
    proposal_number: string
    proposal_title: string
  }
  users: {
    first_name: string
    last_name: string
  }
  contract_services?: Array<{
    contract_service_id: string
    contract_id: string
    service_id: string
    quantity: string
    unit_price: string
    start_date: string
    end_date?: string
    services?: {
      service_name: string
      service_code: string
      price: string
    }
  }>
}

type View = "list" | "new" | "detail"

export const ContractsTab: React.FC<ContractsTabProps> = ({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusChange, 
  onExport,
  onNewContract,
  triggerNewContract 
}) => {
  const [view, setView] = useState<View>("list")
  const [selected, setSelected] = useState<ContractType | null>(null)
  const [deleteContractId, setDeleteContractId] = useState<string | null>(null)
  const [contractsList, setContractsList] = useState<ContractType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { accessToken } = useUserStore()

  const fetchContracts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getAllContracts()
      if (response.success && response.data) {
        setContractsList(response.data.map((c: any) => ({
          ...c,
          created_by: c.created_by || '',
          updated_at: c.updated_at || '',
        })))
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError('You are not authorized to view contracts. Please log in again or contact your administrator.');
      } else {
        setError(err.response?.data?.message || 'Failed to load contracts');
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  useEffect(() => {
    if (triggerNewContract) {
      setView("new")
      setSelected(null)
    }
  }, [triggerNewContract])

  useEffect(() => {
    if (!error) return;
    toast.error(error);
  }, [error]);

  const handleBack = () => {
    setSelected(null)
    setView("list")
  }

  const handleViewContract = (id: string) => {
    const contract = contractsList.find((c: ContractType) => c.contract_id === id);
    if (contract) {
      setSelected(contract);
      setView("detail");
    }
  }

  const handleDeleteContract = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await deleteContract(id)
      if (response.success) {
        setContractsList(prev => prev.filter(c => c.contract_id !== id))
        toast.success("Contract deleted successfully")
      } else {
        toast.error(response.message || 'Failed to delete contract')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete contract')
    } finally {
      setIsDeleting(false);
      setDeleteContractId(null)
    }
  }

  const confirmDelete = () => {
    if(deleteContractId) handleDeleteContract(deleteContractId);
  }

  const cancelDelete = () => {
    setDeleteContractId(null);
  }

  const handleSubmit = async (contractData: any) => {
    if (!accessToken) {
      toast.error("You are not authenticated. Please log in again.");
      return;
    }

    try {
      const url = selected 
        ? `${import.meta.env.VITE_BASE_URL}/proposals-contracts/contracts/${selected.contract_id}`
        : `${import.meta.env.VITE_BASE_URL}/proposals-contracts/contracts`
      
      const method = selected ? 'PUT' : 'POST'

      const filteredServices = (contractData.services || []).filter((s: any) => s && typeof s === 'string' && s.trim() !== "");
      
      const finalContractData = {
        ...contractData,
        services: filteredServices
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalContractData)
      })

      if (response.ok) {
        await fetchContracts();
        toast.success(`Contract ${selected ? "updated" : "created"} successfully`);
        handleBack();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to ${selected ? 'update' : 'create'} contract: ${errorData.message}`);
      }
    } catch (error) {
      toast.error(`Failed to ${selected ? 'update' : 'create'} contract. Please try again.`)
    }
  }

  const handleEditContract = (id: string) => {
    const contract = contractsList.find(c => c.contract_id === id);
    if (contract) {
      setSelected(contract);
      setView("new");
    }
  };

  const columns = createContractsColumns({
    onViewContract: handleViewContract,
    onEditContract: handleEditContract,
    onDeleteContract: (id) => setDeleteContractId(id),
  })

  const filteredContracts = useMemo(() => {
    let filtered = contractsList

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(c => 
        c.contract_title?.toLowerCase().includes(term) ||
        c.proposals?.proposal_title?.toLowerCase().includes(term) ||
        c.clients?.client_name?.toLowerCase().includes(term)
      )
    }

    if (statusFilter && statusFilter !== 'All') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    return filtered
  }, [contractsList, searchTerm, statusFilter])

  const resolveClientContacts = (client: any): string[] => {
    if (!client) return [];
    const rawContacts = client.contacts ?? client.contact_person ?? client.contactPerson;
    if (Array.isArray(rawContacts)) {
      return rawContacts
        .map((contact: any) =>
          typeof contact === "string"
            ? contact
            : contact?.name || contact?.contact_person || contact?.full_name || contact?.email
        )
        .filter(Boolean);
    }
    if (typeof rawContacts === "string") {
      return rawContacts
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    }
    return [];
  };

  const transformedContracts = useMemo(() => {
    return filteredContracts.map((contract: ContractType) => ({
      id: contract.contract_id,
      contract_id: contract.contract_id,
      contract_number: contract.contract_number,
      contractTitle: contract.contract_title,
      selectedProposal: contract.proposals?.proposal_title || 'N/A',
      clientName: contract.clients?.client_name || 'N/A',
      clientContacts: resolveClientContacts(contract.clients),
      startDate: formatDate(contract.start_date),
      endDate: formatDate(contract.end_date),
      startDateISO: contract.start_date || null,
      endDateISO: contract.end_date || null,
      durationDays:
        contract.start_date && contract.end_date
          ? Math.max(
              1,
              Math.ceil(
                (new Date(contract.end_date).getTime() - new Date(contract.start_date).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            )
          : null,
      contractValue: typeof contract.contract_value === 'number' ? contract.contract_value : Number(contract.contract_value) || 0,
      currency: contract.currency || 'XAF',
      status: contract.status,
      renewalType: contract.renewal_type,
      billingCycle: contract.billing_cycle,
      nextBilling: formatDate(contract.next_billing_date),
      services: Array.isArray(contract.contract_services)
        ? contract.contract_services.map(cs => cs.services?.service_name || '').filter(Boolean)
        : [],
      dateCreated: formatDate(contract.created_at),
      description: contract.description,
      created_by: contract.created_by
    }))
  }, [filteredContracts]);

  const statusFilterOptions = [
    { key: "PENDING", value: "PENDING", label: "Pending" },
    { key: "ACCEPTED", value: "ACCEPTED", label: "Accepted" },
    { key: "ACTIVE", value: "ACTIVE", label: "Active" },
    { key: "CANCELLED", value: "CANCELLED", label: "Cancelled" },
    { key: "REJECTED", value: "REJECTED", label: "Rejected" },
  ]

  if (view === "new") {
    return <NewContractForm onCancel={handleBack} onSubmit={handleSubmit} editContract={selected} />
  }

  if (view === "detail" && selected) {
    return <ContractDetail contract={selected} onBack={handleBack} onEdit={() => handleEditContract(selected.contract_id)} />
  }

  return (
    <div>
      {isLoading ? (
        <TableSkeleton rows={7} columns={5} showHeader={true} showSearch={true} showFilters={true} />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchContracts} loading={isLoading}>Retry</Button>
        </div>
      ) : (
        <ReusableTable
          columns={columns}
          data={transformedContracts}
          heading="All Contracts"
          filterOptions={statusFilterOptions}
          filterKey="status"
          searchKeys={["contractTitle", "selectedProposal", "clientName", "clientContacts"]}
          itemsPerPage={8}
          showSearch={true}
          showFilter={true}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          selectedFilter={statusFilter}
          onFilterChange={onStatusChange}
        />
      )}

      <AlertDialog open={deleteContractId !== null} onOpenChange={(open) => !open && cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contract</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contract? This action cannot be undone.
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
