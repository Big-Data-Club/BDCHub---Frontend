import { useState, useEffect, useCallback } from "react";
import { latexService } from "@/services/latexService";
import type { LatexProject, CreateProjectRequest } from "@/types";

export function useLatexProjects() {
  const [projects, setProjects] = useState<LatexProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(9); // 9 items per page fits a 3x3 card grid nicely

  const fetchProjects = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await latexService.getProjects(pageNum, limit);
      if (res.success && res.data) {
        setProjects(res.data.items || res.data || []);
        if (res.data.pagination) {
          setTotal(res.data.pagination.total || 0);
        } else {
          setTotal((res.data.items || res.data || []).length);
        }
      }
    } catch (err) {
      console.error("Failed to fetch LaTeX projects:", err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchProjects(page);
  }, [page, fetchProjects]);

  const createProject = async (data: CreateProjectRequest) => {
    try {
      let res;
      if (data.template_id) {
        res = await latexService.createFromTemplate(data.template_id, data.title);
      } else {
        res = await latexService.createProject(data);
      }
      if (res.success) {
        await fetchProjects(page);
        return res.data;
      }
      throw new Error(res.message || "Failed to create project");
    } catch (err: any) {
      console.error("Failed to create project:", err);
      throw err;
    }
  };

  const deleteProject = async (id: number) => {
    try {
      const res = await latexService.deleteProject(id);
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
      } else {
        throw new Error(res.message || "Failed to delete project");
      }
    } catch (err: any) {
      console.error("Failed to delete project:", err);
      throw err;
    }
  };

  return {
    projects,
    loading,
    total,
    page,
    setPage,
    createProject,
    deleteProject,
    refresh: () => fetchProjects(page),
  };
}
