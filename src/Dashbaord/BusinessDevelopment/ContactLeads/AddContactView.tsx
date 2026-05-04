// Contact Leads: feature UI logic and helpers
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import {
  BusinessCardSection,
  Field,
  SelectField,
  inputCls,
} from "./components/ContactLeads.shared";
import type { Contact, FormStep, InterestLevel } from "./types";
import useFetchHook from "../../../Hooks/UseFetchHook";

export function AddContactView({ onBack, onSave, isSubmitting = false }: { onBack: () => void; onSave: (c: Contact) => Promise<void> | void; isSubmitting?: boolean }) {
  // Fetch prospections that could be ACTIVE or COMPLETED.
  // We include PENDING and APPROVED so the backend's date-based sync can transition them to ACTIVE/COMPLETED.
  // After fetching, we filter to only show ACTIVE and COMPLETED in the dropdown.
  const { data: prospectionsRes, isLoading: prospectionsLoading } = useFetchHook<{
    success: boolean;
    data: { prospections: any[] };
  }>("business-development/prospections?status=PENDING,APPROVED,ACTIVE,COMPLETED&limit=100", "prospections-for-contacts");
  
  // Only show ACTIVE and COMPLETED prospections in the dropdown (backend syncs status based on dates)
  const activeProspections = (prospectionsRes?.data?.prospections || [])
    .filter((p: any) => p.status === 'ACTIVE' || p.status === 'COMPLETED');

  // Step-based form flow (personal → company → engagement).
  const [step, setStep] = useState<FormStep>("personal");

  // Form fields captured across steps.
  const [firstName,      setFirstName]      = useState("");
  const [lastName,       setLastName]        = useState("");
  const [industrySector, setIndustrySector]  = useState("");
  const [industryOther, setIndustryOther] = useState("");
  const [position,       setPosition]        = useState("");
  const [primaryPhone,   setPrimaryPhone]    = useState("");
  const [secondaryPhone, setSecondaryPhone]  = useState("");
  const [email,          setEmail]           = useState("");
  const [companyName,    setCompanyName]     = useState("");
  const [streetAddress,  setStreetAddress]   = useState("");
  const [city,           setCity]            = useState("");
  const [country,        setCountry]         = useState("");
  const [prospection,    setProspection]     = useState("");
  const [source,         setSource]          = useState("");
  const [interestLevel,  setInterestLevel]   = useState<InterestLevel>("Low");
  const [notes,          setNotes]           = useState("");
  const [businessCardImage, setBusinessCardImage] = useState<string | null>(null);

  // Step labels used for the top progress tabs.
  const steps = [
    { key: "personal"   as FormStep, label: "Personal & Contact Information" },
    { key: "company"    as FormStep, label: "Company Information"            },
    { key: "engagement" as FormStep, label: "Engagement Details"             },
  ];

  // Interest options displayed in the engagement step.
  const interestOptions: { value: InterestLevel; label: string; description: string; badgeClass: string }[] = [
    { value: "High", label: "High",           description: "Ready to engage services now",        badgeClass: "bg-green-100 text-green-700" },
    { value: "Medium", label: "Medium", description: "Showed interest and has potential",    badgeClass: "bg-amber-100 text-amber-600" },
    { value: "Low",    label: "Low",   description: "General contact for future reference", badgeClass: "bg-blue-100 text-blue-600"   },
  ];

  // Handler for the final save action when form is completed.
  const handleSave = async () => {
    // Basic validation before persisting.
    if (firstName.trim().length < 2) {
      toast.error("First name must be at least 2 characters");
      return;
    }
    if (lastName.trim().length < 2) {
      toast.error("Last name must be at least 2 characters");
      return;
    }
    // Generate current date and timestamp for record metadata.
    const now  = new Date();
    const date = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
    const ts   = now.toLocaleString();
    
    // Map selected prospection ID back to its title/code for display/saving if needed
    const selectedProspection = activeProspections.find(p => p.prospection_id === prospection);
    const collectedFromValue = selectedProspection 
      ? `PROSP:${selectedProspection.prospection_code} - ${selectedProspection.title}` 
      : (source || "Manual Entry");
    
    // Map form state into a Contact record.
    await onSave({
      id: String(Date.now()), name: `${firstName} ${lastName}`.trim(),
      firstName, lastName, company: companyName, phone: primaryPhone, secondaryPhone,
      email, interestLevel, source: source || "MANUAL", date, position,
      industrySector: industrySector === "Other" ? industryOther.trim() : industrySector,
      address: streetAddress, location: `${city}, ${country}`,
      collectedFrom: collectedFromValue, collectedDate: ts,
      contactSource: source, firstContactDate: ts, createdBy: "Current User",
      createdAt: ts, lastUpdated: ts, notes, businessCardImage,
      prospectionId: prospection || undefined,
    });
  };

  return (
    <div className="min-h-full font-sans">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 m-0">Contacts & Leads Management</h1>
          <p className="text-sm text-gray-400 mt-1 mb-0">
            <span className="cursor-pointer hover:text-blue-600" onClick={onBack}>Contacts & Leads</span>{" / "}
            <span className="text-gray-600">Add New Contact</span>
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2 w-full sm:w-auto">
          <span className="font-mono text-xs text-gray-400">&lt;--</span> Back to Contacts
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-8 transition-all duration-200 ">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Add New Contact</h2>
        <p className="text-sm text-gray-400 mb-6">Capture contact information and classify their interest level</p>

        {/* Step navigation */}
        <div className="flex border-b-2 border-gray-200 mb-8 gap-6 sm:gap-10 overflow-x-auto">
          {steps.map((s) => {
            const active = step === s.key;
            return (
              <button key={s.key} type="button" onClick={() => setStep(s.key)}
                className={`px-0 py-2.5 text-xs sm:text-sm border-none bg-transparent cursor-pointer transition-colors whitespace-nowrap
                  ${active ? "text-gray-900 font-semibold" : "text-gray-400 hover:text-gray-600 font-medium"}`}>
                <span className={active ? "relative inline-block after:absolute after:left-0 after:-bottom-14px after:h-4px after:w-full after:bg-primary" : "relative inline-block"}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Personal step */}
        {step === "personal" && (
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-sm font-semibold text-gray-400 mb-5">Personal Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="First Name" required><input className={inputCls} placeholder="Enter first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></Field>
                <Field label="Last Name"  required><input className={inputCls} placeholder="Enter last name"  value={lastName}  onChange={(e) => setLastName(e.target.value)}  /></Field>
                <Field label="Industry Sector">
                  <SelectField value={industrySector} onChange={setIndustrySector}>
                    <option value="">Select industry</option>
                    {["Technology","Logistics","Finance","Healthcare","Manufacturing","Retail","Education", "Other"].map((o) => <option key={o}>{o}</option>)}
                  </SelectField>
                </Field>
                {industrySector === "Other" && (
                  <Field label="Industry (Other)">
                    <input
                      className={inputCls}
                      placeholder="Enter industry"
                      value={industryOther}
                      onChange={(e) => setIndustryOther(e.target.value)}
                    />
                  </Field>
                )}
                <Field label="Position/Title"><input className={inputCls} placeholder="e.g. CEO, Manager" value={position} onChange={(e) => setPosition(e.target.value)} /></Field>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-400 mb-5">Contact Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Primary Phone"   required><input className={inputCls} placeholder="+237 6XX XXX XXX" value={primaryPhone}   onChange={(e) => setPrimaryPhone(e.target.value)}   /></Field>
                <Field label="Secondary Phone"         ><input className={inputCls} placeholder="+237 6XX XXX XXX" value={secondaryPhone} onChange={(e) => setSecondaryPhone(e.target.value)} /></Field>
                <div className="sm:col-span-2"><Field label="Email Address"><input className={inputCls} type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></Field></div>
              </div>
            </div>
          </div>
        )}

        {/* Company step */}
        {step === "company" && (
          <div className="flex flex-col gap-5">
            <Field label="Company Name" required><input className={inputCls} placeholder="Enter company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></Field>
            <Field label="Physical Address" required><input className={inputCls} placeholder="Street Address" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} /></Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="City" required>
                <SelectField value={city} onChange={setCity}>
                  {["Douala","Yaoundé","Bafoussam","Bamenda","Garoua","Maroua","Ngaoundéré","Bertoua","Ebolowa","Buea"].map((o) => <option key={o}>{o}</option>)}
                </SelectField>
              </Field>
              <Field label="Country" required><input className={inputCls} placeholder="Cameroon" value={country} onChange={(e) => setCountry(e.target.value)} /></Field>
            </div>
          </div>
        )}

        {/* Engagement step */}
        {step === "engagement" && (
          <div className="flex flex-col gap-6">
            <Field label="Link to Prospection Activity">
              <SelectField value={prospection} onChange={setProspection}>
                <option value="">Select prospection (optional)</option>
                {prospectionsLoading ? (
                  <option disabled>Loading prospections...</option>
                ) : activeProspections.length === 0 ? (
                  <option disabled>No active/completed prospections found</option>
                ) : (
                  activeProspections.map((p: any) => (
                    <option key={p.prospection_id} value={p.prospection_id}>
                      {p.prospection_code} - {p.title} ({p.location_city}) [{p.status}]
                    </option>
                  ))
                )}
              </SelectField>
            </Field>
            <Field label="Contact Source" required>
              <input className={inputCls} placeholder="e.g. Event, Referral, LinkedIn" value={source} onChange={(e) => setSource(e.target.value)} />
            </Field>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Interest Level Classification</p>
              <p className="text-xs text-gray-400 mb-4">Classify the contact's level of interest in your services (required)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {interestOptions.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setInterestLevel(opt.value)}
                    className={`text-left p-4 rounded-lg border-2 transition-all cursor-pointer bg-white w-full
                      ${interestLevel === opt.value ? "border-blue-400 " : "border-gray-200 hover:border-gray-300"}`}>
                    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2 ${opt.badgeClass}`}>{opt.label}</span>
                    <p className="text-sm text-gray-600 m-0">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1.5">Notes and Observations</p>
              <textarea className={`${inputCls} resize-none h-28`} placeholder="Add any relevant notes..." value={notes} maxLength={2000} onChange={(e) => setNotes(e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">{notes.length}/2000 characters</p>
            </div>
            <BusinessCardSection image={businessCardImage} onImageChange={setBusinessCardImage} />
          </div>
        )}

        {/* Form actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mt-10 pt-6 border-t border-gray-100">
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">Cancel</Button>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {step !== "personal"   && <Button variant="outline" onClick={() => setStep(step === "engagement" ? "company" : "personal")} className="w-full sm:w-auto">Previous</Button>}
            {step !== "engagement" ? <Button variant="default" onClick={() => setStep(step === "personal" ? "company" : "engagement")} className="w-full sm:w-auto">Next</Button>
                                  : <Button variant="default" onClick={handleSave} disabled={isSubmitting} className="w-full sm:w-auto">
                                      {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                          Saving...
                                        </span>
                                      ) : "Save"}
                                    </Button>}
          </div>
        </div>
      </div>
    </div>
  );
}




