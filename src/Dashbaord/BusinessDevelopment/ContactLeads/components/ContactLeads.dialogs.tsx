// Contact Leads: feature UI logic and helpers
import { useEffect, useState } from "react";
import { LuTriangleAlert, LuX, LuArrowRight, LuLoader } from "react-icons/lu";
import { Button } from "../../../../components/ui/button";
import { Field, SelectField, inputCls } from "./ContactLeads.ui";
import { contactLeadsApi, type ConvertContactToLeadPayload } from "../ContactLeads.api";
import { getAllContracts, type Contract } from "../../ProposalContracts/Contracts/api";
import type { Contact, Lead, LeadStatus } from "../types";

// Shared modals for Contact Leads flows.

export function ConfirmModal({ title, message, confirmLabel = "Confirm", onConfirm, onCancel, isLoading = false }: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  // Confirm dialog with cancel + confirm actions and async loading support.
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!isLoading ? onCancel : undefined} />
      <div className="relative bg-white rounded-2xl  w-full max-w-md mx-4 p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <LuTriangleAlert className="text-red-600 text-lg" />
            </div>
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
          </div>
          {!isLoading && (
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 bg-none border-none cursor-pointer"><LuX className="text-lg" /></button>
          )}
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <button onClick={onConfirm} disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors border-none flex items-center gap-2 min-w-30 justify-center ${isLoading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 cursor-pointer'}`}>
            {isLoading ? (
              <>
                <LuLoader className="animate-spin text-sm" />
                Deleting…
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConvertToLeadModal({
  contact,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: {
  contact: Contact;
  /** Called with backend-ready payload when the user confirms. */
  onConfirm: (payload: ConvertContactToLeadPayload) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  // Form state
  const [assignedTo, setAssignedTo] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [initialStatus, setInitialStatus] = useState<"NEW" | "CONTACTED" | "QUALIFIED">("NEW");

  // Employee fetch state
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [employeeError, setEmployeeError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingEmployees(true);
    setEmployeeError(false);
    contactLeadsApi.fetchBDEmployees()
      .then((data) => {
        if (!cancelled) {
          setEmployees(data);
          setIsLoadingEmployees(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEmployeeError(true);
          setIsLoadingEmployees(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const handleConfirm = () => {
    // Build a backend-compatible payload.
    const payload: ConvertContactToLeadPayload = {
      contact_id: contact.id,
      assigned_to: assignedTo,
      initial_status: initialStatus,
    };

    const numericValue = parseFloat(estimatedValue.replace(/[^0-9.]/g, ""));
    if (!isNaN(numericValue) && numericValue > 0) {
      payload.estimated_value = numericValue;
      payload.currency = "XAF";
    }

    if (nextFollowUpDate) {
      payload.next_follow_up_date = new Date(nextFollowUpDate).toISOString();
    }

    onConfirm(payload);
  };

  const isFormReady = !!assignedTo && !isLoadingEmployees;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!isSubmitting ? onCancel : undefined} />
      <div className="relative bg-white rounded-2xl  w-full max-w-lg mx-4 p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <LuArrowRight className="text-blue-600 text-lg" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Convert to Lead</h3>
              <p className="text-xs text-gray-400 mt-0.5">Converting <span className="font-semibold text-gray-600">{contact.name}</span></p>
            </div>
          </div>
          {!isSubmitting && (
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 bg-none border-none cursor-pointer">
              <LuX className="text-lg" />
            </button>
          )}
        </div>

        {/* Assigned To */}
        <div className="flex flex-col gap-4">
          <Field label="Assigned To" required>
            <div className="relative">
              <SelectField
                value={assignedTo}
                onChange={(v) => setAssignedTo(v as string)}
                disabled={isLoadingEmployees || isSubmitting}
              >
                <option value="">
                  {isLoadingEmployees ? "Loading employees…" : "Select team member"}
                </option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </SelectField>
              {isLoadingEmployees && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                  <LuLoader className="animate-spin text-gray-400 text-sm" />
                </div>
              )}
            </div>
            {employeeError && (
              <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <LuTriangleAlert className="text-sm" /> Failed to load employees. Please close and try again.
              </p>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Estimated Value (XAF)">
              <input
                className={inputCls}
                placeholder="e.g. 500000"
                type="number"
                min="0"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                disabled={isSubmitting}
              />
            </Field>
            <Field label="Next Follow-up Date">
              <input
                className={inputCls}
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                disabled={isSubmitting}
              />
            </Field>
          </div>

          <Field label="Initial Status">
            <SelectField
              value={initialStatus}
              onChange={(v) => setInitialStatus(v as "NEW" | "CONTACTED" | "QUALIFIED")}
              disabled={isSubmitting}
            >
              <option value="NEW">NEW</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="QUALIFIED">QUALIFIED</option>
            </SelectField>
          </Field>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="default"
            className="gap-2 min-w-32.5"
            onClick={handleConfirm}
            disabled={!isFormReady || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LuLoader className="animate-spin text-sm" /> Converting…
              </>
            ) : (
              <>
                <LuArrowRight className="text-sm" /> Convert Now
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ConvertToClientModal({
  lead,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: {
  lead: Lead;
  onConfirm: (payload: { contractId: string; paymentTerms: string; estimatedValue: number; currency: string }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  const [selectedContractId, setSelectedContractId] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");

  const [contractsLoading, setContractsLoading] = useState(true);
  const [contractError, setContractError] = useState(false);
  const [validContracts, setValidContracts] = useState<Contract[]>([]);

  useEffect(() => {
    let cancelled = false;
    setContractsLoading(true);
    setContractError(false);
    getAllContracts()
      .then((res) => {
        if (!cancelled && res?.data) {
          const filtered = res.data.filter(
            (c) =>
              (c.status === "ACCEPTED" || c.status === "ACTIVE") &&
              c.proposals?.lead_id === lead.id
          );
          setValidContracts(filtered);
          setContractsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setContractError(true);
          setContractsLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [lead.id]);

  const handleConfirm = () => {
    const selectedContract = validContracts.find((c) => c.contract_id === selectedContractId);
    if (!selectedContract) return;

    onConfirm({
      contractId: selectedContractId,
      paymentTerms,
      estimatedValue: Number(selectedContract.contract_value || lead.estimatedValue || 0),
      currency: selectedContract.currency || "XAF",
    });
  };

  const isFormReady = !!selectedContractId && !!paymentTerms.trim() && !contractsLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!isSubmitting ? onCancel : undefined} />
      <div className="relative bg-white rounded-2xl  w-full max-w-lg mx-4 p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <LuArrowRight className="text-blue-600 text-lg" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Convert to Client</h3>
              <p className="text-xs text-gray-400 mt-0.5">Converting <span className="font-semibold text-gray-600">{lead.company || lead.contactName}</span></p>
            </div>
          </div>
          {!isSubmitting && (
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 bg-none border-none cursor-pointer">
              <LuX className="text-lg" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Field label="Contract (Accepted/Active)" required>
            <div className="relative">
              <SelectField
                value={selectedContractId}
                onChange={(v) => setSelectedContractId(v as string)}
                disabled={contractsLoading || isSubmitting}
              >
                <option value="">
                  {contractsLoading ? "Loading contracts…" : "Select a contract"}
                </option>
                {validContracts.map((contract) => (
                  <option key={contract.contract_id} value={contract.contract_id}>
                    {contract.contract_number ? `${contract.contract_number} — ` : ""}{contract.contract_title}
                  </option>
                ))}
              </SelectField>
              {contractsLoading && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                  <LuLoader className="animate-spin text-gray-400 text-sm" />
                </div>
              )}
            </div>
            {contractError && (
              <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <LuTriangleAlert className="text-sm" /> Failed to load contracts. Please close and try again.
              </p>
            )}
            {!contractsLoading && !contractError && validContracts.length === 0 && (
              <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <LuTriangleAlert className="text-sm" /> No accepted or active contracts found for this lead.
              </p>
            )}
          </Field>

          <Field label="Payment Terms" required>
            <textarea
              className={`${inputCls} min-h-25 resize-y py-2`}
              placeholder="e.g. 50% upfront, 50% on delivery"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              disabled={isSubmitting}
            />
          </Field>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="default"
            className="gap-2 min-w-32.5"
            onClick={handleConfirm}
            disabled={!isFormReady || isSubmitting || validContracts.length === 0}
          >
            {isSubmitting ? (
              <>
                <LuLoader className="animate-spin text-sm" /> Converting…
              </>
            ) : (
              <>
                <LuArrowRight className="text-sm" /> Convert Now
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

