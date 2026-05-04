import { Card } from '../../../components/other/Card'
import { ContractCard } from '../../../components/other/ClientsContractCard'
import { Button } from '../../../components/ui/button'
import { FaStar, FaFileContract, FaDollarSign, FaClock, FaExclamationCircle, FaDownload, FaCalendarAlt, FaSync, FaArrowLeft } from 'react-icons/fa'

interface ContractDetailViewProps {
  selectedContract: any
  clientData?: any
  onBack: () => void
}

export const ContractDetailView = ({ selectedContract, clientData, onBack }: ContractDetailViewProps) => {
  return (
    <div>
      <div className="grid grid-cols-4 gap-4">
        <Card 
          icons={<FaFileContract className="text-white" />} 
          heading="Active Contracts" 
          amount={clientData?.active_contracts?.toString() || "0"} 
        />
        <Card 
          icons={<FaExclamationCircle className="text-white" />} 
          heading="Expiring Soon" 
          amount={clientData?.expiring_soon?.toString() || "0"} 
        />
        <Card 
          icons={<FaDollarSign className="text-white" />} 
          heading="Total Contract Value" 
          amount={`${clientData?.total_contract_value?.toLocaleString() || "0"} XAF`} 
        />
        <Card 
          heading="Avg Contract Value" 
          amount={`${clientData?.average_contract_value?.toLocaleString() || "0"} XAF`}
          icons={<FaStar className="text-white" />}
        />
      </div>
      
      <div className="mt-6 bg-white rounded-lg p-4 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <FaArrowLeft size={12} />
            Back to Contracts
          </Button>
          <h2 className="text-base text-black/70 font-medium">Contract Details - {selectedContract.title}</h2>
        </div>
        
        <div className="space-y-6">
          <div className="shadow-xs rounded-lg p-6 bg-gray-50">
            {/* Contract Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                  selectedContract.status === 'active' 
                    ? 'bg-green-100' 
                    : 'bg-yellow-100'
                }`}>
                  <FaFileContract className={`${
                    selectedContract.status === 'active' 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`} size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 mb-1">{selectedContract.title}</h1>
                  <div className='flex gap-2 items-start'>
                    <p className="text-gray-600 text-base mb-3">{selectedContract.contractNumber}</p>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium inline-block ${
                      selectedContract.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedContract.status === 'active' ? 'Active' : 'Expiring Soon'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <FaDownload size={14} />
                  Download Contract
                </Button>
                <Button variant="default" size="sm">
                  Edit Contract
                </Button>
              </div>
            </div>

            {/* Contract Details Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <ContractCard
                icon={<FaDollarSign className="text-green-600" size={14} />}
                title="Contract Value"
                value={`${selectedContract.contractValue} XAF`}
              />
              
              <ContractCard
                icon={<FaCalendarAlt className="text-blue-600" size={14} />}
                title="Start Date"
                value={selectedContract.startDate}
              />
              
              <ContractCard
                icon={<FaCalendarAlt className="text-red-600" size={14} />}
                title="End Date"
                value={selectedContract.endDate}
              />
              
              <ContractCard
                icon={<FaClock className="text-purple-600" size={14} />}
                title="Billing Cycle"
                value={selectedContract.billingCycle}
              />
            </div>

            {/* Billing Information */}
            <div className="bg-blue-50/50 rounded-lg p-5 mb-6 border border-blue-100">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Billing Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaSync size={12} className={selectedContract.autoRenewal ? "text-green-500" : "text-gray-500"} />
                    <span className="text-sm font-medium text-gray-700">Renewal Type</span>
                  </div>
                  <p className="text-gray-800">{selectedContract.autoRenewal ? 'Auto-renewal' : 'Manual renewal'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaCalendarAlt className="text-orange-500" size={12} />
                    <span className="text-sm font-medium text-gray-700">Next Billing Date</span>
                  </div>
                  <p className="text-gray-800">{selectedContract.nextBilling}</p>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">Included Services</h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedContract.services.map((service: string, index: number) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"></div>
                      <span className="text-gray-800 text-sm">{service}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}