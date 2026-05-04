import React, { useState, useEffect, useCallback } from "react";
import { Camera, Mail, Info, KeyRound, X, Eye, EyeOff } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useUserStore } from "../../Store/UserStore";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Skeleton from "../../components/other/Loader/Skeleton";
import { useAvatarUpload } from "../../Hooks/useAvatarUpload";

const baseURL = import.meta.env.VITE_BASE_URL;

/** Matches backend Joi changePassword rule (Digisol-IMS-backend validators/schemas.ts). */
const NEW_PASSWORD_RULE_HINT =
  "At least 8 characters, one uppercase, one lowercase, one number, and one special character (@$!%*?&#^()_+=-).";

function changePasswordErrorMessage(data: Record<string, unknown> | undefined): string {
  if (!data) return "Failed to change password.";
  const err = data.error;
  if (typeof err === "string" && err.trim()) return err;
  const details = data.details;
  if (Array.isArray(details)) {
    const parts = details
      .map((d: { message?: string }) => (typeof d?.message === "string" ? d.message : ""))
      .filter(Boolean);
    if (parts.length) return parts.join(", ");
  }
  const msg = data.message;
  if (typeof msg === "string" && msg.trim()) return msg;
  return "Failed to change password.";
}

interface ProfileData {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  phone: string | null;
  avatar_url: string | null;
  status: string;
  department_id: string | null;
  password_must_change?: boolean;
  user_roles_user_roles_user_idTousers: Array<{
    is_primary: boolean;
    roles: {
      role_id: string;
      role_name: string;
      role_code: string;
    };
  }>;
}

interface NotificationSettings {
  setting_id: string;
  user_id: string;
  channels_enabled: boolean;
  appointments: boolean;
  meetings: boolean;
  login_alerts: boolean;
  do_not_disturb: boolean;
  dnd_start_time: string;
  dnd_end_time: string;
}

export const Settings = () => {
  const [searchParams] = useSearchParams();
  const {
    accessToken,
    setPasswordMustChange,
    passwordMustChange,
    updateAvatarUrl,
  } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    role: "",
    email: "",
  });

  const [notifications, setNotifications] = useState({
    channels: true,
    appointments: false,
    meetings: false,
    loginAlerts: true,
    doNotDisturb: false,
  });

  const [doNotDisturbTime, setDoNotDisturbTime] = useState({
    from: "22:00",
    to: "22:00",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    isUploading: isUploadingAvatar,
    uploadAvatar: uploadAvatarToStorage,
  } = useAvatarUpload();

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`${baseURL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success) {
        setProfileData(data.data);
        setFormData({
          firstName: data.data.first_name || "",
          lastName: data.data.last_name || "",
          phoneNumber: data.data.phone || "",
          role:
            data.data.user_roles_user_roles_user_idTousers?.[0]?.roles
              ?.role_name || "",
          email: data.data.email || "",
        });
        setProfilePhoto(data.data.avatar_url);
        setPasswordMustChange(Boolean(data.data.password_must_change));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    }
  }, [accessToken, setPasswordMustChange]);

  const fetchNotificationSettings = useCallback(async () => {
    try {
      const response = await fetch(`${baseURL}/auth/notification-settings`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success && data.data) {
        setNotifications({
          channels: data.data.channels_enabled ?? true,
          appointments: data.data.appointments ?? false,
          meetings: data.data.meetings ?? false,
          loginAlerts: data.data.login_alerts ?? true,
          doNotDisturb: data.data.do_not_disturb ?? false,
        });
        setDoNotDisturbTime({
          from: data.data.dnd_start_time || "22:00",
          to: data.data.dnd_end_time || "22:00",
        });
      }
    } catch (error) {
      console.error("Error fetching notification settings:", error);
    }
  }, [accessToken]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProfile(), fetchNotificationSettings()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchProfile, fetchNotificationSettings]);

  useEffect(() => {
    if (passwordMustChange || searchParams.get("changePassword") === "true") {
      setShowPasswordModal(true);
    }
  }, [passwordMustChange, searchParams]);

  useEffect(() => {
    if (!showPasswordModal || !passwordMustChange) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [showPasswordModal, passwordMustChange]);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await uploadAvatar(file);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      // 1. Upload the image file to Supabase storage
      const publicUrl = await uploadAvatarToStorage(file);

      // 2. Persist the returned URL in the database
      await updateProfile({ avatar_url: publicUrl });

      // 3. Update local preview immediately
      setProfilePhoto(publicUrl);

      // 4. Update the global store so the navbar avatar reflects the change
      updateAvatarUrl(publicUrl);

      toast.success("Profile picture updated successfully");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(error?.message || "Failed to upload profile picture");
    }
  };

  const updateProfile = async (updates: Record<string, any>) => {
    try {
      const response = await fetch(`${baseURL}/auth/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phoneNumber,
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch(`${baseURL}/auth/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Password changed successfully");
        setShowPasswordModal(false);
        setPasswordMustChange(false);
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(changePasswordErrorMessage(data));
      }
    } catch {
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNotificationToggle = async (key: keyof typeof notifications) => {
    const newValue = !notifications[key];
    setNotifications({
      ...notifications,
      [key]: newValue,
    });

    try {
      await fetch(`${baseURL}/auth/notification-settings`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channels_enabled:
            key === "channels" ? newValue : notifications.channels,
          appointments:
            key === "appointments" ? newValue : notifications.appointments,
          meetings: key === "meetings" ? newValue : notifications.meetings,
          login_alerts:
            key === "loginAlerts" ? newValue : notifications.loginAlerts,
          do_not_disturb:
            key === "doNotDisturb" ? newValue : notifications.doNotDisturb,
        }),
      });
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast.error("Failed to save notification settings");
    }
  };

  const handleTimeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    const newDoNotDisturbTime = {
      ...doNotDisturbTime,
      [e.target.name]: newTime,
    };
    setDoNotDisturbTime(newDoNotDisturbTime);

    try {
      await fetch(`${baseURL}/auth/notification-settings`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dnd_start_time:
            e.target.name === "from" ? newTime : doNotDisturbTime.from,
          dnd_end_time: e.target.name === "to" ? newTime : doNotDisturbTime.to,
        }),
      });
    } catch (error) {
      console.error("Error saving notification settings:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <Skeleton className="h-9 w-40 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="flex flex-col items-center mb-6">
              <Skeleton className="w-32 h-32 rounded-full mb-3" />
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl px-6 py-3">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-1">
              Configure system preferences and access controls here.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="cancel" size="lg" onClick={fetchProfile}>
              Cancel
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 max-h-[68vh] overflow-auto">
          <h2 className="text-gray-800 font-semibold mb-4 border-b border-b-gray-200 pb-3">
            Profile Settings
          </h2>

          <div className="flex flex-col items-center mb-6">
            <div
              className={`w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-3 overflow-hidden border-2 transition-all ${dragActive ? "border-primary" : "border-gray-200"}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              style={{ cursor: "pointer", position: "relative" }}
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
              )}
              {dragActive && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center text-primary text-sm font-semibold z-10 rounded-full">
                  Drop image here
                </div>
              )}
            </div>
            <input
              type="file"
              id="avatar-file-input"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
              disabled={isUploadingAvatar}
            />
            <label
              htmlFor="avatar-file-input"
              className={`font-medium border-0 shadow-none cursor-pointer text-sm ${isUploadingAvatar ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:opacity-75"}`}
              style={{ color: "#42417E" }}
            >
              {isUploadingAvatar ? "Uploading..." : "Upload photo"}
            </label>
            <div className="mt-2 text-xs text-gray-500">
              Drag & drop or upload from file explorer
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 max-h-[68vh]">
          <div className="bg-white rounded-2xl p-6 max-h-[45vh] overflow-auto">
            <h2 className="text-gray-800 font-semibold mb-4 border-b border-b-gray-200 pb-3">
              Notification Settings
            </h2>
            <div className="space-y-5">
              <div className="py-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-medium">
                      Notification Channels
                    </span>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNotificationToggle("channels")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.channels ? "bg-primary" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.channels
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="pl-1 text-sm text-gray-500 mt-0.5">
                  Email & SMS
                </div>
              </div>
              <div className="py-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-medium">
                    Appointments
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNotificationToggle("appointments")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.appointments ? "bg-primary" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.appointments
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="py-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-medium">Meetings</span>
                  <button
                    type="button"
                    onClick={() => handleNotificationToggle("meetings")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.meetings ? "bg-primary" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.meetings
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="py-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-medium">
                      Login Alerts
                    </span>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNotificationToggle("loginAlerts")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.loginAlerts ? "bg-primary" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.loginAlerts
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="pl-1 text-sm text-gray-500 mt-0.5">
                  Notify on new/unfamiliar logins
                </div>
              </div>
              <div className="py-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-medium">
                      Do Not Disturb
                    </span>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNotificationToggle("doNotDisturb")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.doNotDisturb ? "bg-primary" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.doNotDisturb
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="pl-1 text-sm text-gray-500 mt-0.5">
                  Mute notifications during set hours
                </div>
              </div>
              <div className="pl-6 grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    From :
                  </label>
                  <input
                    type="time"
                    name="from"
                    value={doNotDisturbTime.from}
                    onChange={handleTimeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    To :
                  </label>
                  <input
                    type="time"
                    name="to"
                    value={doNotDisturbTime.to}
                    onChange={handleTimeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl px-6 py-3">
            <h3 className="text-gray-800 font-semibold mb-4 border-b border-b-gray-200 pb-3">
              Account and Security
            </h3>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-900 font-medium">Password</span>
              <Button
                variant="outline"
                size="default"
                className="flex items-center gap-2"
                onClick={() => setShowPasswordModal(true)}
              >
                <KeyRound className="w-4 h-4" />
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          aria-modal="true"
        >
          <div
            className="mx-4 w-full max-w-md rounded-xl bg-white shadow-2xl"
            role="dialog"
            aria-labelledby="password-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <h3
                id="password-modal-title"
                className="text-lg font-semibold text-gray-900"
              >
                Change Password
              </h3>
              {!passwordMustChange && (
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              )}
            </div>
            <div className="p-6 space-y-4">
              {passwordMustChange && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 text-amber-800 rounded-lg px-4 py-3 text-sm">
                  <span className="mt-0.5 shrink-0 text-amber-500">⚠</span>
                  <p>
                    <strong>Action required:</strong> You are using a temporary
                    password. You must set a new personal password before you
                    can access the platform.
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.old ? "text" : "password"}
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        oldPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({
                        ...showPassword,
                        old: !showPassword.old,
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword.old ? (
                      <EyeOff size={18} className="text-gray-400" />
                    ) : (
                      <Eye size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({
                        ...showPassword,
                        new: !showPassword.new,
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword.new ? (
                      <EyeOff size={18} className="text-gray-400" />
                    ) : (
                      <Eye size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{NEW_PASSWORD_RULE_HINT}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({
                        ...showPassword,
                        confirm: !showPassword.confirm,
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword.confirm ? (
                      <EyeOff size={18} className="text-gray-400" />
                    ) : (
                      <Eye size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              {!passwordMustChange && (
                <Button
                  variant="cancel"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={isChangingPassword}
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="default"
                onClick={handleChangePassword}
                loading={isChangingPassword}
                disabled={isChangingPassword}
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
