// Contact Leads: feature UI logic and helpers
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  LuUser,
  LuBuilding2,
  LuPhone,
  LuPencil,
  LuArrowRight,
  LuArrowLeft,
  LuTrash2,
  LuMapPin,
  LuMail,
  LuFileImage,
  LuCircleCheck,
  LuX,
  LuUpload,
} from "react-icons/lu";
import { Button } from "../../../components/ui/button";
import {
  BusinessCardSection,
  ConvertToLeadModal,
  HDivider,
  InfoRow,
  InterestBadge,
  SectionCard,
  SelectField,
  inputCls,
} from "./components/ContactLeads.shared";
import type { Contact, InterestLevel, Lead, LeadStatus } from "./types";
import { contactLeadsApi, type ConvertContactToLeadPayload } from "./ContactLeads.api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";

export function ContactDetailView({ contact, onBack, onUpdate, onDelete, onConvert, startInEdit = false, isSubmitting = false }: {
  contact: Contact; onBack: () => void;
  onUpdate: (updated: Contact) => Promise<boolean>;
  onDelete: (id: string) => void;
  onConvert: (payload: ConvertContactToLeadPayload) => Promise<boolean>;
  startInEdit?: boolean;
  isSubmitting?: boolean;
}) {
  // Navigation is used to switch between view/edit routes.
  const navigate = useNavigate();
  // Local UI state for edit + modal visibility.
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Editable contact fields.
  const [firstName, setFirstName] = useState(contact.firstName);
  const [lastName, setLastName] = useState(contact.lastName);
  const [position, setPosition] = useState(contact.position);
  const [industrySector, setIndustrySector] = useState(contact.industrySector);
  const [industryOther, setIndustryOther] = useState("");
  const [phone, setPhone] = useState(contact.phone);
  const [secondaryPhone, setSecondaryPhone] = useState(contact.secondaryPhone);
  const [email, setEmail] = useState(contact.email);
  const [company, setCompany] = useState(contact.company);
  const [address, setAddress] = useState(contact.address);
  const [location, setLocation] = useState(contact.location);
  const [interestLevel, setInterestLevel] = useState<InterestLevel>(contact.interestLevel);
  const [contactSource, setContactSource] = useState(contact.contactSource);
  const [notes, setNotes] = useState(contact.notes);
  const [leadStatus, setLeadStatus] = useState<LeadStatus | "">(contact.leadData?.status || "");
  const [leadEstimatedValue, setLeadEstimatedValue] = useState(contact.leadData?.estimatedValue || "");
  const [businessCardImage, setBusinessCardImage] = useState<string | null>(contact.businessCardImage);
  const [pendingCardImage, setPendingCardImage] = useState<string | null>(null);
  const cardFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Start in edit mode when routed to /edit.
    setIsEditing(startInEdit);
  }, [contact.id, startInEdit]);

  const handleCardFile = (file: File) => {
    // Create a local preview for the uploaded business card.
    const reader = new FileReader();
    reader.onload = (e) => setPendingCardImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveCard = async () => {
    // Upload business card and persist the new URL.
    if (!pendingCardImage) return;
    try {
      const upload = await contactLeadsApi.uploadContactBusinessCard(contact.id, pendingCardImage);
      const imageUrl = upload.business_card_url || pendingCardImage;
      setBusinessCardImage(imageUrl);
      setPendingCardImage(null);
      const ts = new Date().toLocaleString();
      onUpdate({ ...contact, businessCardImage: imageUrl, lastUpdated: ts });
      toast.success("Business card uploaded");
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload business card");
    }
  };
  // Handler for deleting the business card image.
  const handleSaveEdit = async () => {
    // Persist edited contact fields.
    const ts = new Date().toLocaleString();
    const success = await onUpdate({
      ...contact,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      position,
      industrySector: industrySector === "Other" ? industryOther.trim() : industrySector,
      phone,
      secondaryPhone,
      email,
      company,
      address,
      location,
      interestLevel,
      contactSource,
      notes,
      businessCardImage,
      lastUpdated: ts,
      leadData: contact.leadData ? {
        ...contact.leadData,
        status: leadStatus as LeadStatus,
        estimatedValue: leadEstimatedValue
      } : undefined,
    });

    if (success) {
      if (startInEdit) {
        onBack();
        return;
      }
      setIsEditing(false);
    }
  };
  // Handler for canceling edits and reverting to original contact values.
  const handleCancelEdit = () => {
    // Revert local edits back to original contact values.
    setFirstName(contact.firstName); setLastName(contact.lastName); setPosition(contact.position);
    setIndustrySector(contact.industrySector);
    setIndustryOther("");
    setPhone(contact.phone); setSecondaryPhone(contact.secondaryPhone);
    setEmail(contact.email); setCompany(contact.company); setAddress(contact.address); setLocation(contact.location);
    setInterestLevel(contact.interestLevel); setContactSource(contact.contactSource); setNotes(contact.notes);
    setBusinessCardImage(contact.businessCardImage);
    setLeadStatus(contact.leadData?.status || "");
    setLeadEstimatedValue(contact.leadData?.estimatedValue || "");
    if (startInEdit) {
      onBack();
      return;
    }
    setIsEditing(false);
  };

  // Dropdown options for interest level.
  const interestOptions: { value: InterestLevel; label: string }[] = [
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
    { value: "Lead", label: "Lead" },
  ];

  // Helper to render editable text fields.
  const editInput = (value: string, onChange: (v: string) => void, placeholder = "") =>
    isEditing
      ? <input className={`${inputCls} mt-0.5`} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      : <span className="text-sm font-medium text-gray-800">{value || "—"}</span>;

  const [isDeleting, setIsDeleting] = useState(false);
  const isLostLead = String(contact.leadData?.status || "").toUpperCase() === "LOST";
  const canConvertToLead =
    !isLostLead &&
    contact.contactSource !== "Lead Conversion" &&
    contact.collectedFrom !== "Lead Pipeline";

  return (
    <>
      <AlertDialog
        open={showDeleteModal}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setShowDeleteModal(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{contact.name}"? This action cannot be undone and all associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={isDeleting}>Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={async (e) => {
                  e.preventDefault();
                  setIsDeleting(true);
                  try {
                    await onDelete(contact.id);
                    onBack();
                  } finally {
                    setIsDeleting(false);
                    setShowDeleteModal(false);
                  }
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
      {/* Convert-to-lead modal */}
      {showConvertModal && (
        <ConvertToLeadModal
          contact={contact}
          isSubmitting={isConverting}
          onConfirm={async (payload) => {
            setIsConverting(true);
            const success = await onConvert(payload);
            setIsConverting(false);
            if (success) setShowConvertModal(false);
          }}
          onCancel={() => { if (!isConverting) setShowConvertModal(false); }}
        />
      )}

      <div className="min-h-full font-sans flex flex-col gap-5">
        {/* Breadcrumb */}
        <p className="text-sm text-gray-400 m-0">
          <span className="cursor-pointer hover:text-blue-600 transition-colors" onClick={onBack}>Contacts & Leads</span>
          {" / "}<span className="text-gray-700 font-medium">{contact.id}</span>
        </p>

        {/* Hero */}
        <SectionCard>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {isEditing ? (
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <input className={`${inputCls} w-full sm:w-35`} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
                    <input className={`${inputCls} w-full sm:w-35`} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
                  </div>
                ) : (
                  <h1 className="text-xl font-bold text-gray-900 m-0">{`${firstName} ${lastName}`.trim()}:</h1>
                )}
                <LuBuilding2 className="text-gray-400 text-base shrink-0" />
                {isEditing
                  ? <input className={`${inputCls} w-full sm:w-50`} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" />
                  : <span className="text-base font-semibold text-gray-700">{company}</span>
                }
              </div>
              <div>
                {isEditing
                  ? <input className={`${inputCls} max-w-xs`} value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Position / Title" />
                  : <p className="text-sm text-gray-500 m-0">{position}</p>
                }
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {isEditing ? (
                  <SelectField value={interestLevel} onChange={(v) => setInterestLevel(v as InterestLevel)}>
                    {interestOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </SelectField>
                ) : (
                  <InterestBadge level={interestLevel} />
                )}
                {isEditing ? (
                  <div className="flex flex-col gap-2 w-full sm:w-60">
                    <SelectField value={industrySector} onChange={(v) => setIndustrySector(v as string)}>
                      <option value="">Select industry</option>
                      {["Technology", "Logistics", "Finance", "Healthcare", "Manufacturing", "Retail", "Education", "Other"].map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </SelectField>
                    {industrySector === "Other" && (
                      <input
                        className={`${inputCls}`}
                        value={industryOther}
                        onChange={(e) => setIndustryOther(e.target.value)}
                        placeholder="Enter industry"
                      />
                    )}
                  </div>
                ) : (
                  <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">{industrySector}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto shrink-0">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancelEdit} className="w-full sm:w-auto">Cancel</Button>
                  <Button variant="default" onClick={handleSaveEdit} disabled={isSubmitting} className="gap-2 w-full sm:w-auto">
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Saving...
                      </span>
                    ) : (
                      <><LuCircleCheck className="text-sm" /> Save Changes</>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="gap-2 w-full sm:w-auto"
                    onClick={() => {
                      if (startInEdit) {
                        setIsEditing(true);
                        return;
                      }
                      navigate(`/dashboard/contactsleads/${contact.id}/edit`);
                    }}
                  >
                    <LuPencil className="text-sm" /> Edit Contact
                  </Button>
                  {canConvertToLead && (
                    <Button variant="default" className="gap-2 w-full sm:w-auto" onClick={() => setShowConvertModal(true)}><LuArrowRight className="text-sm" /> Convert to Lead</Button>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-400 m-0">
              {contact.collectedFrom.startsWith("PROSP:") ? (
                <>
                  Prospection Source:{" "}
                  <span
                    className="text-blue-600 font-bold cursor-pointer hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-100 transition-colors hover:bg-blue-100"
                    onClick={() => contact.prospectionId && navigate(`/dashboard/prospectionplanning/view/${contact.prospectionId}`)}
                    title={contact.collectedFrom.split(" - ")[1] || "View Prospection"}
                  >
                    {contact.collectedFrom.split(" - ")[0].replace("PROSP:", "")}
                  </span>
                  <span className="ml-2 text-gray-500 italic">
                    ({contact.collectedFrom.split(" - ")[1]})
                  </span>
                </>
              ) : (
                <>
                  Collected from Source: <span className="font-medium text-gray-700">{contact.collectedFrom}</span>
                </>
              )}
              {" . "}<span className="text-gray-500">{contact.collectedDate}</span>
            </p>
          </div>
        </SectionCard>

        {/* Contact Information */}
        <SectionCard>
          <h2 className="text-base font-bold text-gray-900 mb-5">Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-gray-100 rounded-lg p-4 flex flex-col gap-4 transition-all duration-200 ">
              <div className="flex items-center gap-2 text-gray-500"><LuUser className="text-base" /><span className="text-sm font-semibold">Personal Details</span></div>
              <div className="flex flex-col gap-0.5"><span className="text-xs text-gray-400">Full Name</span><span className="text-sm font-medium text-gray-800">{`${firstName} ${lastName}`.trim()}</span></div>
              <div className="flex flex-col gap-0.5"><span className="text-xs text-gray-400">Position/Title</span>{editInput(position, setPosition, "Position")}</div>
              <div className="flex flex-col gap-0.5"><span className="text-xs text-gray-400">Industry Sector</span>{editInput(industrySector, setIndustrySector, "Industry")}</div>
            </div>
            <div className="border border-gray-100 rounded-lg p-4 flex flex-col gap-4 transition-all duration-200 ">
              <div className="flex items-center gap-2 text-gray-500"><LuBuilding2 className="text-base" /><span className="text-sm font-semibold">Company Information</span></div>
              <div className="flex flex-col gap-0.5"><span className="text-xs text-gray-400">Company Name</span>{editInput(company, setCompany, "Company")}</div>
              <div className="flex flex-col gap-0.5"><span className="text-xs text-gray-400">Address</span>{editInput(address, setAddress, "Address")}</div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-400">Location</span>
                {isEditing
                  ? <input className={`${inputCls} mt-0.5`} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
                  : <span className="text-sm font-medium text-gray-800 flex items-center gap-1"><LuMapPin className="text-gray-400 text-xs shrink-0" />{location}</span>
                }
              </div>
            </div>
            <div className="border border-gray-100 rounded-lg p-4 flex flex-col gap-4 transition-all duration-200 ">
              <div className="flex items-center gap-2 text-gray-500"><LuPhone className="text-base" /><span className="text-sm font-semibold">Contact Methods</span></div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-400">Primary Phone</span>
                {isEditing ? <input className={`${inputCls} mt-0.5`} value={phone} onChange={(e) => setPhone(e.target.value)} />
                  : <span className="text-sm font-medium text-blue-600 flex items-center gap-1"><LuPhone className="text-xs shrink-0" />{phone}</span>}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-400">Secondary Phone</span>
                {isEditing ? <input className={`${inputCls} mt-0.5`} value={secondaryPhone} onChange={(e) => setSecondaryPhone(e.target.value)} placeholder="Optional" />
                  : <span className="text-sm font-medium text-blue-600 flex items-center gap-1"><LuPhone className="text-xs shrink-0" />{secondaryPhone || "—"}</span>}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-400">Email Address</span>
                {isEditing ? <input className={`${inputCls} mt-0.5`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  : <span className="text-sm font-medium text-blue-600 flex items-center gap-1 break-all"><LuMail className="text-xs shrink-0" />{email}</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="border border-gray-100 rounded-lg p-4 flex flex-col gap-3 transition-all duration-200 ">
              <span className="text-sm font-semibold text-gray-800">Engagement Details</span>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400">Interest Level</span>
                {isEditing
                  ? <SelectField value={interestLevel} onChange={(v) => setInterestLevel(v as InterestLevel)}>
                    {interestOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </SelectField>
                  : <InterestBadge level={interestLevel} />
                }
              </div>
              <HDivider />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-400">Contact Source</span>
                {isEditing ? <input className={`${inputCls} mt-0.5`} value={contactSource} onChange={(e) => setContactSource(e.target.value)} /> : <span className="text-sm font-medium text-gray-800">{contactSource}</span>}
              </div>
              <HDivider />
              <InfoRow label="First Contact Date" value={contact.firstContactDate} />
            </div>

            {contact.leadData && (
              <div className="border border-gray-100 rounded-lg p-4 flex flex-col gap-3 transition-all duration-200 ">
                <span className="text-sm font-semibold text-gray-800">Lead Details</span>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400">Lead Status</span>
                  {isEditing ? (
                    <SelectField value={leadStatus} onChange={(v) => setLeadStatus(v as LeadStatus)}>
                      <option value="NEW">New</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="QUALIFIED">Qualified</option>
                      <option value="WON">Won</option>
                      <option value="LOST">Lost</option>
                    </SelectField>
                  ) : (
                    <span className="text-sm font-medium text-gray-800">{leadStatus}</span>
                  )}
                </div>
                <HDivider />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-gray-400">Estimated Value (XAF)</span>
                  {isEditing ? (
                    <input className={`${inputCls} mt-0.5`} type="number" value={leadEstimatedValue} onChange={(e) => setLeadEstimatedValue(e.target.value)} />
                  ) : (
                    <span className="text-sm font-medium text-gray-800">{leadEstimatedValue || "—"}</span>
                  )}
                </div>
              </div>
            )}
            <div className="border border-gray-100 rounded-lg p-4 flex flex-col gap-3 transition-all duration-200 ">
              <span className="text-sm font-semibold text-gray-800">Record Information</span>
              <div className="flex justify-between items-center"><span className="text-xs text-gray-400">Created By</span><span className="text-sm font-semibold text-gray-800">{contact.createdBy}</span></div>
              <HDivider />
              <div className="flex justify-between items-center"><span className="text-xs text-gray-400">Created At</span><span className="text-sm font-medium text-gray-700">{contact.createdAt}</span></div>
              <HDivider />
              <div className="flex justify-between items-center"><span className="text-xs text-gray-400">Last Updated</span><span className="text-sm font-medium text-gray-700">{contact.lastUpdated}</span></div>
            </div>
          </div>
        </SectionCard>

        {/* Lead Conversion Banner */}
        {isEditing && canConvertToLead && (
          <div className="bg-white rounded-xl border-2 border-blue-100 p-5 flex flex-col sm:flex-row justify-between items-start gap-6 transition-all duration-200 ">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-bold text-blue-700">Ready for Lead Conversion</span>
              <p className="text-sm text-gray-500 m-0 leading-relaxed">
                This contact has shown strong interest and is qualified to be converted into a lead for pipeline tracking and follow-up.
              </p>
              <ul className="flex flex-col gap-1.5 m-0 p-0 list-none">
                {["Interest level: Potential Client", "Contact information complete", "Ready for assignment to sales team"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <LuCircleCheck className="text-blue-500 shrink-0 text-base" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <Button variant="default" className="gap-2 shrink-0 w-full sm:w-auto" onClick={() => setShowConvertModal(true)}>
              <LuArrowRight className="text-sm" /> Convert Now
            </Button>
          </div>
        )}

        {/* Notes & Attachment */}
        <SectionCard>
          <h2 className="text-base font-bold text-gray-900 mb-5">Notes and Attachment</h2>
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Notes & Observations</p>
            {isEditing ? (
              <>
                <textarea className={`${inputCls} resize-none h-28`} value={notes} maxLength={2000} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes..." />
                <p className="text-xs text-gray-400 mt-1">{notes.length}/2000 characters</p>
              </>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed m-0">{notes || "No notes added."}</p>
              </div>
            )}
          </div>

          {/* Business Card — always accessible, save independently */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Business Card</p>

            {/* Saved image preview */}
            {businessCardImage && !pendingCardImage && (
              <BusinessCardSection
                image={businessCardImage}
                onImageChange={() => { }}
                readOnly
              />
            )}

            {/* Pending upload preview + Save */}
            {pendingCardImage && (
              <div className="flex flex-col gap-3">
                <div className="relative border border-blue-200 rounded-xl overflow-hidden" style={{ maxWidth: 340, height: 200 }}>
                  <img src={pendingCardImage} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full">Preview</div>
                </div>
                <div className="flex gap-2 items-center">
                  <Button variant="default" className="gap-2" onClick={handleSaveCard}>
                    <LuCircleCheck className="text-sm" /> Save Business Card
                  </Button>
                  <Button variant="outline" className="gap-2 text-red-500 border-red-200 hover:bg-red-50" onClick={() => setPendingCardImage(null)}>
                    <LuX className="text-sm" /> Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Upload area — show when no saved image and no pending */}
            {!businessCardImage && !pendingCardImage && (
              <div className="border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center gap-3 bg-gray-50">
                <LuFileImage className="text-gray-400 text-2xl" />
                <p className="text-sm text-gray-500 m-0">No business card attached</p>
                <div className="flex gap-2">
                  <input ref={cardFileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleCardFile(e.target.files[0])} />
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => cardFileInputRef.current?.click()}>
                    <LuUpload className="text-xs" /> Upload Photo
                  </Button>
                </div>
              </div>
            )}

            {/* Replace button when saved and not editing */}
            {businessCardImage && !pendingCardImage && !isEditing && (
              <div className="mt-3 flex gap-2">
                <input ref={cardFileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleCardFile(e.target.files[0])} />
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => cardFileInputRef.current?.click()}>
                  <LuUpload className="text-xs" /> Replace Card
                </Button>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Footer */}
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center transition-all duration-200 ">
          <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={onBack}><LuArrowLeft className="text-sm" /> Back to Contacts</Button>
          <Button variant="outline" className="gap-2 text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto" onClick={() => setShowDeleteModal(true)}>
            <LuTrash2 className="text-sm" /> Delete Contact
          </Button>
        </div>
      </div>
    </>
  );
}




