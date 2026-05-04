import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import useFetchHook from "../../../Hooks/UseFetchHook";
import {
  AddContactView,
  ContactDetailView,
  ContactListView,
} from "./components/ContactsLeads.components";
import { type Contact, type Lead, type View, type Tab } from "./types";
import {
  type ApiResponse,
  contactLeadsApi,
  type ContactsLeadsListResponse,
  mapContactsLeadsListToFrontend,
  type ConvertContactToLeadPayload,
} from "./ContactLeads.api";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { Error } from "../../../components/other/Error/Error";
import { useContactLeadsStore } from "./ContactLeads.store";
import { useContacts } from "./hooks/useContacts";
import { useUserStore } from "../../../Store/UserStore";

const mergeById = <T extends { id: string }>(
  primary: T[],
  secondary: T[],
): T[] => {
  const map = new Map<string, T>();
  primary.forEach((item) => map.set(item.id, item));
  secondary.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
};

const dedupeContacts = (items: Contact[]): Contact[] => {
  const seenIds = new Set<string>();
  const seenSig = new Set<string>();
  return items.filter((contact) => {
    const sig =
      `${contact.name}|${contact.company}|${contact.contactSource}|${contact.source}`.toLowerCase();
    if (seenIds.has(contact.id) || seenSig.has(sig)) return false;
    seenIds.add(contact.id);
    seenSig.add(sig);
    return true;
  });
};

export default function ContactsLeads() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeId } = useParams<{ id?: string }>();

  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [leadContext, setLeadContext] = useState<Lead | null>(null);
  const [initialTab, setInitialTab] = useState<Tab | undefined>(undefined);
  const [startInEdit, setStartInEdit] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const loadStartRef = useRef<number | null>(null);

  // Auth/Permissions
  const roles = useUserStore((state) => state.roles);
  const permissions = useUserStore((state) => state.permissions);
  const isSuperAdmin = roles.includes("SUPER_ADMIN");

  // Zustand store & useContacts hook
  const store = useContactLeadsStore();
  const {
    contacts,
    leads,
    isSubmitting,
    createContact,
    updateContact,
    deleteContact,
    getContact,
    uploadBusinessCard,
  } = useContacts();

  const {
    data: listResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useFetchHook<ApiResponse<ContactsLeadsListResponse>>(
    "contacts-leads?type=all&page=1&limit=200",
    "contacts-leads-list",
  );

  useEffect(() => {
    if (isLoading) {
      if (loadStartRef.current === null) {
        loadStartRef.current = Date.now();
      }
      setShowLoader(true);
      return;
    }

    if (loadStartRef.current === null) {
      setShowLoader(false);
      return;
    }

    const elapsed = Date.now() - loadStartRef.current;
    const remaining = Math.max(0, 2000 - elapsed);
    const timer = window.setTimeout(() => {
      setShowLoader(false);
      loadStartRef.current = null;
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (!listResponse) return;
    if (store.initialized) return;
    const mapped = mapContactsLeadsListToFrontend(listResponse);
    const mergedContacts = mergeById(mapped.contacts, []);
    const nextContacts = dedupeContacts(mergedContacts);
    store.setContacts(nextContacts);
    store.setInitialized(true);

    // Fetch rich lead data from the dedicated /leads endpoint
    contactLeadsApi
      .getLeads()
      .then((richLeads) => {
        store.setLeads(richLeads);
      })
      .catch(() => {
        // Fallback: keep the basic leads from the combined endpoint
        const basicLeads = mergeById(mapped.leads, []);
        store.setLeads(basicLeads);
      });
  }, [listResponse]);

  useEffect(() => {
    if (!isError) return;
    const message = error?.message || "Failed to load contacts and leads";
    toast.error(message);
  }, [isError, error]);

  const mapLeadToContact = (source: Lead): Contact => {
    const now = new Date();
    const nowDate = now.toLocaleDateString("en-GB");
    const nowDateTime = now.toLocaleString();
    const [firstName, ...rest] = (source.contactName || "").trim().split(" ");
    const lastName = rest.join(" ").trim();
    const existing = contacts.find((contact) => {
      if (contact.id === source.id) return true;
      if (contact.name && contact.company) {
        const sigA = `${contact.name}|${contact.company}`.toLowerCase();
        const sigB = `${source.contactName}|${source.company}`.toLowerCase();
        return sigA === sigB;
      }
      return false;
    });
    return {
      ...(existing ?? {}),
      id: source.id,
      name: source.contactName || existing?.name || "",
      firstName:
        firstName || existing?.firstName || source.contactName || "Lead",
      lastName: lastName || existing?.lastName || "",
      company: source.company || existing?.company || "",
      phone: existing?.phone || "",
      secondaryPhone: existing?.secondaryPhone || "",
      email: existing?.email || "",
      interestLevel: "Lead",
      source: existing?.source || "Lead Pipeline",
      date: nowDate,
      position: existing?.position || "",
      industrySector: source.industry || existing?.industrySector || "",
      address: existing?.address || "",
      location: existing?.location || "",
      collectedFrom: "Lead Pipeline",
      collectedDate: nowDateTime,
      contactSource: existing?.contactSource || "Lead Conversion",
      firstContactDate: nowDateTime,
      createdBy: "System",
      createdAt: nowDateTime,
      lastUpdated: nowDateTime,
      notes:
        existing?.notes || `Converted from lead. Status: ${source.status}.`,
      businessCardImage: existing?.businessCardImage ?? null,
      leadData: source,
    };
  };

  useEffect(() => {
    if (!routeId) {
      setSelected(null);
      setStartInEdit(false);
      setDetailLoading(false);
      setView("list");
      const requestedTab = (location.state as { tab?: Tab } | undefined)?.tab;
      setInitialTab(requestedTab);
      return;
    }

    let isMounted = true;

    const loadContact = async () => {
      const leadState = location.state as
        | { fromLead?: boolean; lead?: Lead }
        | undefined;
      if (leadState?.fromLead && leadState.lead) {
        const source = leadState.lead;
        const mapped = mapLeadToContact(source);
        if (!isMounted) return;
        setSelected(mapped);
        setLeadContext(source);
        setStartInEdit(true);
        setDetailLoading(false);
        setView("detail");
        return;
      }

      // Show detail view with skeleton immediately
      setView("detail");
      setDetailLoading(true);

      // Always fetch full details from the API for the detail view
      const contact = await getContact(routeId);
      if (!isMounted) return;
      setDetailLoading(false);
      if (contact) {
        setSelected(contact);
        setLeadContext(null);
        setStartInEdit(location.pathname.endsWith("/edit"));
      } else {
        // Fallback: use list data if API call fails
        const fromList = contacts.find((item) => item.id === routeId);
        if (fromList) {
          setSelected(fromList);
          setLeadContext(null);
          setStartInEdit(location.pathname.endsWith("/edit"));
        } else {
          navigate("/dashboard/contactsleads", { replace: true });
        }
      }
    };

    loadContact();

    return () => {
      isMounted = false;
    };
  }, [routeId, contacts, location.pathname, navigate]);

  useEffect(() => {
    const state = location.state as
      | { convertLead?: Lead; tab?: Tab }
      | undefined;
    if (!state?.convertLead) return;
    const converted = mapLeadToContact(state.convertLead);
    store.addContact(converted);
    store.removeLead(state.convertLead.id);
  }, [location.state]);

  // CRUD handlers using the useContacts hook
  const handleSaveContact = async (contact: Contact) => {
    const success = await createContact(contact);
    if (success) {
      navigate("/dashboard/contactsleads");
    }
  };

  const handleUpdateContact = async (updated: Contact): Promise<boolean> => {
    if (leadContext) {
      store.setSubmitting(true);
      try {
        const leadPayload = {
          contact_person: updated.name,
          company_name: updated.company,
          phone: updated.phone || undefined,
          email: updated.email || undefined,
          address: updated.address || undefined,
          city: updated.location?.split(",")[0]?.trim() || undefined,
          country: updated.location?.split(",")[1]?.trim() || undefined,
          industry_sector: updated.industrySector || undefined,
          position: updated.position || undefined,
          status: updated.leadData?.status || undefined,
          estimated_value: updated.leadData?.estimatedValue
            ? Number(updated.leadData.estimatedValue)
            : null,
        };
        const savedLead = await contactLeadsApi.updateLead(
          leadContext.id,
          leadPayload,
        );
        toast.success("Lead updated successfully");

        setSelected(updated);
        setLeadContext(savedLead);

        store.updateLead(savedLead.id, {
          contactName: savedLead.contactName,
          company: savedLead.company,
          industry: savedLead.industry,
          status: savedLead.status,
          estimatedValue: savedLead.estimatedValue
            ? String(savedLead.estimatedValue)
            : "",
        });

        return true;
      } catch (err: any) {
        toast.error(err?.message || "Failed to update lead");
        return false;
      } finally {
        store.setSubmitting(false);
      }
    } else {
      const success = await updateContact(updated);
      if (success) {
        setSelected(updated);
      }
      return success;
    }
  };

  const handleDeleteContact = async (id: string) => {
    const success = await deleteContact(id);
    if (success) {
      setSelected((prev) => (prev?.id === id ? null : prev));
      if (routeId === id) {
        navigate("/dashboard/contactsleads", { replace: true });
      }
    }
  };

  /**
   * Converts a contact to a lead via the backend API.
   * On success: updates the contact's interest level in the store, refreshes
   * the list from the server, and navigates to the pipeline tab.
   * On failure: shows an error toast and returns false so the modal stays open.
   */
  const handleConvertToLead = async (
    payload: ConvertContactToLeadPayload,
  ): Promise<boolean> => {
    const sourceContact = contacts.find((c) => c.id === payload.contact_id);
    if (
      String(sourceContact?.leadData?.status || "").toUpperCase() === "LOST"
    ) {
      toast.error("Lost records cannot be converted to lead.");
      return false;
    }

    try {
      await contactLeadsApi.convertContactToLead(payload);
      toast.success("Contact successfully converted to Lead!");

      // Refresh the full list from the server so the new lead is visible.
      store.setInitialized(false);
      await refetch();

      setView("list");
      navigate("/dashboard/contactsleads", { state: { tab: "pipeline" } });
      return true;
    } catch (err: any) {
      toast.error(
        err?.message || "Failed to convert contact to lead. Please try again.",
      );
      return false;
    }
  };

  const handleViewLead = (lead: Lead) => {
    navigate(`/dashboard/contactsleads/view-leads/${lead.id}`, {
      state: { lead },
    });
  };

  const handleEditLead = (lead: Lead) => {
    const canUpdate =
      isSuperAdmin ||
      permissions.some(
        (p) =>
          p.module === "business_development" &&
          p.resource_type === "leads" &&
          p.action === "UPDATE",
      );
    if (!canUpdate) {
      navigate("/dashboard/unauthorized");
      return;
    }
    navigate(`/dashboard/contactsleads/${lead.id}/edit`, {
      state: { fromLead: true, lead },
    });
  };

  const handleDeleteLead = async (lead: Lead) => {
    try {
      await contactLeadsApi.deleteLead(lead.id);
      store.removeLead(lead.id);
      toast.success("Lead deleted successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete lead. Please try again.");
    }
  };

  if (showLoader) {
    return <SkeletonLoading />;
  }

  if (isError && contacts.length === 0 && leads.length === 0) {
    return (
      <Error
        message={
          error?.message ||
          "Failed to load contacts and leads. Please try again."
        }
      />
    );
  }

  if (view === "add") {
    return (
      <AddContactView
        onBack={() => setView("list")}
        onSave={handleSaveContact}
        isSubmitting={isSubmitting}
      />
    );
  }

  if (view === "detail" && detailLoading) {
    return <SkeletonLoading />;
  }

  if (view === "detail" && selected) {
    return (
      <ContactDetailView
        contact={selected}
        startInEdit={startInEdit}
        isSubmitting={isSubmitting}
        onBack={() => {
          setStartInEdit(false);
          if (leadContext) {
            navigate("/dashboard/contactsleads", {
              state: { tab: "pipeline" },
            });
          } else {
            navigate("/dashboard/contactsleads");
          }
        }}
        onUpdate={handleUpdateContact}
        onDelete={handleDeleteContact}
        onConvert={handleConvertToLead}
      />
    );
  }

  return (
    <ContactListView
      contacts={contacts}
      leads={leads}
      onAddContact={() => {
        const canCreate =
          isSuperAdmin ||
          permissions.some(
            (p) =>
              p.module === "business_development" &&
              p.resource_type === "leads" &&
              p.action === "CREATE",
          );
        if (!canCreate) {
          navigate("/dashboard/unauthorized");
          return;
        }
        setView("add");
      }}
      onRecordInteraction={() => navigate("/dashboard/recordnewinteraction")}
      initialTab={initialTab}
      onViewContact={(contact) => {
        setStartInEdit(false);
        navigate(`/dashboard/contactsleads/${contact.id}/view`);
      }}
      onEditContact={(contact) => {
        const canUpdate =
          isSuperAdmin ||
          permissions.some(
            (p) =>
              p.module === "business_development" &&
              p.resource_type === "leads" &&
              p.action === "UPDATE",
          );
        if (!canUpdate) {
          navigate("/dashboard/unauthorized");
          return;
        }
        navigate(`/dashboard/contactsleads/${contact.id}/edit`);
      }}
      onDeleteContact={handleDeleteContact}
      onViewLead={handleViewLead}
      onEditLead={handleEditLead}
      onDeleteLead={handleDeleteLead}
    />
  );
}
