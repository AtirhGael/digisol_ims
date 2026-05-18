import { useNavigate, useParams } from 'react-router-dom';
import SkeletonLoading from '../../../components/other/Loader/SkeletonLoading/SkeletonLoading';
import { FaFileInvoice, FaArrowLeft, FaDownload } from 'react-icons/fa6';
import { type Transaction } from '../financeApi';
import useFetchHook from '../../../Hooks/UseFetchHook';
import { getDocumentDisplayName, getDocumentPublicUrl } from '../../BusinessDevelopment/ProposalContracts/utils/document';

interface TransactionDetail {
  amount: string;
  category: string;
  type: 'Expense' | 'Income';
  date: string;
  description: string;
  status: 'Pending' | 'Completed';
  attachments: Array<{
    name: string;
    date: string;
    url: string;
  }>;
}

export const TransactionDetails = () => {
  // Navigation + route param.
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    data: transaction,
    isLoading,
    isError,
    error,
    refetch,
  } = useFetchHook<Transaction>(
    id ? `/finance/transactions/${id}` : '',
    `transaction-${id}`,
    { enabled: Boolean(id) }
  );

  if (isLoading) {
    return <SkeletonLoading />
  }

  if (isError || !transaction) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-red-500 mb-4">{(error as any)?.response?.data?.message || 'Transaction not found'}</p>
        <button
          onClick={() => (id ? refetch() : navigate('/dashboard/transactions'))}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          {id ? 'Retry' : 'Back to Transactions'}
        </button>
      </div>
    );
  }

  const attachmentUrl = transaction.supporting_doc_url || '';

  const resolvedTransaction = ({
    amount: `${transaction.currency || 'XAF'} ${Number(transaction.amount).toLocaleString()}`,
    category: transaction.category || 'N/A',
    type: transaction.transaction_type,
    date: new Date(transaction.transaction_date).toLocaleDateString('en-GB'),
    description: transaction.description || 'N/A',
    status: ['POSTED', 'COMPLETED'].includes(transaction.status) ? 'Completed' : 'Pending',
    attachments: attachmentUrl
      ? [{
          name: getDocumentDisplayName(attachmentUrl, 'Transaction attachment'),
          date: transaction.created_at
            ? new Date(transaction.created_at).toLocaleDateString('en-GB')
            : new Date(transaction.transaction_date).toLocaleDateString('en-GB'),
          url: getDocumentPublicUrl(attachmentUrl),
        }]
      : [],
  } satisfies TransactionDetail);

  // Back to transactions list.
  const handleBack = () => {
    navigate('/dashboard/transactions');
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .transaction-print-area, .transaction-print-area * { visibility: visible !important; }
          .transaction-print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; }
          .no-print { display: none !important; }
          body { background: #ffffff !important; }
        }
      `}</style>
      {/* Header */}
      <div className="mb-6 no-print">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
        >
          <FaArrowLeft />
          <span>Back to Transactions</span>
        </button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Transactions Details</h1>
            <p className="text-sm text-gray-500">Manage and record transactions to keep track of spendings</p>
          </div>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            <FaDownload />
            Download PDF
          </button>
        </div>
      </div>

      {/* Transaction Details Card */}
      <div className="transaction-print-area bg-white rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-6">Transaction Details</h2>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Amount</label>
            <p className="text-base font-semibold text-gray-800">{resolvedTransaction.amount}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Category</label>
            <p className="text-base font-semibold text-gray-800">{resolvedTransaction.category}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Type</label>
            <span
              className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                resolvedTransaction.type === 'Expense'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-green-100 text-green-600'
              }`}
            >
              {resolvedTransaction.type}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Date</label>
            <p className="text-base font-semibold text-gray-800">{resolvedTransaction.date}</p>
          </div>
        </div>

        {/* Description, Status, and Attachments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
            <p className="text-base font-semibold text-gray-800">{resolvedTransaction.description}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Status</label>
            <span
              className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                resolvedTransaction.status === 'Pending'
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-green-100 text-green-600'
              }`}
            >
              {resolvedTransaction.status}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Attachments</label>
            <div className="space-y-2">
              {resolvedTransaction.attachments.length ? (
                resolvedTransaction.attachments.map((attachment, index) => (
                <a
                  key={`${attachment.url}-${index}`}
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  <FaFileInvoice className="text-gray-500 text-xl" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{attachment.name}</p>
                    <p className="text-xs text-gray-500">{attachment.date}</p>
                  </div>
                </a>
                ))
              ) : (
                <p className="text-sm text-gray-500">No attachment uploaded</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
