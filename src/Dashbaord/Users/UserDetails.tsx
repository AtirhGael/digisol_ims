import { ChevronLeft, User, Mail, Building, Calendar, Shield, Activity } from "lucide-react";
import { useFetchHook } from "../../Hooks/UseFetchHook";
import SkeletonLoading from "../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { Button } from "../../components/ui/button";

// Types
interface UserRole {
  id: string;
  name: string;
  code: string;
  is_primary: boolean;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface UserProps {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_ACTIVATION';
  department: Department | null;
  roles: UserRole[];
  created_at: string;
  updated_at: string;
  avatar_url?: string;
}

// Styles
function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

interface UserDetailsProps {
  userId: string;
  onBack: () => void;
}

export function UserDetails({ userId, onBack }: UserDetailsProps) {
  // Fetch user data by ID
  const { 
    data: userResponse, 
    isLoading, 
    isError, 
    error 
  } = useFetchHook(`/users/${userId}`, `user-${userId}`);

  const user = userResponse?.data;

  // Loading state
  if (isLoading) {
    return <SkeletonLoading />;
  }

  // Error state
  if (isError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <User size={48} className="text-gray-400 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">User Not Found</h3>
            <p className="text-gray-600">
              {error || "The requested user could not be found or an error occurred while loading the data."}
            </p>
          </div>
          <Button
            variant="default"
            onClick={onBack}
          >
            <ChevronLeft size={16} />
            Back to Users
          </Button>
        </div>
      </div>
    );
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-red-100 text-red-800';
      case 'PENDING_ACTIVATION': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Active';
      case 'INACTIVE': return 'Inactive';
      case 'PENDING_ACTIVATION': return 'Pending Activation';
      default: return status;
    }
  };

  const primaryRole = user.roles.find((r: UserRole) => r.is_primary)?.name || user.roles[0]?.name || 'No Role';

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-400">
        <button onClick={onBack} className="hover:text-primary flex items-center gap-1 transition-colors">
          <ChevronLeft size={14} /> Users
        </button>
        <span>/</span>
        <span className="text-gray-700 font-medium">User Details</span>
      </nav>

      <div className="flex items-center gap-4 mb-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Profile</h1>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {primaryRole}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
            {getStatusLabel(user.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Information - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Overview */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">Profile Overview</h2>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="shrink-0">
                <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-gray-200 flex items-center justify-center">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={`${user.first_name} ${user.last_name}`}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User size={32} className="text-gray-400" />
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{user.first_name} {user.last_name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem 
                    label="Email Address" 
                    value={user.email}
                    icon={<Mail size={16} className="text-gray-600" />}
                  />
                  <InfoItem 
                    label="Username" 
                    value={user.username}
                    icon={<User size={16} className="text-gray-600" />}
                  />
                  <InfoItem 
                    label="Department" 
                    value={user.department?.name || 'No Department'}
                    icon={<Building size={16} className="text-gray-600" />}
                  />
                  <InfoItem 
                    label="Phone" 
                    value={user.phone || 'Not provided'}
                    icon={<Mail size={16} className="text-gray-600" />}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Account Details */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
              <h2 className="text-base font-semibold text-gray-800">Account Information</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Account Details</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-blue-700">User ID:</span>
                    <p className="text-sm font-mono text-blue-900">{user.user_id}</p>
                  </div>
                  <div>
                    <span className="text-xs text-blue-700">Created On:</span>
                    <p className="text-sm text-blue-900">{new Date(user.created_at).toLocaleDateString('en-GB')}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="text-sm font-medium text-green-900 mb-2">Access Level</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-green-700">Roles:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.roles.map((role: UserRole) => (
                        <span 
                          key={role.id} 
                          className={`px-2 py-1 text-xs rounded ${role.is_primary ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}
                        >
                          {role.name} {role.is_primary && '(Primary)'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-green-700">Status:</span>
                    <p className="text-sm text-green-900">{getStatusLabel(user.status)}</p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Activity Summary */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <h2 className="text-base font-semibold text-gray-800">Activity Summary</h2>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">127</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Total Logins</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">45</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Tasks Completed</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">23</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Projects</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">98%</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Attendance</div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <SectionCard>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Quick Actions</h3>
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800">
                  Send Message
                </Button>
                <Button variant="outline" className="w-full justify-start bg-green-50 hover:bg-green-100 border-green-200 text-green-800">
                  Reset Password
                </Button>
                <Button variant="outline" className="w-full justify-start bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-800">
                  View Tasks
                </Button>
                <Button variant="outline" className="w-full justify-start bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800">
                  Generate Report
                </Button>
              </div>
            </div>
          </SectionCard>

          {/* Department Info */}
          <SectionCard>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Department Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Department</label>
                  <p className="text-sm text-gray-700 font-medium">{user.department?.name || 'No Department'}</p>
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Manager</label>
                  <p className="text-sm text-gray-700">
                    {user.department?.name === 'IT' ? 'John Smith' :
                     user.department?.name === 'HR' ? 'Sarah Johnson' :
                     user.department?.name === 'Sales' ? 'Mike Wilson' :
                     user.department?.name === 'Marketing' ? 'Lisa Davis' :
                     'Unknown Manager'}
                  </p>
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Team Size</label>
                  <p className="text-sm text-gray-700">
                    {user.department?.name === 'IT' ? '12 members' :
                     user.department?.name === 'HR' ? '8 members' :
                     user.department?.name === 'Sales' ? '15 members' :
                     user.department?.name === 'Marketing' ? '10 members' :
                     '6 members'}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Security Info */}
          <SectionCard>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Security Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-900">Two-Factor Auth</p>
                    <p className="text-xs text-green-700">Enabled</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Password Updated</p>
                    <p className="text-xs text-blue-700">30 days ago</p>
                  </div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Login Sessions</p>
                    <p className="text-xs text-yellow-700">3 active</p>
                  </div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}