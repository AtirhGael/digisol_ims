import { create } from "zustand";
import type { Contact, Lead } from "./types";

interface ContactLeadsState {
  contacts: Contact[];
  leads: Lead[];
  initialized: boolean;
  isLoading: boolean;
  isSubmitting: boolean;

  // Actions
  setContacts: (contacts: Contact[]) => void;
  setLeads: (leads: Lead[]) => void;
  addContact: (contact: Contact) => void;
  updateContact: (updated: Contact) => void;
  removeContact: (id: string) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  removeLead: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;
}

export const useContactLeadsStore = create<ContactLeadsState>((set) => ({
  contacts: [],
  leads: [],
  initialized: false,
  isLoading: false,
  isSubmitting: false,

  setContacts: (contacts) => set({ contacts }),
  setLeads: (leads) => set({ leads }),

  addContact: (contact) =>
    set((state) => ({ contacts: [contact, ...state.contacts] })),

  updateContact: (updated) =>
    set((state) => ({
      contacts: state.contacts.map((c) => (c.id === updated.id ? updated : c)),
    })),

  removeContact: (id) =>
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== id),
    })),

  addLead: (lead) =>
    set((state) => ({ leads: [...state.leads, lead] })),

  updateLead: (id, updates) =>
    set((state) => ({
      leads: state.leads.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),

  removeLead: (id) =>
    set((state) => ({
      leads: state.leads.filter((l) => l.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setInitialized: (initialized) => set({ initialized }),

  reset: () =>
    set({
      contacts: [],
      leads: [],
      initialized: false,
      isLoading: false,
      isSubmitting: false,
    }),
}));
