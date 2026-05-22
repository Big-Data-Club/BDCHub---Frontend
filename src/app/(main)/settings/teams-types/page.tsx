import React from "react";
import TeamsTypesManager from "@/components/admin/TeamsTypesManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teams & Types Management | Big Data Club",
  description: "Configure system user divisions, club teams, and database lookup values.",
};

export default function TeamsTypesPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1200px] mx-auto">
        <TeamsTypesManager />
      </div>
    </div>
  );
}
