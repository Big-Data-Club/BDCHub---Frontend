import { EventItem } from "@/types";
import { apiClient } from "./api";

export const eventService = {
  getAll: () => apiClient.get<EventItem[]>("/api/events"),
  
  create: (data: Omit<EventItem, "id">, userId: number | string) => 
    apiClient.post<EventItem>(`/api/events?userId=${userId}`, data),
  
  update: (id: number, data: Partial<EventItem>, userId: number | string) => 
    apiClient.put<EventItem>(`/api/events/${id}?userId=${userId}`, data),
  
  delete: (id: number) => 
    apiClient.delete(`/api/events/${id}`),
};