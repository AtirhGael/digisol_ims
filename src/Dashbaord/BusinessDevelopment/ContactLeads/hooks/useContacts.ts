import { toast } from "sonner";
import { contactLeadsApi } from "../ContactLeads.api";
import { useContactLeadsStore } from "../ContactLeads.store";
import type { Contact } from "../types";

/**
 * Custom hook that encapsulates all Contact CRUD operations
 * with loading states and toast notifications.
 */
export function useContacts() {
  const store = useContactLeadsStore();

  const createContact = async (contact: Contact): Promise<boolean> => {
    store.setSubmitting(true);
    try {
      let created = await contactLeadsApi.createContact(contact);

      // Upload business card if provided
      if (contact.businessCardImage) {
        try {
          const upload = await contactLeadsApi.uploadContactBusinessCard(
            created.id,
            contact.businessCardImage
          );
          created = {
            ...created,
            businessCardImage: upload.business_card_url || created.businessCardImage,
          };
        } catch (uploadError: any) {
          toast.error(uploadError?.message || "Failed to upload business card image");
        }
      }

      store.addContact(created);
      toast.success("Contact created successfully");
      return true;
    } catch (err: any) {
      toast.error(err?.message || "Failed to create contact");
      return false;
    } finally {
      store.setSubmitting(false);
    }
  };

  const updateContact = async (updated: Contact): Promise<boolean> => {
    store.setSubmitting(true);
    try {
      const saved = await contactLeadsApi.updateContact(updated);
      store.updateContact(saved);
      toast.success("Contact updated successfully");
      return true;
    } catch (err: any) {
      toast.error(err?.message || "Failed to update contact");
      return false;
    } finally {
      store.setSubmitting(false);
    }
  };

  const deleteContact = async (id: string): Promise<boolean> => {
    store.setSubmitting(true);
    try {
      // Check if it's a UUID (backend record) or a local-only record
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

      if (isUuid) {
        await contactLeadsApi.deleteContact(id);
      }

      store.removeContact(id);
      toast.success("Contact deleted successfully");
      return true;
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete contact");
      return false;
    } finally {
      store.setSubmitting(false);
    }
  };

  const getContact = async (id: string): Promise<Contact | null> => {
    try {
      const contact = await contactLeadsApi.getContact(id);
      return contact;
    } catch {
      return null;
    }
  };

  const uploadBusinessCard = async (
    contactId: string,
    imageDataUrl: string
  ): Promise<string | null> => {
    store.setSubmitting(true);
    try {
      const upload = await contactLeadsApi.uploadContactBusinessCard(contactId, imageDataUrl);
      toast.success("Business card uploaded successfully");
      return upload.business_card_url;
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload business card");
      return null;
    } finally {
      store.setSubmitting(false);
    }
  };

  return {
    contacts: store.contacts,
    leads: store.leads,
    isLoading: store.isLoading,
    isSubmitting: store.isSubmitting,
    initialized: store.initialized,
    createContact,
    updateContact,
    deleteContact,
    getContact,
    uploadBusinessCard,
  };
}
