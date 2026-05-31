"use client";

import React, { useState } from "react";
import { 
  FlaskConical, 
  Search, 
  Code2, 
  Database, 
  Cpu, 
  BookOpen, 
  ChevronRight, 
  Loader2, 
  RefreshCw,
  CheckCircle2,
  Lock
} from "lucide-react";
import { useLabs } from "@/hooks/useLabs";
import { useAuth } from "@/hooks/useAuth";
import type { LabType, LabLevel } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";

export default function LabsPage() {
  const { user, isAdmin, isManager } = useAuth();
  const canManage = isAdmin || isManager || user?.role === "ROLE_TEACHER";

  const {
    labs,
    loading,
    enrollingMap,
    filters,
    setFilters,
    loadLabs,
    enroll,
    isEnrolled,
  } = useLabs();

  const [searchVal, setSearchVal] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchVal }));
  };

  const handleLevelChange = (level: string) => {
    setFilters((prev) => ({ ...prev, level }));
  };

  const handleTypeChange = (lab_type: string) => {
    setFilters((prev) => ({ ...prev, lab_type }));
  };

  const handleEnroll = async (labId: number) => {
    const success = await enroll(labId);
    if (success) {
      toast.success("Enrolled in virtual lab successfully!");
    } else {
      toast.error("Failed to enroll in lab. Please try again.");
    }
  };

  // Helper to resolve lab type badges
  const getLabTypeConfig = (type: LabType) => {
    switch (type) {
      case "CODING":
        return { icon: Code2, label: "Coding Lab", color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60" };
      case "DATABASE":
        return { icon: Database, label: "SQL Lab", color: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/60" };
      case "HPC":
        return { icon: Cpu, label: "HPC Cluster", color: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/60" };
      case "WORKSPACE":
        return { icon: FlaskConical, label: "Workspace IDE", color: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/60" };
      default:
        return { icon: BookOpen, label: type, color: "bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800" };
    }
  };

  // Helper to resolve difficulty badges
  const getLevelConfig = (level: LabLevel) => {
    switch (level) {
      case "BEGINNER":
        return { label: "Beginner", style: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" };
      case "INTERMEDIATE":
        return { label: "Intermediate", style: "bg-blue-100/70 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400" };
      case "ADVANCED":
        return { label: "Advanced", style: "bg-red-100/70 dark:bg-red-950/30 text-red-600 dark:text-red-400" };
      default:
        return { label: "All Levels", style: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" };
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8" id="labs-page">
      <div className="max-w-[1400px] mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-md active:scale-95 transition-all">
              <FlaskConical className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">
                Virtual Lab
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                Explore hands-on programming, database sandboxes, and HPC jobs.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {canManage && (
              <Link
                href="/labs/manage"
                className="flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700
                           rounded-xl px-4 py-2.5 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
              >
                Manage Labs
              </Link>
            )}
            <button
              onClick={loadLabs}
              className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400
                         hover:text-slate-800 dark:hover:text-slate-100
                         hover:bg-slate-100 dark:hover:bg-slate-800
                         border border-slate-200 dark:border-slate-700
                         rounded-xl px-4 py-2.5 shadow-sm active:scale-95 transition-all duration-200"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <input
                type="text"
                placeholder="Search labs by title or description..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                           bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                           focus:bg-white dark:focus:bg-slate-900
                           placeholder:text-slate-400 dark:placeholder:text-slate-500
                           focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                           transition-all text-sm outline-none"
              />
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            </form>

            {/* Type Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTypeChange("")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                  filters.lab_type === ""
                    ? "bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 border-transparent"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
              >
                All Types
              </button>
              {(["CODING", "DATABASE", "WORKSPACE", "HPC"] as LabType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                    filters.lab_type === type
                      ? "bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 border-transparent"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {getLabTypeConfig(type).label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Levels & Categories */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1.5 mr-2">Difficulty:</span>
              <button
                onClick={() => handleLevelChange("")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                  filters.level === ""
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                }`}
              >
                All
              </button>
              {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as LabLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => handleLevelChange(level)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                    filters.level === level
                      ? "bg-blue-600 text-white"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {getLevelConfig(level).label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Labs Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Loading labs catalog...</p>
          </div>
        ) : labs.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <FlaskConical className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-slate-900 dark:text-slate-100 font-bold mb-1">No Labs Found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              We couldn&apos;t find any labs matching your filters. Try clearing filters or try a different search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labs.map((lab) => {
              const enrolled = isEnrolled(lab.id);
              const typeConfig = getLabTypeConfig(lab.labType);
              const levelConfig = getLevelConfig(lab.level);
              const IconComp = typeConfig.icon;

              return (
                <div 
                  key={lab.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                             p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300
                             flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Badge line */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${typeConfig.color}`}>
                        <IconComp size={12} />
                        {typeConfig.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${levelConfig.style}`}>
                        {levelConfig.label}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {lab.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mt-1.5">
                        {lab.description || "No description provided."}
                      </p>
                    </div>

                    {/* Category */}
                    {lab.category && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                        <BookOpen size={12} />
                        <span>Category: {lab.category}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="border-t border-slate-100 dark:border-slate-800 mt-6 pt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      Duration: {lab.maxSessionDurationMin} mins
                    </span>

                    {enrolled ? (
                      <Link
                        href={`/labs/${lab.id}`}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold
                                   rounded-xl px-4 py-2 shadow-sm text-xs active:scale-95 transition-all duration-200"
                      >
                        <CheckCircle2 size={13} />
                        Enter Lab
                        <ChevronRight size={13} />
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleEnroll(lab.id)}
                        disabled={enrollingMap[lab.id]}
                        className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700
                                   text-slate-700 dark:text-slate-300 font-semibold rounded-xl px-4 py-2 text-xs
                                   active:scale-95 transition-all duration-200 disabled:opacity-50"
                      >
                        {enrollingMap[lab.id] ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Lock size={12} />
                        )}
                        Enroll Lab
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
