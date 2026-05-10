export type ActiveTab = "profile" | "password";

export type MessageState = { type: "success" | "error"; text: string } | null;

export type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ShowPasswords = {
  current: boolean;
  new: boolean;
  confirm: boolean;
};