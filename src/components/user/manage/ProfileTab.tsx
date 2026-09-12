import { User, Mail, Tag, Users, Save, Loader2, Bell } from "lucide-react";
import { UpdateProfileRequest, UserResponse } from "@/services/auth/userService";
import AvatarUpload from "./AvatarUpload";

interface ProfileTabProps {
  profile: UpdateProfileRequest;
  fullUserData: UserResponse | null;
  previewUrl: string;
  loading: boolean;
  onProfileChange: (updated: UpdateProfileRequest) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const inputClass =
  "w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 " +
  "text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 " +
  "bg-slate-50 dark:bg-slate-800 " +
  "focus:bg-white dark:focus:bg-slate-900 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 " +
  "transition-all";

const disabledInputClass =
  "w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 " +
  "text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed";

const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2";

export default function ProfileTab({
  profile,
  fullUserData,
  previewUrl,
  loading,
  onProfileChange,
  onFileChange,
  onSubmit,
}: ProfileTabProps) {
  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6"
      id="myaccount-profile-tab"
    >
      <form onSubmit={onSubmit}>
        {/* Avatar */}
        <AvatarUpload
          previewUrl={previewUrl}
          fullUserData={fullUserData}
          onFileChange={onFileChange}
        />

        {/* Fields */}
        <div className="space-y-5">
          {/* Full Name */}
          <div>
            <label className={labelClass}>
              <User className="w-4 h-4 inline-block mr-1.5 text-slate-400" />
              Full Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onProfileChange({ ...profile, name: e.target.value })}
              className={inputClass}
              required
              placeholder="Your full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>
              <Mail className="w-4 h-4 inline-block mr-1.5 text-slate-400" />
              Email Address
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => onProfileChange({ ...profile, email: e.target.value })}
              className={inputClass}
              required
              placeholder="your@email.com"
            />
          </div>

          {/* MSSV - read-only */}
          <div>
            <label className={labelClass}>
              <Tag className="w-4 h-4 inline-block mr-1.5 text-slate-400" />
              MSSV
            </label>
            <input
              type="text"
              value={fullUserData?.code || ""}
              className={disabledInputClass}
              disabled
            />
          </div>

          {/* Team + Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>
                <Users className="w-4 h-4 inline-block mr-1.5 text-slate-400" />
                Team
              </label>
              <input
                type="text"
                value={profile.team}
                className={disabledInputClass}
                disabled
              />
            </div>
            <div>
              <label className={labelClass}>
                <Tag className="w-4 h-4 inline-block mr-1.5 text-slate-400" />
                Sinh viên
              </label>
              <input
                type="text"
                value={profile.type}
                className={disabledInputClass}
                disabled
              />
            </div>
          </div>

          {/* Email Notification Settings */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-amber-500" />
              Cài đặt thông báo qua Email
            </label>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 transition-colors">
              <input
                type="checkbox"
                id="emailNotificationsEnabled"
                checked={profile.emailNotificationsEnabled !== false}
                onChange={(e) =>
                  onProfileChange({
                    ...profile,
                    emailNotificationsEnabled: e.target.checked,
                  })
                }
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="emailNotificationsEnabled"
                className="text-sm cursor-pointer select-none"
              >
                <span className="font-medium text-slate-900 dark:text-slate-100 block">
                  Nhận email thông báo &amp; nhắc nhở học tập cá nhân hóa
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block leading-relaxed">
                  Bao gồm cảnh báo lỗ hổng kiến thức cần ôn luyện, nhắc nhở khi lâu ngày chưa vào học, và gợi ý học tập tự động từ BDC Hub. Bỏ chọn nếu bạn không muốn nhận các email này.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-3 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
