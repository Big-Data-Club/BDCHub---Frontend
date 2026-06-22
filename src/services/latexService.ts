import { latexApiClient } from "./latexApiClient";
import type { CreateProjectRequest, UpdateProjectRequest } from "@/types";

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

  getCompilePdfUrl(jobId: string, token?: string | null): string {
    const baseUrl = `/latexapiv1/compile/jobs/${jobId}/pdf`;
    return token ? `${baseUrl}?token=${token}` : baseUrl;
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

  // ─── Collaborators ────────────────────────────────────────────────────────

  async addCollaborator(projectId: number, email: string, role: string) {
    const response = await latexApiClient.post(`/projects/${projectId}/collaborators`, { email, role });
    return response.data;
  }

  async listCollaborators(projectId: number) {
    const response = await latexApiClient.get(`/projects/${projectId}/collaborators`);
    return response.data;
  }

  async updateCollaboratorRole(projectId: number, userId: number, role: string) {
    const response = await latexApiClient.put(`/projects/${projectId}/collaborators/${userId}`, { role });
    return response.data;
  }

  async removeCollaborator(projectId: number, userId: number) {
    const response = await latexApiClient.delete(`/projects/${projectId}/collaborators/${userId}`);
    return response.data;
  }

  // ─── Comments ─────────────────────────────────────────────────────────────

  async createComment(
    projectId: number,
    data: {
      file_id: number;
      content: string;
      selection_start?: number;
      selection_end?: number;
      selected_text?: string;
      parent_id?: number;
    }
  ) {
    const response = await latexApiClient.post(`/projects/${projectId}/comments`, data);
    return response.data;
  }

  async listProjectComments(projectId: number) {
    const response = await latexApiClient.get(`/projects/${projectId}/comments`);
    return response.data;
  }

  async listFileComments(projectId: number, fileId: number) {
    const response = await latexApiClient.get(`/projects/${projectId}/files/${fileId}/comments`);
    return response.data;
  }

  async updateComment(projectId: number, commentId: number, content: string) {
    const response = await latexApiClient.put(`/projects/${projectId}/comments/${commentId}`, { content });
    return response.data;
  }

  async deleteComment(projectId: number, commentId: number) {
    const response = await latexApiClient.delete(`/projects/${projectId}/comments/${commentId}`);
    return response.data;
  }

  async resolveComment(projectId: number, commentId: number) {
    const response = await latexApiClient.post(`/projects/${projectId}/comments/${commentId}/resolve`);
    return response.data;
  }

  async unresolveComment(projectId: number, commentId: number) {
    const response = await latexApiClient.post(`/projects/${projectId}/comments/${commentId}/unresolve`);
    return response.data;
  }

  // ─── Share Links ──────────────────────────────────────────────────────────

  async createShareLink(projectId: number, role: string) {
    const response = await latexApiClient.post(`/projects/${projectId}/share-links`, { role });
    return response.data;
  }

  async listShareLinks(projectId: number) {
    const response = await latexApiClient.get(`/projects/${projectId}/share-links`);
    return response.data;
  }

  async deactivateShareLink(projectId: number, linkId: number) {
    const response = await latexApiClient.delete(`/projects/${projectId}/share-links/${linkId}`);
    return response.data;
  }

  async joinViaShareLink(token: string) {
    const response = await latexApiClient.post(`/share/join/${token}`);
    return response.data;
  }
}

export const latexService = new LatexService();
