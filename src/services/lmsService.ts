import { lmsApiClient } from "./lmsApiClient";

class LMSService {
  private rolesPromise: Promise<string[] | null> | null = null;
  private cachedRoles: string[] | null = null;
  private contentCache: Record<number, Promise<any> | undefined> = {};

  // ─── User ─────────────────────────────────────────────────────────────────

  async getMyRoles() {
    if (this.cachedRoles) {
      return this.cachedRoles;
    }
    if (this.rolesPromise) {
      return this.rolesPromise;
    }
    this.rolesPromise = lmsApiClient.get("/me/roles")
      .then(response => {
        this.cachedRoles = response.data?.data?.roles || [];
        this.rolesPromise = null;
        return this.cachedRoles;
      })
      .catch(err => {
        this.rolesPromise = null;
        throw err;
      });
    return this.rolesPromise;
  }

  clearRolesCache() {
    this.cachedRoles = null;
    this.rolesPromise = null;
  }

  // ─── Course ───────────────────────────────────────────────────────────────

  async createCourse(courseData: {
    title: string;
    description?: string;
    category?: string;
    level?: string;
    thumbnail_url?: string;
    org_id?: number;
    visibility?: "PUBLIC" | "ORG_ONLY";
  }) {
    const response = await lmsApiClient.post("/courses", courseData);
    return response.data;
  }

  async getCourse(courseId: number) {
    const response = await lmsApiClient.get(`/courses/${courseId}`);
    return response.data;
  }

  async updateCourse(
    courseId: number,
    updates: {
      title?: string;
      description?: string;
      category?: string;
      level?: string;
      thumbnail_url?: string;
      org_id?: number;
      visibility?: "PUBLIC" | "ORG_ONLY";
    }
  ) {
    const response = await lmsApiClient.put(`/courses/${courseId}`, updates);
    return response.data;
  }

  async deleteCourse(courseId: number) {
    const response = await lmsApiClient.delete(`/courses/${courseId}`);
    return response.data;
  }

  async publishCourse(courseId: number) {
    const response = await lmsApiClient.post(`/courses/${courseId}/publish`);
    return response.data;
  }

  async listMyCourses(params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }) {
    const response = await lmsApiClient.get("/courses/my", { params });
    return response.data;
  }

  async listPublishedCourses(params?: {
    category?: string;
    level?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }) {
    const response = await lmsApiClient.get("/courses", { params });
    return response.data?.data;
  }

  // ─── Section ──────────────────────────────────────────────────────────────

  async createSection(
    courseId: number,
    sectionData: { title: string; description?: string; order_index: number }
  ) {
    const response = await lmsApiClient.post(
      `/courses/${courseId}/sections`,
      sectionData
    );
    return response.data;
  }

  async getSection(sectionId: number) {
    const response = await lmsApiClient.get(`/sections/${sectionId}`);
    return response.data;
  }

  async listSections(courseId: number) {
    const response = await lmsApiClient.get(`/courses/${courseId}/sections`);
    return response.data;
  }

  async updateSection(
    sectionId: number,
    updates: {
      title?: string;
      description?: string;
      order_index?: number;
      is_published?: boolean;
    }
  ) {
    const response = await lmsApiClient.put(`/sections/${sectionId}`, updates);
    return response.data;
  }

  async deleteSection(sectionId: number) {
    const response = await lmsApiClient.delete(`/sections/${sectionId}`);
    return response.data;
  }

  // ─── Content ──────────────────────────────────────────────────────────────

  async createContent(
    sectionId: number,
    contentData: {
      type: "TEXT" | "VIDEO" | "DOCUMENT" | "IMAGE" | "QUIZ" | "FORUM" | "ANNOUNCEMENT";
      title: string;
      description?: string;
      order_index: number;
      metadata?: Record<string, any>;
      is_mandatory?: boolean;
    }
  ) {
    const response = await lmsApiClient.post(
      `/sections/${sectionId}/content`,
      contentData
    );
    return response.data;
  }

  async getContent(contentId: number) {
    if (this.contentCache[contentId]) {
      return this.contentCache[contentId];
    }
    this.contentCache[contentId] = lmsApiClient.get(`/content/${contentId}`)
      .then(response => response.data)
      .catch(err => {
        delete this.contentCache[contentId];
        throw err;
      });
    return this.contentCache[contentId];
  }

  async listContent(sectionId: number) {
    const response = await lmsApiClient.get(`/sections/${sectionId}/content`);
    return response.data;
  }

  async updateContent(
    contentId: number,
    updates: {
      title?: string;
      description?: string;
      order_index?: number;
      metadata?: Record<string, any>;
      is_published?: boolean;
      is_mandatory?: boolean;
    }
  ) {
    const response = await lmsApiClient.put(`/content/${contentId}`, updates);
    return response.data;
  }

  async deleteContent(contentId: number) {
    const response = await lmsApiClient.delete(`/content/${contentId}`);
    return response.data;
  }

  // ─── Enrollment ───────────────────────────────────────────────────────────

  async enrollCourse(courseId: number) {
    const response = await lmsApiClient.post("/enrollments", { course_id: courseId });
    return response.data;
  }

  async getMyEnrollments(status?: "WAITING" | "ACCEPTED" | "REJECTED") {
    const params = status ? { status } : {};
    const response = await lmsApiClient.get("/enrollments/my", { params });
    return response.data?.data;
  }

  async getCourseLearners(courseId: number, status?: "WAITING" | "ACCEPTED" | "REJECTED") {
    const params = status ? { status } : {};
    const response = await lmsApiClient.get(`/courses/${courseId}/learners`, { params });
    return response.data?.data;
  }

  async acceptEnrollment(enrollmentId: number, courseId: number) {
    const response = await lmsApiClient.put(`/enrollments/${enrollmentId}/accept`, {
      course_id: courseId,
    });
    return response.data;
  }

  async rejectEnrollment(enrollmentId: number, courseId: number) {
    const response = await lmsApiClient.put(`/enrollments/${enrollmentId}/reject`, {
      course_id: courseId,
    });
    return response.data;
  }

  async bulkEnroll(courseId: number, studentIds: number[]) {
    const response = await lmsApiClient.post(`/courses/${courseId}/bulk-enroll`, {
      student_ids: studentIds,
    });
    return response.data;
  }

  async cancelEnrollment(enrollmentId: number) {
    const response = await lmsApiClient.delete(`/enrollments/${enrollmentId}`);
    return response.data;
  }

  async triggerDocumentProcessing(contentId: number, courseId: number, nodeId?: number, fileUrl?: string) {
    const response = await lmsApiClient.post(`/content/${contentId}/process`, {
      course_id: courseId,
      node_id: nodeId,
      file_url: fileUrl,
    });
    return response.data;
  }

  // ─── Co-Teachers ───────────────────────────────────────────────────────────

  async addCoTeacher(courseId: number, userId: number) {
    const response = await lmsApiClient.post(`/courses/${courseId}/co-teachers`, {
      user_id: userId,
    });
    return response.data;
  }

  async removeCoTeacher(courseId: number, userId: number) {
    const response = await lmsApiClient.delete(`/courses/${courseId}/co-teachers/${userId}`);
    return response.data;
  }

  async getCoTeachers(courseId: number) {
    const response = await lmsApiClient.get(`/courses/${courseId}/co-teachers`);
    return response.data?.data;
  }

  async searchTeachers(query: string) {
    const response = await lmsApiClient.get("/users/teachers", { params: { q: query } });
    return response.data?.data;
  }
}

export const lmsService = new LMSService();
export default lmsService;