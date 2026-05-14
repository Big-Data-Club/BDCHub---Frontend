"use client";

import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Activities from "@/components/home/Activities";
import Projects from "@/components/home/Projects";
import Members from "@/components/home/Members";

export default function LandingPage() {
  return (
    <div className="w-full pb-12">
      <Hero />
      <About />
      <Activities />
      <Projects />
      <Members />
    </div>
  );
}