"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventCard } from "@/components/dashboard/event/EventCard";
import { EventModal } from "@/components/dashboard/modals/EventModal";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { Search, Filter, Calendar, ArrowLeft, Plus } from "lucide-react";
import { EVENT_STATUSES } from "@/types";
import { useRouter } from "next/navigation";

export default function EventsPage() {
  const router = useRouter();
  const { isAdmin, checkAdminAccess, user } = useAuth();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("createdAt:desc");

  const {
    events,
    loading,
    modalOpen,
    modalMode,
    currentItem,
    setCurrentItem,
    openModal,
    closeModal,
    saveEvent,
    deleteEvent,
  } = useEvents();

  const handleOpenModal = (mode: "add" | "edit" | "view", item?: any) => {
    if (mode === "add" || mode === "edit") {
      if (!checkAdminAccess()) return;
    }
    openModal(mode, item);
  };

  const handleSaveEvent = async () => {
    if (!checkAdminAccess() || !user) return;
    try {
      await saveEvent(currentItem, user.id);
    } catch (error: any) {
      alert("Lỗi: " + error.message);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!checkAdminAccess("xóa")) return;
    try {
      await deleteEvent(id);
    } catch (error: any) {
      alert("Lỗi: " + error.message);
    }
  };

  // Filter and sort events
  const filteredEvents = events
    .filter((event) => {
      const matchesSearch =
        !searchKeyword ||
        event.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchKeyword.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || event.statusEvent === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const [field, order] = sortBy.split(":");
      const aValue =
        field === "createdAt"
          ? new Date(a.startTime || 0).getTime()
          : a.title;
      const bValue =
        field === "createdAt"
          ? new Date(b.startTime || 0).getTime()
          : b.title;
      return order === "desc"
        ? aValue > bValue ? -1 : 1
        : aValue > bValue ? 1 : -1;
    });

  return (
    <div
      className="min-h-screen bg-transparent p-3 sm:p-4 md:p-6 lg:p-8"
      id="events-page"
    >
      {/* Event Modal */}
      <EventModal
        open={modalOpen}
        mode={modalMode}
        event={currentItem}
        onOpenChange={closeModal}
        onChange={setCurrentItem}
        onSave={handleSaveEvent}
      />

      {/* Header */}
      <div className="mb-6 sm:mb-8" id="events-header">
        {/* Back button */}
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400
                     hover:text-slate-800 dark:hover:text-slate-100
                     hover:bg-slate-100 dark:hover:bg-slate-800
                     rounded-xl px-3 py-2 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại Dashboard
        </button>

        <div className="flex items-center justify-between">
          {/* Title block */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-2xl">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">
                Quản Lý Sự Kiện
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                Tất cả các sự kiện trong hệ thống ({filteredEvents.length})
              </p>
            </div>
          </div>

          {/* Add button — admin only */}
          {isAdmin && (
            <button
              onClick={() => handleOpenModal("add")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white
                         font-semibold px-5 py-2.5 rounded-xl shadow-sm
                         transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Thêm Sự Kiện
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 mb-6"
        id="events-search-filter"
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
            Bộ Lọc &amp; Tìm Kiếm
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="Tìm kiếm sự kiện..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3
                         text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600
                         bg-slate-50 dark:bg-slate-800
                         focus:bg-white dark:focus:bg-slate-900
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                         transition-all"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className="border border-slate-300 dark:border-slate-700 rounded-xl
                         bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                         focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              {EVENT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger
              className="border border-slate-300 dark:border-slate-700 rounded-xl
                         bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                         focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt:desc">Mới nhất</SelectItem>
              <SelectItem value="createdAt:asc">Cũ nhất</SelectItem>
              <SelectItem value="title:asc">Tên A-Z</SelectItem>
              <SelectItem value="title:desc">Tên Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events Grid */}
      <div id="events-grid">
        {loading ? (
          <LoadingState/>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
            <p className="text-slate-500 dark:text-slate-400">
              {searchKeyword || statusFilter !== "ALL"
                ? "Không tìm thấy sự kiện nào"
                : "Chưa có sự kiện nào"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isAdmin={isAdmin}
                onView={() => handleOpenModal("view", event)}
                onEdit={() => handleOpenModal("edit", event)}
                onDelete={() => {
                  if (confirm("Bạn có chắc muốn xóa sự kiện này?")) {
                    handleDeleteEvent(event.id);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}