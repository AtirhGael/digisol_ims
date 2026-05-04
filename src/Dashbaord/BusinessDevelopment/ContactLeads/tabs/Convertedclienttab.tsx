// Contact Leads: feature UI logic and helpers
import { useMemo } from "react";
import { createConvertedClientsColumns } from "../../../../components/Columns/ContactLeadsColumns";
import ReusableTable from "../../../../components/other/ReusableTable/ReusableTable";
import { type Contact } from "../types";

export default function Convertedclienttab({
  contacts,
  onViewContact,
  onEditContact,
  onDeleteContact,
}: {
  contacts: Contact[];
  onViewContact: (contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
}) {
  // Only show contacts that were explicitly converted to clients.
  const clients = contacts.filter(
    (contact) =>
      contact.source === "CLIENT" ||
      contact.source === "LEAD-CONVERSION" ||
      contact.contactSource === "Lead Conversion"
  );

  const sourceOptions = useMemo(
    () =>
      Array.from(new Set(clients.map((contact) => contact.source).filter(Boolean))).map((source) => ({
        key: "source",
        value: source,
        label: source,
      })),
    [clients],
  );


  return (
    <ReusableTable
      heading="Converted Clients"
      data={clients}
      columns={createConvertedClientsColumns({
        onViewContact,
        onEditContact,
        onDeleteContact,
      })}
      searchKeys={["name", "company", "position", "phone", "email", "source", "date"]}
      filterKey="source"
      filterOptions={sourceOptions}
    />
  );
}


