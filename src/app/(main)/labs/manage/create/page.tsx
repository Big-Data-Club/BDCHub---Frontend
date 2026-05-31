"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, 
  FlaskConical, 
  Loader2, 
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { labService } from "@/services/labService";
import type { LabType, LabLevel } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LabCreatePage() {
  const { user, isAdmin, isManager } = useAuth();
  const router = useRouter();
  
  const isAuthorized = isAdmin || isManager || user?.role === "ROLE_TEACHER";

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Programming",
    level: "BEGINNER" as LabLevel,
    labType: "CODING" as LabType,
    maxSessionDurationMin: 120,
    maxConcurrentSessions: 50,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxSessionDurationMin" || name === "maxConcurrentSessions"
        ? parseInt(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please provide a lab title.");
      return;
    }

    try {
      setSubmitting(true);
      // Go backend returns SuccessResponse with .data containing the created lab
      const res = await labService.createLab({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        labType: formData.labType,
        maxSessionDurationMin: formData.maxSessionDurationMin,
        maxConcurrentSessions: formData.maxConcurrentSessions,
        status: "DRAFT", // default to draft status
        thumbnailUrl: "",
        runtimeConfig: {},
        gradingConfig: formData.labType === "CODING" 
          ? { method: "test_cases" } 
          : formData.labType === "DATABASE" 
            ? { method: "sql_match" } 
            : {}
      });

      toast.success("Virtual lab created successfully!");
      // Redirect to edit details page immediately so they can configure sections and test cases
      if (res.data && res.data.id) {
        router.push(`/labs/manage/${res.data.id}`);
      } else {
        router.push("/labs/manage");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create virtual lab.");
    } finally {
      setSubmitting(false);
    }
  };

  // Guard Clause for unauthorized roles
  if (user && !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl max-w-md w-full text-center shadow-lg space-y-6">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">Access Denied</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">
              Only teachers, managers, and administrators have permission to access the Lab Management Panel.
            </p>
          </div>
          <Link
            href="/labs"
            className="inline-flex items-center justify-center w-full gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl active:scale-95 transition-all shadow-md"
          >
            <ArrowLeft size={16} />
            Back to Virtual Lab
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8" id="lab-create-page">
      <div className="max-w-[800px] mx-auto space-y-8">
        
        {/* Navigation Breadcrumb & Header */}
        <div className="flex flex-col gap-4">
          <Link
            href="/labs/manage"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit"
          >
            <ArrowLeft size={12} />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-md text-white">
              <FlaskConical className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">
                Create Virtual Lab
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                Set up a new virtual sandbox space, choose its environment parameters, and define learning steps.
              </p>
            </div>
          </div>
        </div>

        {/* Creation Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Lab Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="e.g. Intro to Python List Comprehension"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                           bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                           placeholder:text-slate-400 dark:placeholder:text-slate-500
                           focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                           transition-all text-sm outline-none"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Explain the lab objectives, sandbox parameters, or challenges..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                           bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                           placeholder:text-slate-400 dark:placeholder:text-slate-500
                           focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                           transition-all text-sm outline-none"
              />
            </div>

            {/* Category & Level Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  placeholder="e.g. Programming, Database, HPC"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                             bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                             placeholder:text-slate-400 dark:placeholder:text-slate-500
                             focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                             transition-all text-sm outline-none"
                />
              </div>

              {/* Difficulty Level */}
              <div className="space-y-2">
                <label htmlFor="level" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Difficulty Level
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                             bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                             focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                             transition-all text-sm outline-none cursor-pointer"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="ALL_LEVELS">All Levels</option>
                </select>
              </div>
            </div>

            {/* Lab Type Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lab Type */}
              <div className="space-y-2">
                <label htmlFor="labType" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Lab Type
                </label>
                <select
                  id="labType"
                  name="labType"
                  value={formData.labType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                             bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                             focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                             transition-all text-sm outline-none cursor-pointer"
                >
                  <option value="CODING">Coding Lab (Python, Java, Go...)</option>
                  <option value="DATABASE">SQL Database Sandbox (SQLite)</option>
                  <option value="WORKSPACE">Linux Workspace Console (ttyd terminal)</option>
                  <option value="HPC">HPC Job Submission (SLURM cluster)</option>
                </select>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal flex items-start gap-1 mt-1">
                  <HelpCircle size={12} className="inline mt-0.5 flex-shrink-0" />
                  The Lab Type determines the interactive editor workspace environment and runtime adapter allocated for students.
                </p>
              </div>

              {/* Max Session Duration */}
              <div className="space-y-2">
                <label htmlFor="maxSessionDurationMin" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Max Session Duration (Minutes)
                </label>
                <input
                  type="number"
                  id="maxSessionDurationMin"
                  name="maxSessionDurationMin"
                  min={10}
                  max={480}
                  value={formData.maxSessionDurationMin}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                             bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                             focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900
                             transition-all text-sm outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-150 dark:border-slate-800 pt-6">
              <Link
                href="/labs/manage"
                className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700
                           rounded-xl shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Lab"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
