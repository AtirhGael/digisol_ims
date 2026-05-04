import React, { useEffect, useMemo, useState } from 'react'
import { Card } from '../../../components/other/Card'
import { ContractCard } from '../../../components/other/ClientsContractCard'
import { ContractDetailView } from './ContractDetailView'
import { Button } from '../../../components/ui/button'
import { FaStar, FaFileContract, FaDollarSign, FaClock, FaExclamationCircle, FaEye, FaDownload, FaCalendarAlt, FaSync } from 'react-icons/fa'
import { getClientContracts, type Contract } from '../ProposalContracts/Contracts/api'
import SkeletonLoading from '@/components/other/Loader/SkeletonLoading/SkeletonLoading'

interface ClientContractsProps {
  clientData?: any
  clientId?: string
}

type ContractStatus = 'active' | 'expired' | 'pending'

type ClientContractRow = {
  id: string
  title: string
  contractNumber: string
  status: ContractStatus
  contractValue: string
  startDate: string
  endDate: string
  billingCycle: string
  autoRenewal: boolean
  nextBilling: string
  services: string[]
  raw: Contract
}

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const resolveStatus = (status?: string): ContractStatus => {
  const normalized = (status || '').toUpperCase()
  if (normalized === 'ACTIVE') return 'active'
  if (normalized === 'EXPIRED') return 'expired'
  return 'pending'
}

const extractContracts = (response: unknown): Contract[] => {
  const payload = response as any
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  return []
}

const mapContract = (contract: Contract): ClientContractRow => ({
  id: contract.contract_id,
  title: contract.contract_title || 'Untitled Contract',
  contractNumber: contract.contract_number || 'N/A',
  status: resolveStatus(contract.status),
  contractValue: contract.contract_value?.toLocaleString() || '0',
  startDate: formatDate(contract.start_date),
  endDate: formatDate(contract.end_date),
  billingCycle: contract.billing_cycle || 'Monthly',
  autoRenewal: contract.renewal_type === 'Auto-renewal',
  nextBilling: formatDate(contract.next_billing_date),
  services: contract.contract_services?.map((s: any) => s.service_name || 'Service') || [],
  raw: contract,
})

export const ClientContracts = ({ clientData, clientId }: ClientContractsProps): React.ReactElement | null => {
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list')
  const [selectedContract, setSelectedContract] = useState<ClientContractRow | null>(null)
  const [contracts, setContracts] = useState<ClientContractRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // Resolve the correct client id from props or fetched data.
  const resolvedClientId = clientId || clientData?.client_id || clientData?.id || clientData?.clientId

  // Fetch contracts for the resolved client id.
  const fetchContracts = async () => {
    if (!resolvedClientId) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await getClientContracts(resolvedClientId)
      const rawContracts = extractContracts(response)
      setContracts(rawContracts.map(mapContract))
    } catch {
      setContracts([])
    } finally {
      setIsLoading(false);
    }
  } 

  useEffect(() => {
    if (resolvedClientId) {
      fetchContracts()
    }
  }, [resolvedClientId])

  const handleViewContract = (contract: ClientContractRow) => {
    setSelectedContract(contract)
    setCurrentView('detail')
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setSelectedContract(null)
  }

  const summary = useMemo(() => {
    const now = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const activeCount = contracts.filter(c => c.status === 'active').length
    const expiringSoonCount = contracts.filter(c => {
      if (!c.raw?.end_date) return false
      const endDate = new Date(c.raw.end_date)
      return endDate <= thirtyDaysFromNow && endDate >= now
    }).length
    const totalValue = contracts.reduce((sum, c) => {
      const raw = c.raw?.contract_value
      const value = typeof raw === 'number' ? raw : parseFloat(raw || '0')
      return Number.isNaN(value) ? sum : sum + value
    }, 0)
    const avgValue = contracts.length > 0 ? totalValue / contracts.length : 0

    return { activeCount, expiringSoonCount, totalValue, avgValue }
  }, [contracts])

  if (currentView === 'detail' && selectedContract) {
    return (
      <ContractDetailView 
        selectedContract={selectedContract}
        clientData={clientData}
        onBack={handleBackToList}
      />
    )
  }

  if (isLoading) {
    return <SkeletonLoading />
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card 
          icons={<FaFileContract className="text-white" />} 
          heading="Active Contracts" 
          amount={summary.activeCount.toString()} 
        />
        <Card 
          icons={<FaExclamationCircle className="text-white" />} 
          heading="Expiring Soon" 
          amount={summary.expiringSoonCount.toString()} 
        />
        <Card 
          icons={<FaDollarSign className="text-white" />} 
          heading="Total Contract Value" 
          amount={`${summary.totalValue.toLocaleString()} XAF`} 
        />
        <Card 
          heading="Avg Contract Value" 
          amount={`${summary.avgValue.toLocaleString()} XAF`}
          icons={<FaStar className="text-white" />}
        />
      </div>
      
      <div className="mt-6 bg-white rounded-lg p-4 flex flex-col gap-4">
        <div className="">
          <h2 className="text-lg text-black/70 font-semibold">Contract Details</h2>
        </div>
        <div className="">
          {contracts.length > 0 ? (
            <div className="space-y-6">
              {contracts.map((contract) => (
                <div key={contract.id} className="rounded-lg p-6 bg-gray-50">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        contract.status === 'active' 
                          ? 'bg-green-100' 
                          : 'bg-yellow-100'
                      }`}>
                        <FaFileContract className={`${
                          contract.status === 'active' 
                            ? 'text-green-600' 
                            : 'text-yellow-600'
                        }`} size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{contract.title}</h3>
                        <p className="text-sm text-gray-500">{contract.contractNumber}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        contract.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : contract.status === 'expired'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {contract.status === 'active' ? 'Active' : contract.status === 'expired' ? 'Expired' : 'Pending'}
                      </span>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-gray-600" onClick={() => handleViewContract(contract)}>
                          <FaEye size={14} />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="text-gray-600">
                          <FaDownload size={14} />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <ContractCard
                      icon={<FaDollarSign className="text-gray-400" size={14} />}
                      title="Contract Value"
                      value={`${contract.contractValue} XAF`}
                    />
                    
                    <ContractCard
                      icon={<FaCalendarAlt className="text-gray-400" size={14} />}
                      title="Start Date"
                      value={contract.startDate}
                    />
                    
                    <ContractCard
                      icon={<FaCalendarAlt className="text-gray-400" size={14} />}
                      title="End Date"
                      value={contract.endDate}
                    />
                    
                    <ContractCard
                      icon={<FaClock className="text-gray-400" size={14} />}
                      title="Billing Cycle"
                      value={contract.billingCycle}
                    />
                  </div>

                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-gray-700">Included services:</span>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaSync size={12} className={contract.autoRenewal ? "text-green-400" : "text-gray-400"} />
                        <span>{contract.autoRenewal ? 'Auto-renewal' : 'Manual renewal'}</span>
                      </div>
                      <span>Next billing: {contract.nextBilling}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {contract.services.map((service: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                      >
                        {service}
                      </span>
                    ))}
                    {contract.services.length === 0 && (
                      <span className="text-gray-500 text-sm">No services listed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No contracts found for this client.</p>
          )}
        </div>
      </div>
    </div>
  )
}
