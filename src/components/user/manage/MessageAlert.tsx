import { AlertCircle, CheckCircle } from "lucide-react";

interface MessageAlertProps {
  message: { type: "success" | "error"; text: string } | null;
}

export default function MessageAlert({ message }: MessageAlertProps) {
  if (!message) return null;

  const isSuccess = message.type === "success";

  return (
    <div
      className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 ${
        isSuccess
          ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/40 dark:border-green-800 dark:text-green-300"
          : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-400"
      }`}
    >
      {isSuccess ? (
        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        <p className="font-medium text-sm">{message.text}</p>
        {isSuccess && message.text.includes("email") && (
          <p className="text-sm mt-1 opacity-80">
            Check your email inbox and click the confirmation link to complete the password change.
          </p>
        )}
      </div>
    </div>
  );
}
