"use client";

import { FeaturedProjectsList } from "./FeaturedProjectsList";
import { PublicationsList } from "./PublicationsList";

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
        <FeaturedProjectsList />
        <PublicationsList />
      </div>
    </section>
  );
}
