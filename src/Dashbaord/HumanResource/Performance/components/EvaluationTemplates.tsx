import React, { useState } from "react";
import { Calendar, CheckCircle, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { activateEvaluationPeriod, createEvaluationPeriod, deactivateEvaluationPeriod, deleteEvaluationPeriod } from "../../hrApi";
import type { EvaluationTemplate } from "../data";

interface EvaluationTemplatesProps {
  data: EvaluationTemplate[];
  onActivated?: () => void;
  onCreated?: () => void;
  onDeactivated?: () => void;
  onDeleted?: () => void;
}

function CreatePeriodModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 bg-white";

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("Period name is required."); return; }
    if (!startDate)    { toast.error("Start date is required."); return; }
    if (!endDate)      { toast.error("End date is required."); return; }
    if (endDate <= startDate) { toast.error("End date must be after start date."); return; }

    setSaving(true);
    try {
      await createEvaluationPeriod({ period_name: name.trim(), start_date: startDate, end_date: endDate });
      toast.success("Evaluation period created.");
      onCreated();
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to create period.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">New Evaluation Period</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period Name</label>
            <input className={inputCls} placeholder="e.g. Q3 2026 Performance Review" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" className={inputCls} value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" className={inputCls} value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving} className="gap-2 bg-primary text-white hover:bg-primary/90">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {saving ? "Creating..." : "Create Period"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export const EvaluationTemplates: React.FC<EvaluationTemplatesProps> = ({
  data,
  onActivated,
  onCreated,
  onDeactivated,
  onDeleted,
}) => {
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const handleActivate = async (periodId: string) => {
    setActivatingId(periodId);
    try {
      await activateEvaluationPeriod(periodId);
      toast.success("Evaluation period activated.");
      onActivated?.();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to activate period.");
    } finally {
      setActivatingId(null);
    }
  };

  const handleDeactivate = async (periodId: string) => {
    setDeactivatingId(periodId);
    try {
      await deactivateEvaluationPeriod(periodId);
      toast.success("Evaluation period deactivated.");
      onDeactivated?.();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to deactivate period.");
    } finally {
      setDeactivatingId(null);
    }
  };

  const handleDelete = async (periodId: string) => {
    if (!window.confirm("Delete this evaluation period? This action cannot be undone.")) return;
    setDeletingId(periodId);
    try {
      await deleteEvaluationPeriod(periodId);
      toast.success("Evaluation period deleted.");
      onDeleted?.();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to delete period.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {showCreate && (
        <CreatePeriodModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { onCreated?.(); }}
        />
      )}

      <div className="space-y-6">
        {data.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            No evaluation periods yet. Create one below.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                {item.isActive && (
                  <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-50 rounded-full border border-green-200">
                    <CheckCircle size={11} /> Active
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
              <div className="mt-4 text-xs text-gray-500 space-y-2">
                <div className="flex items-center justify-between">
                  <span>Categories:</span>
                  <span className="text-gray-700">{item.categories}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Modified:</span>
                  <span className="text-gray-700">{item.lastModified}</span>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-3">
                {item.isActive ? (
                  <>
                    <Button className="flex-1" disabled>
                      <CheckCircle size={14} className="mr-1.5" /> Currently Active
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-amber-700 border-amber-300 hover:bg-amber-50"
                      disabled={deactivatingId === item.id}
                      onClick={() => handleDeactivate(item.id)}
                    >
                      {deactivatingId === item.id ? (
                        <><Loader2 size={14} className="animate-spin mr-1.5" /> Deactivating...</>
                      ) : (
                        "Deactivate"
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full bg-primary text-white hover:bg-primary/90"
                    disabled={activatingId === item.id}
                    onClick={() => handleActivate(item.id)}
                  >
                    {activatingId === item.id ? (
                      <><Loader2 size={14} className="animate-spin mr-1.5" /> Activating...</>
                    ) : (
                      "Set as Active"
                    )}
                  </Button>
                )}
                <button
                  type="button"
                  className="w-12 h-10 rounded-md border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center"
                  aria-label="Delete period"
                  disabled={deletingId === item.id}
                  onClick={() => handleDelete(item.id)}
                >
                  {deletingId === item.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="w-full border border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5"
        >
          <Plus size={15} /> Create new evaluation period
        </button>
      </div>
    </>
  );
};
