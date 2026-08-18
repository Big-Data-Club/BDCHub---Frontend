import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  Trophy,
  Dot,
  FlaskConical,
  GraduationCap,
  BookOpen,
  MessageSquare,
} from "lucide-react";

export const sidebarSections = [
  {
    title: "Main Menu",
    links: [
      { label: "Dashboard",       route: "/dashboard",   icon: LayoutDashboard, iconColor: "text-blue-500" },
      { label: "Users",           route: "/users",        icon: Users,           iconColor: "text-blue-500" },
      { label: "Events",          route: "/events",       icon: Calendar,        iconColor: "text-blue-500" },
      { label: "Tasks",           route: "/tasks",        icon: ClipboardList,   iconColor: "text-blue-500" },
      { label: "Leaderboard",     route: "/leaderboard",  icon: Trophy,          iconColor: "text-blue-500" },
      { label: "BDCourse",        route: "/lms",          icon: GraduationCap,   iconColor: "text-blue-500" },
      { label: "Virtual Lab",     route: "/labs",         icon: FlaskConical,    iconColor: "text-blue-500" },
      { label: "Chat",            route: "/chat",         icon: MessageSquare,   iconColor: "text-blue-500" },
    ],
  },
  {
    title: "Competition",
    links: [
      { label: "Data Hackathon", route: "/hackathon2025", icon: Dot, iconColor: "text-blue-500" },
      { label: "HCMUT HPC School", route: "https://hpcc.hcmut.edu.vn/hpc-school", icon: GraduationCap, iconColor: "text-blue-500" },
    ],
  },
  {
    title: "Hướng dẫn sử dụng",
    links: [
      { label: "Hướng dẫn Học viên", route: "/guide/student", icon: BookOpen, iconColor: "text-blue-500" },
      { label: "Hướng dẫn Giảng viên", route: "/guide/instructor", icon: GraduationCap, iconColor: "text-blue-500" },
    ],
  },
];
