"use client";

import { useState, useEffect, useCallback } from "react";
import { latexService } from "@/services/latexService";
import type { Collaborator, ShareLink } from "@/types";

export function useCollaborators(projectId: number, userRole?: string) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollaborators = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await latexService.listCollaborators(projectId);
      if (res.success && res.data) {
        setCollaborators(res.data || []);
      }
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách cộng tác viên");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchShareLinks = useCallback(async () => {
    if (!projectId || (userRole !== "owner" && userRole !== "editor")) return;
    try {
      const res = await latexService.listShareLinks(projectId);
      if (res.success && res.data) {
        setShareLinks(res.data || []);
      }
    } catch {
      // Silent — viewer/reviewer won't have access
    }
  }, [projectId, userRole]);

  useEffect(() => {
    fetchCollaborators();
    fetchShareLinks();
  }, [fetchCollaborators, fetchShareLinks]);

  const addCollaborator = async (email: string, role: string) => {
    const res = await latexService.addCollaborator(projectId, email, role);
    if (res.success) {
      await fetchCollaborators();
      return res.data as Collaborator;
    }
    throw new Error(res.message || "Thêm cộng tác viên thất bại");
  };

  const removeCollaborator = async (userId: number) => {
    const res = await latexService.removeCollaborator(projectId, userId);
    if (res.success) {
      setCollaborators((prev) => prev.filter((c) => c.user_id !== userId));
    } else {
      throw new Error(res.message || "Xóa cộng tác viên thất bại");
    }
  };

  const updateRole = async (userId: number, role: string) => {
    const res = await latexService.updateCollaboratorRole(projectId, userId, role);
    if (res.success && res.data) {
      setCollaborators((prev) =>
        prev.map((c) => (c.user_id === userId ? { ...c, role: res.data.role } : c))
      );
    } else {
      throw new Error(res.message || "Cập nhật quyền thất bại");
    }
  };

  const createShareLink = async (role: string) => {
    const res = await latexService.createShareLink(projectId, role);
    if (res.success && res.data) {
      setShareLinks((prev) => [res.data as ShareLink, ...prev]);
      return res.data as ShareLink;
    }
    throw new Error(res.message || "Tạo liên kết chia sẻ thất bại");
  };

  const deactivateShareLink = async (linkId: number) => {
    const res = await latexService.deactivateShareLink(projectId, linkId);
    if (res.success) {
      setShareLinks((prev) =>
        prev.map((l) => (l.id === linkId ? { ...l, active: false } : l))
      );
    } else {
      throw new Error(res.message || "Vô hiệu hóa liên kết thất bại");
    }
  };

  return {
    collaborators,
    shareLinks,
    loading,
    error,
    addCollaborator,
    removeCollaborator,
    updateRole,
    createShareLink,
    deactivateShareLink,
    refresh: () => { fetchCollaborators(); fetchShareLinks(); },
  };
}
