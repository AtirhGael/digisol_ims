// Contact Leads: feature UI logic and helpers
import { useEffect, useState } from "react";
import { Button } from "../../../../components/ui/button";
import ReusableTable from "../../../../components/other/ReusableTable/ReusableTable";
import { createContactsColumns } from "../../../../components/Columns/ContactLeadsColumns";
import Convertedclienttab from "../tabs/Convertedclienttab";
import Leadspipelinetab from "../tabs/Leadspipelinetab";
import type { Contact, Lead, Tab } from "../types";
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

export function ContactListView({ contacts, leads, onAddContact, onRecordInteraction, onViewContact, onEditContact, onDeleteContact, onViewLead, onEditLead, onDeleteLead, initialTab }: {
  contacts: Contact[]; leads: Lead[];
  onAddContact: () => void;
  onRecordInteraction: () => void;
  onViewContact: (c: Contact) => void;
  onEditContact: (c: Contact) => void;
  onDeleteContact: (id: string) => Promise<void>;
  onViewLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => Promise<void>;
  initialTab?: Tab;
}) {
  // Tracks which sub-tab is active within Contacts & Leads.
  const [activeTab, setActiveTab] = useState<Tab>("contacts");

  // Delete modal state for contacts
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
  const [deleteContactName, setDeleteContactName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete modal state for leads
  const [deleteLeadTarget, setDeleteLeadTarget] = useState<Lead | null>(null);
  const [isDeletingLead, setIsDeletingLead] = useState(false);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const convertedCount = contacts.filter(
    (c) =>
      c.source === "CLIENT" ||
      c.source === "LEAD-CONVERSION" ||
      c.contactSource === "Lead Conversion"
  ).length;

  // Tab definitions with counts.
  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "contacts",  label: "All Contacts",         count: contacts.length  },
    { key: "pipeline",  label: "Leads Pipeline",       count: leads.length     },
    { key: "converted", label: "Converted to clients", count: convertedCount  },
  ];

  // Handler to open delete modal for contacts
  const handleRequestDeleteContact = (id: string) => {
    const contact = contacts.find((c) => c.id === id);
    setDeleteContactName(contact?.name || "this contact");
    setDeleteContactId(id);
  };

  // Handler to confirm contact deletion
  const handleConfirmDeleteContact = async () => {
    if (!deleteContactId) return;
    setIsDeleting(true);
    try {
      await onDeleteContact(deleteContactId);
    } finally {
      setIsDeleting(false);
      setDeleteContactId(null);
      setDeleteContactName("");
    }
  };

  // Handler to open delete modal for leads
  const handleRequestDeleteLead = (lead: Lead) => {
    setDeleteLeadTarget(lead);
  };

  // Handler to confirm lead deletion
  const handleConfirmDeleteLead = async () => {
    if (!deleteLeadTarget) return;
    setIsDeletingLead(true);
    try {
      await onDeleteLead(deleteLeadTarget);
    } finally {
      setIsDeletingLead(false);
      setDeleteLeadTarget(null);
    }
  };

  return (
    <div className="min-h-full font-sans">
      <AlertDialog
        open={deleteContactId !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeleteContactId(null);
            setDeleteContactName("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteContactName}"? This action cannot be undone and all associated data will be permanently removed.
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
                  handleConfirmDeleteContact();
                }}
                disabled={isDeleting}
                loading={isDeleting}
              >
                Delete Contact
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteLeadTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isDeletingLead) {
            setDeleteLeadTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the lead "{deleteLeadTarget?.contactName}"? This action cannot be undone and all associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={isDeletingLead}>Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={(e) => {
                  e.preventDefault();
                  handleConfirmDeleteLead();
                }}
                disabled={isDeletingLead}
                loading={isDeletingLead}
              >
                Delete Lead
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 m-0">Contacts & Leads Management</h1>
          <p className="text-sm text-gray-500 mt-1 mb-0">Manage prospection contacts and track leads through the sales pipeline</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="default" buttonType="add" onClick={onAddContact} className="w-full sm:w-auto">Add Contacts</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-0 border-b-2 border-gray-200 mb-6 bg-gray-50 rounded-t-md overflow-x-auto no-scrollbar w-full min-w-full">
        {tabs.map((t) => {
          const active = activeTab === t.key;
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`relative flex items-center gap-2 px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-medium cursor-pointer border-none bg-transparent transition-colors whitespace-nowrap
                ${active
                  ? "text-primary font-semibold after:absolute after:left-0 after:-bottom-[2px] after:h-1 after:w-full after:bg-primary"
                  : "text-gray-500 hover:text-gray-700"}`}>
              {t.label}
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${active ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600"}`}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* Contacts list */}
      {activeTab === "contacts" && (
        <ReusableTable
          heading="Contact List"
          data={contacts}
          columns={createContactsColumns({
            onViewContact,
            onEditContact,
            onDeleteContact: handleRequestDeleteContact,
          })}
          searchKeys={["name", "company", "phone", "email", "source", "date"]}
          filterKey="interestLevel"
          filterOptions={[
            { key: "interestLevel", value: "High", label: "High" },
            { key: "interestLevel", value: "Medium", label: "Medium" },
            { key: "interestLevel", value: "Low", label: "Low" },
            { key: "interestLevel", value: "Lead", label: "Lead" },
          ]}
        />
      )}

      {/* Leads pipeline */}
      {activeTab === "pipeline" && (
        <Leadspipelinetab
          leads={leads}
          onViewLead={onViewLead}
          onEditLead={onEditLead}
          onDeleteLead={handleRequestDeleteLead}
        />
      )}

      {/* Converted contacts */}
      {activeTab === "converted" && (
        <Convertedclienttab
          contacts={contacts}
          onViewContact={onViewContact}
          onEditContact={onEditContact}
          onDeleteContact={handleRequestDeleteContact}
        />
      )}
    </div>
  );
}
