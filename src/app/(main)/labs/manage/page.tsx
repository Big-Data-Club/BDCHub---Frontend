"use client";

import React, { useEffect, useState } from "react";
import { 
  FlaskConical, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  Eye,
  Calendar,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { labService, ListResponse } from "@/services/labService";
import type { Lab } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LabManagePage() {
  const { user, isAdmin, isManager } = useAuth();
  const router = useRouter();
  
  const isAuthorized = isAdmin || isManager || user?.role === "ROLE_TEACHER";
  
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [publishingId, setPublishingId] = useState<number | null>(null);

  const fetchMyLabs = async () => {
    try {
      setLoading(true);
      const res = await labService.getMyLabs();
      // Go backend returns ListResponse with .items
      setLabs(res.items || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load your virtual labs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchMyLabs();
    } else if (user) {
      // If user is loaded but not authorized, we let the UI show unauthorized
      setLoading(false);
    }
  }, [user, isAuthorized]);

  const handlePublish = async (id: number) => {
    try {
      setPublishingId(id);
      await labService.publishLab(id);
      toast.success("Virtual lab published successfully!");
      fetchMyLabs();
    } catch (err) {
      toast.error("Failed to publish the lab.");
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this virtual lab? This action cannot be undone.")) {
      return;
    }
    try {
      setDeletingId(id);
      await labService.deleteLab(id);
      toast.success("Virtual lab deleted successfully!");
      setLabs((prev) => prev.filter((lab) => lab.id !== id));
    } catch (err) {
      toast.error("Failed to delete the lab.");
    } finally {
      setDeletingId(null);
    }
  };

  // If auth is still loading, show loading screen
  if (!user && loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
        <p className="text-slate-500 dark:text-slate-400 text-sm">Verifying authorization...</p>
      </div>
    );
  }

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
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8" id="lab-manage-dashboard">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Navigation Breadcrumb & Header */}
        <div className="flex flex-col gap-4">
          <Link
            href="/labs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit"
          >
            <ArrowLeft size={12} />
            Back to Lab Catalog
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-slate-900 dark:bg-slate-50 p-3 rounded-2xl shadow-md text-white dark:text-slate-900">
                <FlaskConical className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">
                  Lab Management Panel
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                  Create, configure, and publish virtual learning containers and test challenges.
                </p>
              </div>
            </div>

            <Link
              href="/labs/manage/create"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700
                         rounded-xl px-5 py-3 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
            >
              <Plus size={16} />
              Create Virtual Lab
            </Link>
          </div>
        </div>

        {/* Labs List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Loading your virtual labs...</p>
          </div>
        ) : labs.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-5">
            <div className="w-16 h-16 bg-slate-55 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400 dark:text-slate-600">
              <FlaskConical className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-slate-900 dark:text-slate-100 font-bold text-lg">No labs created yet</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Get started by creating your first coding challenges, SQL exercises, or interactive terminal environments.
              </p>
            </div>
            <Link
              href="/labs/manage/create"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-4 py-2.5 shadow active:scale-95 transition-all"
            >
              <Plus size={15} />
              Create First Lab
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Lab Details</th>
                    <th className="px-6 py-4.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-4.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-4.5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800/80">
                  {labs.map((lab) => (
                    <tr 
                      key={lab.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                onClick={() => router.push(`/labs/manage/${lab.id}`)}>
                            {lab.title}
                          </span>
                          <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 max-w-sm">
                            {lab.description || "No description provided."}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {lab.labType}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {lab.status === "PUBLISHED" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/60">
                            <CheckCircle2 size={10} />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-250 dark:border-amber-900/60">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {lab.level}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar size={12} />
                          {lab.createdAt ? new Date(lab.createdAt).toLocaleDateString() : "Just now"}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/labs/${lab.id}`)}
                            title="Preview Lab"
                            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-90"
                          >
                            <Eye size={15} />
                          </button>
                          
                          {lab.status === "DRAFT" && (
                            <button
                              onClick={() => handlePublish(lab.id)}
                              disabled={publishingId === lab.id}
                              title="Publish Lab"
                              className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-all active:scale-90 disabled:opacity-50"
                            >
                              {publishingId === lab.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 size={15} />
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => router.push(`/labs/manage/${lab.id}`)}
                            title="Edit Lab"
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-all active:scale-90"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            onClick={() => handleDelete(lab.id)}
                            disabled={deletingId === lab.id}
                            title="Delete Lab"
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all active:scale-90 disabled:opacity-50"
                          >
                            {deletingId === lab.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
