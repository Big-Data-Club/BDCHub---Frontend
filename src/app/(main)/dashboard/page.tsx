"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { AnnouncementList } from "@/components/dashboard/announcement/AnnouncementList";
import { EventList } from "@/components/dashboard/event/EventList";
import { ShowMoreButton } from "@/components/dashboard/ShowMoreButton";
import { AnnouncementModal } from "@/components/dashboard/modals/AnnouncementModal";
import { EventModal } from "@/components/dashboard/modals/EventModal";
import { ModernCalendar as ViewCalendar } from "@/components/dashboard/calendar/Calendar";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { usePagination } from "@/hooks/usePagination";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAdmin, checkAdminAccess } = useAuth();

  const {
    announcements, loading: loadingAnnouncements,
    modalOpen: announcementModalOpen, modalMode: announcementModalMode,
    currentItem: currentAnnouncement, setCurrentItem: setCurrentAnnouncement,
    openModal: openAnnouncementModal, closeModal: closeAnnouncementModal,
    saveAnnouncement, deleteAnnouncement,
  } = useAnnouncements();

  const {
    visibleItems: visibleAnnouncements,
    hasMore: hasMoreAnnouncements,
    remaining: remainingAnnouncements,
    showMore: showMoreAnnouncements,
  } = usePagination(announcements, 4);

  const {
    events, loading: loadingEvents,
    modalOpen: eventModalOpen, modalMode: eventModalMode,
    currentItem: currentEvent, setCurrentItem: setCurrentEvent,
    openModal: openEventModal, closeModal: closeEventModal,
    saveEvent, deleteEvent,
  } = useEvents();

  const {
    visibleItems: visibleEvents,
    hasMore: hasMoreEvents,
    remaining: remainingEvents,
  } = usePagination(events, 4);

  const handleOpenAnnouncementModal = (mode: "add" | "edit" | "view", item?: any) => {
    if ((mode === "add" || mode === "edit") && !checkAdminAccess()) return;
    openAnnouncementModal(mode, item);
  };

  const handleSaveAnnouncement = async () => {
    if (!checkAdminAccess()) return;
    try { await saveAnnouncement(currentAnnouncement); }
    catch (e: any) { alert("Lỗi: " + e.message); }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!checkAdminAccess("xóa")) return;
    try { await deleteAnnouncement(id); }
    catch (e: any) { alert("Lỗi: " + e.message); }
  };

  const handleOpenEventModal = (mode: "add" | "edit" | "view", item?: any) => {
    if ((mode === "add" || mode === "edit") && !checkAdminAccess()) return;
    openEventModal(mode, item);
  };

  const handleSaveEvent = async () => {
    if (!checkAdminAccess() || !user) return;
    try { await saveEvent(currentEvent, user.id); }
    catch (e: any) { alert("Lỗi: " + e.message); }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!checkAdminAccess("xóa")) return;
    try { await deleteEvent(id); }
    catch (e: any) { alert("Lỗi: " + e.message); }
  };

  return (
    <>
      <AnnouncementModal
        open={announcementModalOpen}
        mode={announcementModalMode}
        announcement={currentAnnouncement}
        onOpenChange={closeAnnouncementModal}
        onChange={setCurrentAnnouncement}
        onSave={handleSaveAnnouncement}
      />
      <EventModal
        open={eventModalOpen}
        mode={eventModalMode}
        event={currentEvent}
        onOpenChange={closeEventModal}
        onChange={setCurrentEvent}
        onSave={handleSaveEvent}
      />

      <div className="space-y-10">
        <DashboardHeader />

        {/* Stats + Calendar */}
        <div className="flex flex-col sm:flex-row gap-6 w-full">
          <StatsCards eventsCount={events.length} />
          <div className="flex-1 min-w-0">
            <ViewCalendar />
          </div>
        </div>

        {/* Announcements */}
        <section>
          <SectionHeader
            icon="📢"
            title="Thông Báo"
            description="Các thông báo quan trọng và cập nhật mới nhất"
            showAddButton={isAdmin}
            onAdd={() => handleOpenAnnouncementModal("add")}
            addButtonText="Thêm thông báo"
          />
          <AnnouncementList
            announcements={visibleAnnouncements}
            loading={loadingAnnouncements}
            isAdmin={isAdmin}
            onView={(item) => handleOpenAnnouncementModal("view", item)}
            onEdit={(item) => handleOpenAnnouncementModal("edit", item)}
            onDelete={handleDeleteAnnouncement}
          />
          {hasMoreAnnouncements && (
            <ShowMoreButton
              onClick={showMoreAnnouncements}
              remaining={remainingAnnouncements}
              variant="announcement"
            />
          )}
        </section>

        {/* Events */}
        <section>
          <SectionHeader
            icon="🎉"
            title="Sự Kiện"
            description="Các sự kiện sắp diễn ra và đang diễn ra"
            showAddButton={isAdmin}
            onAdd={() => handleOpenEventModal("add")}
            addButtonText="Thêm sự kiện"
          />
          <EventList
            events={visibleEvents}
            loading={loadingEvents}
            isAdmin={isAdmin}
            onView={(item) => handleOpenEventModal("view", item)}
            onEdit={(item) => handleOpenEventModal("edit", item)}
            onDelete={handleDeleteEvent}
          />
          {hasMoreEvents && (
            <ShowMoreButton
              onClick={() => router.push("/events")}
              remaining={remainingEvents}
              variant="event"
              customText="Xem tất cả sự kiện"
            />
          )}
        </section>
      </div>
    </>
  );
}