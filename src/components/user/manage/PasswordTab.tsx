import { Eye, EyeOff, Send, Loader2 } from "lucide-react";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ShowPasswords {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

interface PasswordTabProps {
  passwordForm: PasswordForm;
  showPasswords: ShowPasswords;
  loading: boolean;
  onFormChange: (updated: PasswordForm) => void;
  onToggleShow: (field: keyof ShowPasswords) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const inputClass =
  "w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 pr-12 " +
  "text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 " +
  "bg-slate-50 dark:bg-slate-800 " +
  "focus:bg-white dark:focus:bg-slate-900 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 " +
  "transition-all";

const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2";

function PasswordField({
  label,
  value,
  show,
  placeholder,
  onChange,
  onToggle,
  hint,
  required,
}: {
  label: string;
  value: string;
  show: boolean;
  placeholder: string;
  onChange: (v: string) => void;
  onToggle: () => void;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {hint && <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5">{hint}</p>}
    </div>
  );
}

export default function PasswordTab({
  passwordForm,
  showPasswords,
  loading,
  onFormChange,
  onToggleShow,
  onSubmit,
}: PasswordTabProps) {
  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
      id="myaccount-password-tab"
    >
      {/* Info banner */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex gap-3">
        <Send className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1">
            Email Verification Required
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            For security reasons, we will send a confirmation email to verify your password change.
            Click the link in the email to complete the process.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="space-y-5">
          <PasswordField
            label="Current Password"
            value={passwordForm.currentPassword}
            show={showPasswords.current}
            placeholder="Enter your current password"
            onChange={(v) => onFormChange({ ...passwordForm, currentPassword: v })}
            onToggle={() => onToggleShow("current")}
            required
          />
          <PasswordField
            label="New Password"
            value={passwordForm.newPassword}
            show={showPasswords.new}
            placeholder="Enter your new password"
            onChange={(v) => onFormChange({ ...passwordForm, newPassword: v })}
            onToggle={() => onToggleShow("new")}
            hint="Must be at least 8 characters and include uppercase, lowercase, and numbers."
            required
          />
          <PasswordField
            label="Confirm New Password"
            value={passwordForm.confirmPassword}
            show={showPasswords.confirm}
            placeholder="Confirm your new password"
            onChange={(v) => onFormChange({ ...passwordForm, confirmPassword: v })}
            onToggle={() => onToggleShow("confirm")}
            required
          />
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
                Sending Confirmation Email...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Request Password Change
              </>
            )}
          </button>
        </div>

        {/* How it works */}
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            How it works
          </p>
          <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
            <li>Enter your current password and new password</li>
            <li>Click Request Password Change</li>
            <li>Check your email for a confirmation link</li>
            <li>Click the link to complete the password change</li>
          </ol>
        </div>
      </form>
    </div>
  );
}
