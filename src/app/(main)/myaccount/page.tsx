"use client";

import React, { useState, useEffect } from "react";
import { User, Lock, Loader2, Globe, Cpu } from "lucide-react";

import { userService, UserResponse, UpdateProfileRequest } from "@/services/auth/userService";
import { resolveMediaUrl } from "@/lib/media-url";
import { useCurrentUser } from "@/hooks/auth/useCurrentUser";
import { useUser } from "@/store/UserContext";

import MessageAlert from "@/components/user/manage/MessageAlert";
import ProfileTab from "@/components/user/manage/ProfileTab";
import PasswordTab from "@/components/user/manage/PasswordTab";
import BdcHubConfigTab from "@/components/user/manage/BdcHubConfigTab";
import McpApiKeyTab from "@/components/user/manage/McpApiKeyTab";
import AccountStats from "@/components/user/manage/AccountStats";
import { ActiveTab, MessageState, PasswordForm, ShowPasswords } from '@/types'
import { validateOnlyPassword } from '@/utils/common/utils'

const MAX_PROFILE_PICTURE_BYTES = 1024 * 1024;

const MyAccountPage: React.FC = () => {
  const { user: currentUser, saveUser } = useCurrentUser();
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [message, setMessage] = useState<MessageState>(null);

  const [profile, setProfile] = useState<UpdateProfileRequest>({
    name: "",
    email: "",
    team: "",
    type: "",
  });
  const [fullUserData, setFullUserData] = useState<UserResponse | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState<ShowPasswords>({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const id = currentUser?.id ?? user?.id;
      if (!id) return;

      try {
        setFetchingUser(true);
        const userData = await userService.getById(id);
        if (!userData) throw new Error("User not found");

        setFullUserData(userData);
        setProfile({
          name: userData.name,
          email: userData.email,
          team: userData.team,
          type: userData.type,
        });
        if (userData.profilePicture) setPreviewUrl(resolveMediaUrl(userData.profilePicture) ?? "");
      } catch (error: any) {
        console.error("Failed to fetch user data:", error);
        setMessage({ type: "error", text: "Failed to load user data" });
      } finally {
        setFetchingUser(false);
      }
    };

    fetchUserData();
  }, [currentUser?.id, user?.id]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 10_000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PROFILE_PICTURE_BYTES) {
      setProfilePictureFile(null);
      e.target.value = "";
      setMessage({ type: "error", text: "Ảnh đại diện phải nhỏ hơn hoặc bằng 1 MB." });
      return;
    }
    setProfilePictureFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = currentUser?.id ?? user?.id;
    if (!id) return;

    setLoading(true);
    setMessage(null);

    try {
      let pictureUrl = fullUserData?.profilePicture;
      if (profilePictureFile) {
        pictureUrl = await userService.uploadProfilePicture(id, profilePictureFile);
      }

      const updatedUser = await userService.updateProfile(id, {
        ...profile,
        profilePicture: pictureUrl,
      });

      setFullUserData(updatedUser);
      saveUser({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setProfilePictureFile(null);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = currentUser?.email ?? user?.email;
    if (!email) {
      setMessage({ type: "error", text: "User email not found" });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    const passwordError = validateOnlyPassword(passwordForm.newPassword);
    if (passwordError) {
      setMessage({ type: "error", text: passwordError });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await userService.requestPasswordChange({
        email,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setMessage({
        type: "success",
        text:
          response.message ||
          "Confirmation email has been sent! Please check your inbox to complete password change.",
      });

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to request password change";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShow = (field: keyof ShowPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (fetchingUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading account...</p>
        </div>
      </div>
    );
  }

  const tabs: { id: ActiveTab; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", shortLabel: "Profile", icon: <User className="w-4 h-4" /> },
    { id: "bdc-hub", label: "BDC Hub Public Portfolio", shortLabel: "Portfolio", icon: <Globe className="w-4 h-4" /> },
    { id: "mcp-keys", label: "MCP AI Keys", shortLabel: "MCP Keys", icon: <Cpu className="w-4 h-4" /> },
    { id: "password", label: "Password", shortLabel: "Password", icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8" id="myaccount-page">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">
            My Account
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
            Manage your profile, public portfolio, MCP API keys, and account settings
          </p>
        </div>

        {/* Message */}
        <MessageAlert message={message} />

        {/* Tabs - scrollable on mobile */}
        <div
          className="flex gap-0.5 mb-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0"
          id="myaccount-tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMessage(null);
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 font-medium text-xs sm:text-sm transition-all relative whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-t-lg"
              }`}
            >
              {tab.icon}
              {/* Short label on mobile, full label on sm+ */}
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "profile" && (
          <ProfileTab
            profile={profile}
            fullUserData={fullUserData}
            previewUrl={previewUrl}
            loading={loading}
            onProfileChange={setProfile}
            onFileChange={handleProfilePictureChange}
            onSubmit={handleUpdateProfile}
          />
        )}

        {activeTab === "bdc-hub" && (
          <BdcHubConfigTab />
        )}

        {activeTab === "mcp-keys" && (
          <McpApiKeyTab />
        )}

        {activeTab === "password" && (
          <PasswordTab
            passwordForm={passwordForm}
            showPasswords={showPasswords}
            loading={loading}
            onFormChange={setPasswordForm}
            onToggleShow={handleToggleShow}
            onSubmit={handleChangePassword}
          />
        )}

        {/* Stats - always visible */}
        <AccountStats fullUserData={fullUserData} />
      </div>
    </div>
  );
};

export default MyAccountPage;
