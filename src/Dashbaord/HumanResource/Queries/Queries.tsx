import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Clock, Mail, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card } from '../../../components/other/Card';
import { Button } from '../../../components/ui/button';
import { HeadingComponent } from '../../../components/other/HeadingComponent';
import SkeletonLoading from '../../../components/other/Loader/SkeletonLoading/SkeletonLoading';
import ReusableTable from '../../../components/other/ReusableTable/ReusableTable';
import { createQueryColumns } from '../../../components/Columns/QueryColumns';
import { useFetchHook } from '../../../Hooks/UseFetchHook';
import { useDeleteHook } from '../../../Hooks/UseDeleteHook';
import type { HrQuery, HrQuerySummary } from '../hrApi';
import useUpdate from '../../../Hooks/UseUpdateHook';
import { useUserStore } from '../../../Store/UserStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';

type QueryRecord = {
  id: string;
  submittedDate: string;
  employee: string;
  category: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  lastUpdated: string;
  resolutionNotes: string | null;
  resolvedAt: string | null;
};

const TAB_TO_STATUS: Record<string, string> = {
  'Open Queries': 'Open',
  'In Progress': 'In Progress',
  Resolved: 'Resolved',
  'All Queries': '',
};

const STATUS_TO_TAB: Record<string, string> = {
  Open: 'Open Queries',
  'In Progress': 'In Progress',
  Resolved: 'Resolved',
  '': 'All Queries',
};

const QUERY_TABS = ['Open Queries', 'In Progress', 'Resolved', 'All Queries'];

type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-gray-100 bg-white p-4">
    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
    <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
  </div>
);

const Queries = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { roles } = useUserStore();

  // Determine if current user is HR / admin (can manage all queries)
  const isHR = roles.some((r) =>
    ['SUPER_ADMIN', 'HR_MANAGER', 'HR', 'ADMIN'].includes(r.toUpperCase())
  );

  const [activeTab, setActiveTab] = useState('Open Queries');
  const [statusFilter, setStatusFilter] = useState('Open');
  const [selectedQuery, setSelectedQuery] = useState<QueryRecord | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [queryToDelete, setQueryToDelete] = useState<QueryRecord | null>(null);
  const [hasLoadedPage, setHasLoadedPage] = useState(false);
  const [resolveStatus, setResolveStatus] = useState('');
  const [resolveNotes, setResolveNotes] = useState('');
  const [employeeResponse, setEmployeeResponse] = useState('');
  const { updateData: updateQueryData, loading: resolving } = useUpdate();

  const deleteQueryMutation = useDeleteHook('/queries', ['hr-queries', 'hr-queries-summary']);

  // Always fetch all queries — card counts are derived from this single dataset.
  const {
    data: queriesResponse,
    isLoading: loading,
    error,
  } = useFetchHook<PaginatedResponse<HrQuery>>(
    '/queries?page_size=500',
    'hr-queries'
  );

  const {
    data: summaryResponse,
    isLoading: summaryLoading,
    error: summaryError,
  } = useFetchHook<{ success: boolean; message: string; data: HrQuerySummary }>(
    '/queries/summary',
    'hr-queries-summary'
  );

  React.useEffect(() => {
    if (error) toast.error(error.response?.data?.message || 'Failed to load queries.');
  }, [error]);

  React.useEffect(() => {
    if (summaryError) toast.error(summaryError.response?.data?.message || 'Failed to load query summary.');
  }, [summaryError]);

  React.useEffect(() => {
    if (!loading && !summaryLoading) setHasLoadedPage(true);
  }, [loading, summaryLoading]);

  const allQueries = (queriesResponse?.data ?? []).map((query) => ({
    id: query.query_id,
    submittedDate: query.created_at,
    employee: query.employee_name,
    category: query.category,
    title: query.title,
    description: query.description,
    status:
      query.status === 'IN_PROGRESS'
        ? 'In Progress'
        : query.status === 'RESOLVED'
          ? 'Resolved'
          : 'Open',
    priority:
      query.priority === 'NORMAL'
        ? 'Medium'
        : query.priority.charAt(0) + query.priority.slice(1).toLowerCase(),
    assignedTo: query.assigned_to_name ?? '-',
    lastUpdated: query.updated_at ?? query.created_at,
    resolutionNotes: query.resolution_notes ?? null,
    resolvedAt: query.resolved_at ?? null,
  }));

  // Filter table rows locally so cards always reflect the full dataset.
  const queries = statusFilter
    ? allQueries.filter((q) => q.status === statusFilter)
    : allQueries;

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
    setStatusFilter(TAB_TO_STATUS[tabName] ?? '');
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setActiveTab(STATUS_TO_TAB[value] ?? 'All Queries');
  };

  const stats = [
    {
      title: 'Open Queries',
      value: String(allQueries.filter((q) => q.status === 'Open').length),
      subtitle: 'Request',
      icon: Mail,
    },
    {
      title: 'In Progress',
      value: String(allQueries.filter((q) => q.status === 'In Progress').length),
      subtitle: 'Queries',
      icon: MessageSquare,
    },
    {
      title: 'Resolved Queries',
      value: String(allQueries.filter((q) => q.status === 'Resolved').length),
      subtitle: 'Total',
      icon: CheckCircle,
    },
    {
      title: 'Avg Resolution(days)',
      value: String(summaryResponse?.data.avg_resolution_days ?? 0),
      subtitle: 'Days',
      icon: Clock,
    },
  ];

  const handleView = (id: string) => {
    const query = allQueries.find((item) => item.id === id);
    if (!query) return;
    setSelectedQuery(query);
    setResolveStatus('');
    setResolveNotes('');
    setEmployeeResponse('');

    // Auto-transition: OPEN → IN_PROGRESS when an employee views their own query
    if (!isHR && query.status === 'Open') {
      updateQueryData(`/queries/${id}`, { status: 'IN_PROGRESS' }, 'patch')
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['hr-queries'] });
          queryClient.invalidateQueries({ queryKey: ['hr-queries-summary'] });
          setSelectedQuery((prev) => prev ? { ...prev, status: 'In Progress' } : prev);
        })
        .catch(() => {/* silent — status update failure shouldn't block viewing */});
    }
  };

  const handleUpdateQuery = async () => {
    if (!selectedQuery || !resolveStatus) return;
    try {
      await updateQueryData(`/queries/${selectedQuery.id}`, {
        status: resolveStatus,
        ...(resolveStatus === 'RESOLVED' && resolveNotes ? { resolution_notes: resolveNotes } : {}),
      }, 'patch');
      toast.success(
        resolveStatus === 'RESOLVED' ? 'Query resolved successfully.' : 'Query updated successfully.'
      );
      queryClient.invalidateQueries({ queryKey: ['hr-queries'] });
      queryClient.invalidateQueries({ queryKey: ['hr-queries-summary'] });
      setSelectedQuery(null);
      setResolveStatus('');
      setResolveNotes('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update query.');
    }
  };

  const handleDelete = (id: string) => {
    const query = allQueries.find((item) => item.id === id);
    if (!query) return;
    setQueryToDelete(query);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!queryToDelete) return;
    try {
      await deleteQueryMutation.mutateAsync(queryToDelete.id);
      if (selectedQuery?.id === queryToDelete.id) setSelectedQuery(null);
      setDeleteModalOpen(false);
      setQueryToDelete(null);
      toast.success('Query deleted successfully.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete query.');
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setQueryToDelete(null);
  };

  const columns = createQueryColumns({ onView: handleView, onDelete: handleDelete });

  const initialPageLoading = !hasLoadedPage && (loading || summaryLoading);

  if (initialPageLoading) return <SkeletonLoading />;

  if (selectedQuery) {
    return (
      <div className="flex flex-col gap-5">
        <button
          className="mb-2 flex w-fit items-center gap-2 text-sm text-gray-600 hover:text-primary"
          onClick={() => setSelectedQuery(null)}
        >
          <ArrowLeft size={16} /> Back to Queries
        </button>

        <div className="rounded-xl border border-gray-100 bg-white p-6">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">{selectedQuery.id}</span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                {selectedQuery.status}
              </span>
            </div>
            <p className="text-base font-semibold text-gray-900">{selectedQuery.title}</p>
            <p className="text-sm text-gray-400">Query submitted by {selectedQuery.employee}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DetailRow label="Employee" value={selectedQuery.employee} />
          <DetailRow label="Category" value={selectedQuery.category} />
          <DetailRow label="Status" value={selectedQuery.status} />
          <DetailRow label="Priority" value={selectedQuery.priority} />
          <DetailRow label="Assigned To" value={selectedQuery.assignedTo} />
          <DetailRow label="Submitted Date" value={formatDate(selectedQuery.submittedDate)} />
          <DetailRow label="Last Updated" value={formatDate(selectedQuery.lastUpdated)} />
          <DetailRow label="Query ID" value={selectedQuery.id} />
          {selectedQuery.resolvedAt && (
            <DetailRow label="Resolved At" value={formatDate(selectedQuery.resolvedAt)} />
          )}
        </div>

        <div className="rounded-lg border border-gray-100 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Description</p>
          <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{selectedQuery.description || '-'}</p>
        </div>

        {selectedQuery.resolutionNotes && (
          <div className="rounded-lg border border-green-100 bg-green-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-green-600">Resolution Notes</p>
            <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{selectedQuery.resolutionNotes}</p>
          </div>
        )}

        {selectedQuery.status !== 'Resolved' && (
          <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <h3 className="text-sm font-semibold text-gray-800">
                {isHR ? 'Update Query Status' : 'Respond to Query'}
              </h3>
            </div>

            {isHR ? (
              /* ── HR / Admin: manual status picker ── */
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">New Status</label>
                  <select
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={resolveStatus}
                    onChange={(e) => setResolveStatus(e.target.value)}
                  >
                    <option value="">Select status...</option>
                    {selectedQuery.status === 'Open' && (
                      <option value="IN_PROGRESS">In Progress</option>
                    )}
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>

                {resolveStatus === 'RESOLVED' && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Resolution Notes</label>
                    <textarea
                      rows={3}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="Describe how the query was resolved..."
                      value={resolveNotes}
                      onChange={(e) => setResolveNotes(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-1">
                  <Button variant="outline" onClick={() => setSelectedQuery(null)} disabled={resolving}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateQuery}
                    disabled={!resolveStatus || resolving}
                    loading={resolving}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    {resolveStatus === 'RESOLVED' ? 'Resolve Query' : 'Update Status'}
                  </Button>
                </div>
              </>
            ) : (
              /* ── Employee: respond & resolve ── */
              <>
                <p className="text-sm text-gray-500">
                  Describe how this query was resolved or provide your response. Submitting will automatically mark the query as resolved.
                </p>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Your Response / Resolution</label>
                  <textarea
                    rows={4}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Describe the resolution or your response to this query..."
                    value={employeeResponse}
                    onChange={(e) => setEmployeeResponse(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-1">
                  <Button variant="outline" onClick={() => setSelectedQuery(null)} disabled={resolving}>
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!employeeResponse.trim()) {
                        toast.error('Please enter a response before submitting.');
                        return;
                      }
                      try {
                        await updateQueryData(
                          `/queries/${selectedQuery.id}`,
                          { status: 'RESOLVED', resolution_notes: employeeResponse.trim() },
                          'patch'
                        );
                        toast.success('Query resolved successfully.');
                        queryClient.invalidateQueries({ queryKey: ['hr-queries'] });
                        queryClient.invalidateQueries({ queryKey: ['hr-queries-summary'] });
                        setSelectedQuery(null);
                        setEmployeeResponse('');
                      } catch (err: any) {
                        toast.error(err.response?.data?.message || 'Failed to resolve query.');
                      }
                    }}
                    disabled={!employeeResponse.trim() || resolving}
                    loading={resolving}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    Submit & Resolve
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <HeadingComponent
          heading="Staff Queries & Issues"
          subHeading="Submit, track and resolve employee queries and issues"
        />
        <Button
          buttonType="add"
          variant="default"
          size="lg"
          onClick={() => navigate('/dashboard/queries/add')}
        >
          Submit New Query
        </Button>
      </div>

      <div className="rounded-2xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card
              key={index}
              heading={stat.title}
              amount={stat.value}
              currency={stat.subtitle}
              icons={<stat.icon className="h-5 w-5 text-white" />}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-8 overflow-x-auto border-b border-gray-200">
        {QUERY_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`relative pb-4 text-sm font-semibold whitespace-nowrap transition ${
              activeTab === tab ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonLoading />
      ) : (
        <ReusableTable
          heading="Queries Management"
          columns={columns}
          data={queries}
          filterKey="status"
          filterOptions={[
            { key: 'Open', label: 'Open', value: 'Open' },
            { key: 'In Progress', label: 'In Progress', value: 'In Progress' },
            { key: 'Resolved', label: 'Resolved', value: 'Resolved' },
          ]}
          searchKeys={['id', 'employee', 'category', 'assignedTo']}
          selectedFilter={statusFilter}
          onFilterChange={handleFilterChange}
        />
      )}

      <AlertDialog open={deleteModalOpen} onOpenChange={(open) => !open && cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Query</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {queryToDelete?.id ?? 'this query'}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Queries;
