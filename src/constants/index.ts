import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  Trophy,
  Dot,
} from "lucide-react";
import bdclogo from "@/assets/bdclogo.png";

// ─── API ──────────────────────────────────────────────────────────────────────

export const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || "http://localhost:8080/apiv1";

// ─── Auth / Storage ───────────────────────────────────────────────────────────

export const AUTH_COOKIE_NAME = "authToken";
export const USER_STORAGE_KEY = "currentUser";

// ─── UI ───────────────────────────────────────────────────────────────────────

export const LogoIcon = bdclogo;

export const sidebarSections = [
  {
    title: "Main Menu",
    links: [
      { label: "Dashboard",       route: "/dashboard",   icon: LayoutDashboard, iconColor: "text-blue-500" },
      { label: "Users",           route: "/users",        icon: Users,           iconColor: "text-blue-500" },
      { label: "Events",          route: "/events",       icon: Calendar,        iconColor: "text-blue-500" },
      { label: "Tasks",           route: "/tasks",        icon: ClipboardList,   iconColor: "text-blue-500" },
      { label: "Leaderboard",     route: "/leaderboard",  icon: Trophy,          iconColor: "text-blue-500" },
      { label: "Shared Knowledge",route: "/lms",          icon: Trophy,          iconColor: "text-blue-500" },
    ],
  },
  {
    title: "Competition",
    links: [
      { label: "Data Hackathon", route: "/hackathon2025", icon: Dot, iconColor: "text-blue-500" },
    ],
  },
];

// ─── Misc ─────────────────────────────────────────────────────────────────────

export const defaultValues = {
  title: "",
  aspectRatio: "",
  color: "",
  prompt: "",
  publicId: "",
};

export const creditFee = -1;