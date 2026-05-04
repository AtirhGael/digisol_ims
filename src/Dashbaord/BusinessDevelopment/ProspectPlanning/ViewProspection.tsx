'use client';
import { Pencil, MapPin, Target, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from 'react-router-dom';
import useFetchHook from "../../../Hooks/UseFetchHook";
import { Loader } from "../../../components/other/Loader/Loader";

import type { ProspectionPlan } from "./prospectionMockData";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { Error } from "../../../components/other/Error/Error";

  const STATUS_STYLES: Record<ProspectionPlan["status"], string> = {
    DRAFT:     "text-gray-400",
    SUBMITTED: "text-blue-500",
    PENDING:   "text-amber-500",
    ACTIVE:    "text-emerald-500",
    COMPLETED: "text-primary",
    REJECTED:  "text-red-500",
    CANCELLED: "text-gray-500",
  };

  function StatusBadge({ status }: { status: ProspectionPlan["status"] }) {
    return (
      <span className={`text-xs font-semibold tracking-wide ${STATUS_STYLES[status]}`}>
        {status}
      </span>
    );
  }

  function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
      <div className={`bg-white rounded-xl border border-gray-100 p-6 ${className}`}>
        {children}
      </div>
    );
  }

const ViewProspection = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch specific prospection by ID
  const { data: fetchedProspection, isLoading, isError, error } = useFetchHook(
    `/business-development/prospections/${id}`,
    `prospection-detail-${id}`,
    {
      enabled: !!id,
      refetchOnWindowFocus: false
    }
  );

  // Find the specific prospection from the fetched data
  let detail: ProspectionPlan | undefined;
  
  if (fetchedProspection?.success && fetchedProspection.data) {
    // Map single prospection response to ProspectionPlan format
    const item = fetchedProspection.data;
    
    
    detail = {
      id: 1, // Display ID
      uuid: item.prospection_id,
      code: item.prospection_code || `PROSP-001`,
      title: item.title,
      description: item.description || "",
      createdBy: item.created_by_name || item.created_by || "Unknown",
      plannedStart: new Date(item.planned_start_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      plannedEnd: new Date(item.planned_end_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      contactsCollected: item.actual_contacts || 0,
      expectedContacts: item.expected_contacts || 0,
      contactBreakdown: item.contact_breakdown || { normal: 0, potential: 0, client: 0 },
      teamMembers: item.team_members?.map((member: any, index: number) => ({
        id: index + 1,
        name: member.name,
        department: member.department || "Unknown",
        initials: member.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || "??",
        color: `bg-blue-500` // Default color
      })) || [],
      budgetApproved: item.budget_approved || 
        (item.status === 'ACTIVE' || item.status === 'APPROVED' || item.status === 'PENDING' || item.status === 'COMPLETED' 
          ? item.budget_requested : 0), // Use budget_requested for approved statuses if budget_approved is 0
      budgetAllocated: Math.round((item.budget_requested || 0) / 1000).toString(),
      budgetSpent: item.expense_summary?.total_expenses 
        ? Math.round(item.expense_summary.total_expenses / 1000).toString() 
        : "0",
      city: item.location_city || "",
      region: item.location_region || "",
      venue: item.location_venue || "",
      targetAudience: item.target_audience || "",
      status: item.status === 'PENDING_APPROVAL' ? 'PENDING' : 
              item.status === 'APPROVED' ? 'ACTIVE' : 
              item.status
    };
  }

  if (isLoading) {
    return <SkeletonLoading />;
  }
  // error
  if (isError) {
    return <Error message={error?.message || "Failed to load prospection details. Please try again."} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600 mb-1">Error Loading Prospection</h3>
          <p className="text-sm text-gray-500 mb-4">Unable to load prospection details. Please try again later.</p>
          <button 
            onClick={() => navigate('/dashboard/prospectionplanning')}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
          >
            Back to Prospection Plans
          </button>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-1">Prospection Not Found</h3>
          <p className="text-sm text-gray-500 mb-4">The prospection you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/dashboard/prospectionplanning')}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
          >
            Back to Prospection Plans
          </button>
        </div>
      </div>
    );
  }
  
  const { contactBreakdown } = detail;
  const totalBreakdown = contactBreakdown.normal + contactBreakdown.potential + contactBreakdown.client;

  return (
    <div className="flex flex-col gap-5">
      {/* Back Button */}
      <button
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary w-fit mb-2"
        onClick={() => navigate('/dashboard/prospectionplanning')}
      >
        <ArrowLeft size={16} /> Back to Prospection Planning
      </button>

      {/* Header Card */}
      <SectionCard>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">
                {detail.code}: {detail.title}
              </span>
              <StatusBadge status={detail.status} />
            </div>
            <p className="text-sm text-gray-400">{detail.description}</p>
          </div>
          <button
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/80 transition-colors shrink-0"
            onClick={() => navigate(`/dashboard/prospectionplanning/edit/${detail.uuid}`)}
          >
            <Pencil size={13} />
            Edit
          </button>
        </div>
      </SectionCard>

      {/* Three-column info row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Timeline */}
        <SectionCard>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Timeline</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Created by</span>
              <span className="text-sm font-medium text-gray-700">{detail.createdBy}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Planned Start</span>
              <span className="text-sm font-medium text-gray-700">{detail.plannedStart}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Planned End</span>
              <span className="text-sm font-medium text-gray-700">{detail.plannedEnd}</span>
            </div>
          </div>
        </SectionCard>

        {/* Contacts Collected */}
        <SectionCard>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Contacts Collected</h3>
          <div className="flex flex-col items-center gap-1 mb-4">
            <span className="text-4xl font-bold text-gray-900">{detail.contactsCollected}</span>
            <span className="text-xs text-gray-400">of {detail.expectedContacts} expected</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.min(100, (detail.contactsCollected / detail.expectedContacts) * 100)}%` }}
            />
          </div>
          {/* Breakdown */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                <span className="text-sm text-gray-600">Normal</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{contactBreakdown.normal}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span className="text-sm text-gray-600">Potential</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{contactBreakdown.potential}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-sm text-gray-600">Client</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{contactBreakdown.client}</span>
            </div>
          </div>
        </SectionCard>

        {/* Team Members */}
        <SectionCard>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Team Member</h3>
          <div className="flex flex-col gap-3">
            {detail.teamMembers.map((member: any) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center shrink-0`}>
                  <span className="text-white text-xs font-bold">{member.initials}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{member.name}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Budget Approved Banner */}
      <div className="flex items-center justify-between bg-green-50 border-l-4 border-emerald-400 rounded-xl px-6 py-4">
        <span className="text-sm font-medium text-gray-700">Budget  Approved</span>
        <span className="text-base font-bold text-emerald-500">
          {detail.budgetApproved.toLocaleString()} XAF
        </span>
      </div>

      {/* Rejection Reason (only show if status is REJECTED and reason exists) */}
      {detail.status === 'REJECTED' && fetchedProspection?.data?.rejection_reason && (
        <div className="bg-red-50 border-l-4 border-red-400 rounded-xl px-6 py-4">
          <div className="flex items-start gap-2">
            <div className="shrink-0">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-800 mb-2">Rejection Reason</h3>
              <p className="text-sm text-red-700">{fetchedProspection.data.rejection_reason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Location Details */}
      <SectionCard>
        <div className="flex items-center gap-2 mb-5">
          <MapPin size={16} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-800">Location Details</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p className="text-xs text-gray-400 mb-1">City</p>
            <p className="text-sm font-medium text-gray-800">{detail.city}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Region</p>
            <p className="text-sm font-medium text-gray-800">{detail.region}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Venue</p>
            <p className="text-sm font-medium text-gray-800">{detail.venue}</p>
          </div>
        </div>
      </SectionCard>

      {/* Target & Objectives */}
      <SectionCard>
        <div className="flex items-center gap-2 mb-5">
          <Target size={16} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-800">Target &amp; Objectives</h3>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Target Audience</p>
            <p className="text-sm font-medium text-gray-800">{detail.targetAudience}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Expected Contacts</p>
            <p className="text-sm font-medium text-gray-800">{detail.expectedContacts} contacts</p>
          </div>
        </div>
      </SectionCard>

      {/* Expenses Summary */}
      {fetchedProspection?.data?.expenses && fetchedProspection.data.expenses.length > 0 && (
        <SectionCard>
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            <h3 className="text-sm font-semibold text-gray-800">Expenses ({fetchedProspection.data.expenses.length})</h3>
          </div>
          


          {/* Recent Expenses */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-gray-600 mb-3">Recent Expenses</h4>
            {fetchedProspection.data.expenses.slice(0, 5).map((expense: any, index: number) => (
              <div key={expense.expense_id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {expense.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(expense.expense_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{expense.description}</p>
                  <p className="text-xs text-gray-500">Recorded by {expense.recorded_by?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">
                    {expense.amount >= 1000 
                      ? `${Math.round(expense.amount / 1000).toLocaleString()}k ${expense.currency}`
                      : `${expense.amount.toLocaleString()} ${expense.currency}`
                    }
                  </p>
                </div>
              </div>
            ))}
            {fetchedProspection.data.expenses.length > 5 && (
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  +{fetchedProspection.data.expenses.length - 5} more expenses
                </p>
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
};

  export default ViewProspection;

