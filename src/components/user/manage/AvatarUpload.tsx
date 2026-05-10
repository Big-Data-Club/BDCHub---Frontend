import { Camera, User, Shield } from "lucide-react";
import SafeImage from "@/components/common/SafeImage";
import { UserResponse } from "@/services/userService";

interface AvatarUploadProps {
  previewUrl: string;
  fullUserData: UserResponse | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AvatarUpload({ previewUrl, fullUserData, onFileChange }: AvatarUploadProps) {
  return (
    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden ring-4 ring-slate-200 dark:ring-slate-700">
          {previewUrl ? (
            <SafeImage
              src={previewUrl}
              alt="Profile"
              className="w-full h-full object-cover"
              width={96}
              height={96}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
              <User className="w-10 h-10" />
            </div>
          )}
        </div>
        <label
          htmlFor="profilePicture"
          className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition-all active:scale-95 shadow-sm"
          title="Change profile picture"
        >
          <Camera className="w-4 h-4" />
          <input
            id="profilePicture"
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Info */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
          {fullUserData?.name || "—"}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          {fullUserData?.email}
        </p>
        <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
          <Shield className="w-3 h-3" />
          {fullUserData?.role}
        </span>
      </div>
    </div>
  );
}
