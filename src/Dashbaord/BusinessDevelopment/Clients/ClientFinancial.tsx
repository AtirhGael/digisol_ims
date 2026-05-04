import React from "react";
import { FaCreditCard, FaDollarSign, FaExclamationTriangle, FaClock } from 'react-icons/fa'

interface ClientFinancialProps {
  clientData?: any
}

export const ClientFinancial = ({ clientData }: ClientFinancialProps) => {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <FaDollarSign className="text-green-600" />
            Credit Limit
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {clientData?.credit_limit ? `${clientData.credit_limit.toLocaleString()} XAF` : 'N/A'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <FaCreditCard className="text-primary" />
            Payment Terms
          </h3>
          <p className="text-lg font-semibold text-primary">{clientData?.payment_terms || 'N/A'}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <FaExclamationTriangle className="text-orange-600" />
            Outstanding
          </h3>
          <p className="text-2xl font-bold text-orange-600">0 XAF</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Financial Overview</h2>
        </div>
        <div className="p-4">
          <div className="text-center py-12">
            <FaClock className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Financial data coming soon</p>
            <p className="text-gray-500 text-sm">Integration with finance module in progress</p>
          </div>
        </div>
      </div>
    </div>
  );
};
