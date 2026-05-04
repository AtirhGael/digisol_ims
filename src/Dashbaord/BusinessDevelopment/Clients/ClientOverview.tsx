import { useState } from 'react'
import { Card } from '../../../components/other/Card'
import {FaLocationArrow} from "react-icons/fa";
import { FaStar, FaUser, FaCalendar, FaCreditCard, FaFileAlt, FaUsers, FaPlus, FaEye, FaCalendarCheck } from "react-icons/fa";
import { AddContact } from './components/AddContact';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { toast } from "sonner";

interface ClientOverviewProps {
  clientData?: any
}

export const ClientOverview = ({ clientData }: ClientOverviewProps) => {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    date: "",
    time: "",
    notes: "",
  });

  const handleScheduleSuccess = () => {
    setIsScheduleModalOpen(false);
    // Optionally refresh data here
  };

  const handleScheduleChange = (field: string, value: string) => {
    setScheduleForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleScheduleSubmit = () => {
    if (!scheduleForm.title.trim() || !scheduleForm.date) {
      toast.error("Please provide a title and date for the activity.");
      return;
    }
    toast.success("Activity scheduled successfully.");
    handleScheduleSuccess();
    setScheduleForm({ title: "", date: "", time: "", notes: "" });
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card
          heading="Total Contracts"
          amount={clientData?.total_contracts?.toString() || "0"}
          icons={<FaFileAlt className="text-white" />}
        />
        <Card
          heading="Total Value"
          amount={`${clientData?.total_contract_value?.toLocaleString() || "0"} XAF`}
          icons={<FaCreditCard className="text-white" />}
        />
        <Card
          heading="Last Contract"
          amount={clientData?.last_contract_date ? new Date(clientData.last_contract_date).toLocaleDateString() : "N/A"}
          icons={<FaCalendarCheck className="text-white" />}
        />
        <Card 
          heading="Satisfaction" 
          amount={`${clientData?.satisfaction || 5}/5`}
          icons={<FaStar className="text-white" />}
        />
      </div>

      {/* div */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Company details */}
        <div className="p-3 bg-white mt-5 rounded-lg">
          <h2 className="text-xl font-semibold">Company Details</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <p>Client Code: </p>
            <p className="text-textColor">{clientData?.client_code || 'N/A'}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <p>Industry:</p>
            <p className="text-textColor">{clientData?.industry || 'N/A'}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <p>Location:</p>
            <p className="flex items-center gap-2 text-textColor">
              {" "}
              <FaLocationArrow /> {clientData?.city ? `${clientData.city}, ${clientData.country || 'Cameroon'}` : 'N/A'}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <p>Zone:</p>
            <p className="text-textColor">{clientData?.zone || 'N/A'}</p>
          </div>
        </div>
        {/* Primary Contact */}
        <div className="p-3 bg-white mt-5 rounded-lg">
          <h2 className="text-xl font-semibold">Primary Contact</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <FaUser className="text-primary" />
              <div>
                <p className="font-medium">Contact Person</p>
                <p className="text-textColor text-sm">{clientData?.contact_person || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaFileAlt className="text-primary" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-textColor text-sm">{clientData?.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaUsers className="text-primary" />
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-textColor text-sm">{clientData?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200">
            <AddContact />
          </div>
        </div>

        {/* Account Info */}
        <div className="p-3 bg-white rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FaUser className="text-primary" />
              <div>
                <p className="font-medium">Account Manager</p>
                <p className="text-textColor text-sm">{clientData?.account_manager || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FaCalendar className="text-primary" />
              <div>
                <p className="font-medium">Client Since</p>
                <p className="text-textColor text-sm">{clientData?.client_since ? new Date(clientData.client_since).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FaCalendarCheck className="text-primary" />
              <div>
                <p className="font-medium">Onboarding Date</p>
                <p className="text-textColor text-sm">{clientData?.onboarding_date ? new Date(clientData.onboarding_date).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FaCreditCard className="text-primary" />
              <div>
                <p className="font-medium">Payment Terms</p>
                <p className="text-textColor text-sm">{clientData?.payment_terms || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Activities */}
        <div className="p-3 bg-white rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Company Activities</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaEye className="text-primary" />
                <div>
                  <p className="font-medium">Next Review</p>
                  <p className="text-textColor text-sm">
                    {clientData?.scheduled_activities && clientData.scheduled_activities.length > 0 
                      ? new Date(clientData.scheduled_activities[0].event_date).toLocaleDateString()
                      : 'No upcoming activities'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaFileAlt className="text-primary" />
                <div>
                  <p className="font-medium">Pending Activities</p>
                  <p className="text-textColor text-sm">
                    {clientData?.scheduled_activities 
                      ? `${clientData.scheduled_activities.filter((activity: any) => activity.status === 'PENDING').length} pending`
                      : '0 pending'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaUsers className="text-primary" />
                <div>
                  <p className="font-medium">Total Scheduled</p>
                  <p className="text-textColor text-sm">
                    {clientData?.scheduled_activities 
                      ? `${clientData.scheduled_activities.length} upcoming`
                      : '0 upcoming'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-200">
              <Button 
                className="w-full flex items-center gap-2"
                onClick={() => setIsScheduleModalOpen(true)}
              >
                <FaPlus className="text-sm" />
                Schedule Activity
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">Activity Title</label>
              <input
                value={scheduleForm.title}
                onChange={(e) => handleScheduleChange("title", e.target.value)}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
                placeholder="e.g., Quarterly Review"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Date</label>
                <input
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => handleScheduleChange("date", e.target.value)}
                  className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Time</label>
                <input
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) => handleScheduleChange("time", e.target.value)}
                  className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Notes</label>
              <textarea
                value={scheduleForm.notes}
                onChange={(e) => handleScheduleChange("notes", e.target.value)}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm min-h-24"
                placeholder="Optional notes..."
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleSubmit}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
