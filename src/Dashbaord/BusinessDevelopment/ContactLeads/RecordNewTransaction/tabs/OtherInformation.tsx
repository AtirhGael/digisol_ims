import { useRef, useState } from "react";
import { Input } from "../../../../../components/ui/input";
import { Button } from "../../../../../components/ui/button";
import SkeletonLoading from "../../../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { FaPlus, FaTimes, FaUpload, FaCamera } from "react-icons/fa";

interface ActionItem {
  id?: number;
  plan_name: string;
  date: string;
  status: string;
  people_involved?: string[];
}

type OtherInformationProps = {
  isLoading?: boolean;
  interaction?: {
    next_steps?: ActionItem[];
    people_involved?: string[];
  };
  updateInteraction?: (field: string, value: any) => void;
  peopleOptions?: string[];
};

const OtherInformation = ({
  isLoading = false,
  interaction,
  updateInteraction,
  peopleOptions = [],
}: OtherInformationProps) => {
  // Local action items state for the "Next Steps" section.
  const [actionItems, setActionItems] = useState<ActionItem[]>(
    interaction?.next_steps?.length
      ? interaction.next_steps.map((item, index) => ({
          ...item,
          id: item.id ?? index + 1,
        }))
      : [{ id: 1, plan_name: "", date: "", status: "PENDING", people_involved: [] }],
  );
  const [selectedPeople, setSelectedPeople] = useState<string[]>(
    (interaction?.people_involved || []).filter((name) => name?.trim())
  );
  const [customPerson, setCustomPerson] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return <SkeletonLoading />;
  }

  // Add a new action item row.
  const addActionItem = () => {
    const existingIds = actionItems.map((item) => item.id ?? 0);
    const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    const newItems = [
      ...actionItems,
      { id: newId, plan_name: "", date: "", status: "PENDING", people_involved: [] },
    ];
    setActionItems(newItems);
    updateInteraction?.("next_steps", newItems);
  };

  // Remove an action item row.
  const removeActionItem = (id: number) => {
    if (actionItems.length > 1) {
      const newItems = actionItems.filter((item) => item.id !== id);
      setActionItems(newItems);
      updateInteraction?.("next_steps", newItems);
    }
  };

  // Update a specific action item field.
  const updateActionItem = (
    id: number,
    field: keyof ActionItem,
    value: string,
  ) => {
    const newItems = actionItems.map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    );
    setActionItems(newItems);
    updateInteraction?.("next_steps", newItems);
  };

  // Add a custom person name to the selection.
  const addCustomPerson = () => {
    const name = customPerson.trim();
    if (!name) return;
    const next = selectedPeople.includes(name)
      ? selectedPeople
      : [...selectedPeople, name];
    setSelectedPeople(next);
    updateInteraction?.("people_involved", next);
    setCustomPerson("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Next Steps & Action Items */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Next Steps & Action Items
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Define follow-up actions to keep the lead moving forward
        </p>

        <div className="space-y-4">
          {actionItems.map((item, index) => (
            <div key={item.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-900">
                  Action Item
                </label>
                {actionItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeActionItem(item.id ?? 0)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Input
                type="text"
                placeholder="e.g., Send proposal document"
                value={item.plan_name}
                onChange={(e) =>
                  updateActionItem(item.id, "plan_name", e.target.value)
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    placeholder="Date"
                    className="block w-full"
                    value={item.date ? item.date.split("T")[0] : ""}
                    onChange={(e) =>
                      updateActionItem(
                        item.id,
                        "date",
                        `${e.target.value}T10:00:00`,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    People Involved
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Add person name"
                        value={customPerson}
                        onChange={(e) => setCustomPerson(e.target.value)}
                      />
                      <Button type="button" variant="outline" onClick={addCustomPerson}>
                        Add
                      </Button>
                    </div>
                    {selectedPeople.filter((name) => name?.trim()).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedPeople
                          .filter((name) => name?.trim())
                          .map((name) => (
                          <span
                            key={name}
                            className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="default"
            onClick={addActionItem}
            className="w-full gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Add Action Item
          </Button>
        </div>
      </div>

      {/* Attachments & Documents */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Attachments & Documents
        </h3>

        {uploadedFiles.length > 0 && (
          <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative border rounded-lg p-2">
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500 text-center px-2">
                      {file.name}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.ppt,.pptx"
          onChange={handleFileUpload}
          className="hidden"
        />
        <div className="flex gap-3 mb-3">
          <Button
            variant="outline"
            size="default"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaUpload className="w-4 h-4" />
            Upload Photo
          </Button>
          <Button variant="outline" size="default" className="gap-2">
            <FaCamera className="w-4 h-4" />
            Take Photo
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Attach meeting notes, presentations, proposals, or any relevant
          documents
        </p>
      </div>
    </div>
  );
};

export default OtherInformation;
