import { latexApiClient } from "./latexApiClient";
import type {
  LatexProject,
  LatexFile,
  CompileJob,
  LatexTemplate,
  TexPackage,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "@/types";

class LatexService {
  // ─── Projects ─────────────────────────────────────────────────────────────

  async createProject(data: CreateProjectRequest) {
    const response = await latexApiClient.post("/projects", data);
    return response.data;
  }

  async getProjects(page: number = 1, limit: number = 10) {
    const response = await latexApiClient.get("/projects", {
      params: { page, limit },
    });
    return response.data;
  }

  async getProject(id: number) {
    const response = await latexApiClient.get(`/projects/${id}`);
    return response.data;
  }

  async updateProject(id: number, data: UpdateProjectRequest) {
    const response = await latexApiClient.put(`/projects/${id}`, data);
    return response.data;
  }

  async deleteProject(id: number) {
    const response = await latexApiClient.delete(`/projects/${id}`);
    return response.data;
  }

  // ─── Files ────────────────────────────────────────────────────────────────

  async getProjectFiles(projectId: number) {
    const response = await latexApiClient.get(`/projects/${projectId}/files`);
    return response.data;
  }

  async uploadFiles(projectId: number, files: File[]) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await latexApiClient.post(`/projects/${projectId}/files`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async uploadZip(projectId: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await latexApiClient.post(`/projects/${projectId}/files/upload-zip`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async getFileContent(projectId: number, fileId: number) {
    const response = await latexApiClient.get(`/projects/${projectId}/files/${fileId}`);
    return response.data;
  }

  async updateFileContent(projectId: number, fileId: number, content: string) {
    const response = await latexApiClient.put(`/projects/${projectId}/files/${fileId}`, {
      content,
    });
    return response.data;
  }

  async deleteFile(projectId: number, fileId: number) {
    const response = await latexApiClient.delete(`/projects/${projectId}/files/${fileId}`);
    return response.data;
  }

  // ─── Compilation ──────────────────────────────────────────────────────────

  async compile(projectId: number, compiler?: string) {
    const response = await latexApiClient.post(`/projects/${projectId}/compile`, {
      compiler,
    });
    return response.data;
  }

  async getCompileStatus(jobId: string) {
    const response = await latexApiClient.get(`/compile/jobs/${jobId}/status`);
    return response.data;
  }

  getCompilePdfUrl(jobId: string): string {
    return `/latexapiv1/compile/jobs/${jobId}/pdf`;
  }

  async getCompileLog(jobId: string) {
    const response = await latexApiClient.get(`/compile/jobs/${jobId}/log`);
    return response.data;
  }

  // ─── Templates & Packages ─────────────────────────────────────────────────

  async getTemplates() {
    const response = await latexApiClient.get("/templates");
    return response.data;
  }

  async getTemplate(id: string) {
    const response = await latexApiClient.get(`/templates/${id}`);
    return response.data;
  }

  async createFromTemplate(templateId: string, title: string) {
    const response = await latexApiClient.post(`/projects/from-template/${templateId}`, {
      title,
    });
    return response.data;
  }

  async searchPackages(query: string) {
    const response = await latexApiClient.get("/packages", {
      params: { q: query },
    });
    return response.data;
  }
}

export const latexService = new LatexService();
