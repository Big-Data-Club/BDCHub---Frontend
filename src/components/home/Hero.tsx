"use client";

import { motion, Variants } from "framer-motion";
import { HeroTitle } from "./hero/HeroTitle";
import { HeroDescription } from "./hero/HeroDescription";
import { HeroActions } from "./hero/HeroActions";
import { HeroVisualCore } from "./hero/HeroVisualCore";
import { HeroStatsMobile } from "./hero/HeroStatsMobile";
import { ScrollIndicator } from "./hero/ScrollIndicator";

export interface HeroProps {
  totalStagger?: number;
  p?: number;
  yOffset?: number;
  duration?: number;
  ease?: [number, number, number, number];
  enableConfirm?: boolean;
  confirmInitialScale?: number;
  confirmDelay?: number;
  confirmDuration?: number;
  enableTitleFade?: boolean;
  titleFadeDuration?: number; // Dedicated fade duration control
  focusSection?: "all" | "title" | "description" | "actions" | "stats";
  descriptionDuration?: number;
  descriptionYOffset?: number;
  actionsDuration?: number;
  actionsYOffset?: number;
  statsDuration?: number;
  statsYOffset?: number;
  customTime?: number;
  titleText?: string;
}

export default function Hero({
  totalStagger = 0.55,
  p = 2.0, // Mặc định mũ 2 cho đồ thị S-Curve đối xứng
  yOffset = 40,
  duration = 0.35,
  ease = [0.1, 1, 0.5, 1.4],
  enableConfirm = true,
  confirmInitialScale = 0.85,
  confirmDelay = 1,
  confirmDuration = 0.35,
  enableTitleFade = true,
  titleFadeDuration = 0.25, // Snappy fade-in by default
  focusSection = "all",
  descriptionDuration = 0.6,
  descriptionYOffset = 15,
  actionsDuration = 0.6,
  actionsYOffset = 15,
  statsDuration = 0.6,
  statsYOffset = 15,
  customTime,
  titleText = "Big Data Club",
}: HeroProps = {}) {
  // Animation variants with staggered choreography
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <motion.section 
      id="hero" 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-28 pb-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* Left Column - Content & Action CTAs */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 w-full">
          
          {(focusSection === "all" || focusSection === "title") && (
            <HeroTitle
              titleText={titleText}
              enableConfirm={enableConfirm}
              confirmInitialScale={confirmInitialScale}
              confirmDelay={confirmDelay}
              confirmDuration={confirmDuration}
              enableTitleFade={enableTitleFade}
              titleFadeDuration={titleFadeDuration}
              totalStagger={totalStagger}
              p={p}
              yOffset={yOffset}
              duration={duration}
              ease={ease}
              customTime={customTime}
            />
          )}

          {(focusSection === "all" || focusSection === "description") && (
            <HeroDescription
              descriptionDuration={descriptionDuration}
              descriptionYOffset={descriptionYOffset}
              customTime={customTime}
            />
          )}
          
          {(focusSection === "all" || focusSection === "actions") && (
            <HeroActions
              actionsDuration={actionsDuration}
              actionsYOffset={actionsYOffset}
            />
          )}

          {/* Mobile Stats Fallback (visible under CTAs on mobile/tablet) */}
          {(focusSection === "all" || focusSection === "stats") && (
            <HeroStatsMobile
              statsDuration={statsDuration}
              statsYOffset={statsYOffset}
            />
          )}

        </div>

        {/* Right Column - Glowing Visual Core & Floating Glassmorphic Stats (Desktop Only) */}
        {(focusSection === "all" || focusSection === "stats") && (
          <HeroVisualCore
            statsDuration={statsDuration}
            statsYOffset={statsYOffset}
          />
        )}

        {/* Scroll indicator */}
        {(focusSection === "all" || focusSection === "actions") && (
          <ScrollIndicator
            actionsDuration={actionsDuration}
            actionsYOffset={actionsYOffset}
          />
        )}
      </div>
    </motion.section>
  );
}