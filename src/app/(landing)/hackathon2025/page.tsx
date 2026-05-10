"use client";

import React from 'react';
import { hackathon2025Data } from '@/data/event/datahackathon2025';
import EventHero from '@/components/events/EventHero';
import EventTimeline from '@/components/events/EventTimeline';
import EventDetails from '@/components/events/EventDetails';
import EventRegistration from '@/components/events/EventRegistration';

export default function EventPage() {
  const eventData = hackathon2025Data;

  return (
    <div className="w-full font-sans text-slate-800">
      <EventHero event={eventData} />
      <EventDetails event={eventData} />
      <EventTimeline timelines={eventData.timelines} />
      <EventRegistration event={eventData} />
    </div>
  );
}