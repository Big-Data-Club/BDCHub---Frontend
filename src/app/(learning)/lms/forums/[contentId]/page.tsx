"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import lmsService from "@/services/lmsService";
import ForumView from "@/components/lms/forum/ForumView";

export default function ForumPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = parseInt(params.contentId as string);
  
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    loadContent();
    loadUserRoles();
  }, [contentId]);

  const loadContent = async () => {
    try {
      const response = await lmsService.getContent(contentId);
      setContent(response?.data);
      
      // Verify it's a FORUM content
      if (response?.data?.type !== 'FORUM') {
        alert("Nội dung này không phải là diễn đàn");
        router.back();
      }
    } catch (error) {
      console.error("Error loading content:", error);
      alert("Không thể tải nội dung");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadUserRoles = async () => {
    try {
      const userRoles = await lmsService.getMyRoles();
      setRoles(userRoles || []);
    } catch (error) {
      console.error("Error loading roles:", error);
      setRoles([]);
    }
  };

  const isTeacherOrAdmin = roles.includes("TEACHER") || roles.includes("ADMIN");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-500">Không tìm thấy diễn đàn</p>
          <Button
            onClick={() => router.back()}
            className="mt-4"
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => router.back()}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại khóa học
        </Button>
        
        <div className="bg-white rounded-xl shadow-sm border p-6 dark:bg-slate-950/20">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 rounded-full text-sm font-semibold border border-purple-200 dark:border-purple-800">
              💬 DIỄN ĐÀN
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">{content.title}</h1>
          {content.description && (
            <p className="text-slate-600 dark:text-slate-400">{content.description}</p>
          )}
        </div>
      </div>

      {/* Forum Content */}
      <ForumView 
        contentId={contentId} 
        isTeacherOrAdmin={isTeacherOrAdmin}
      />
    </div>
  );
}