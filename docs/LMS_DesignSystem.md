# LMS Design System Reference

This document serves as the design system reference for the Learning Management System (LMS) module. It establishes the design language, color tokens, layout specifications, and micro-interaction behaviors starting from the **LMS Role Selection Page**.

---

## 1. Color Palette

The LMS system uses a dark-first, premium developer-oriented design system. It is fully responsive and supports both Light and Dark modes.

| Token | Light Mode | Dark Mode | Description |
|---|---|---|---|
| **Page BG** | `#F8FAFC` (`bg-slate-50`) | `#050B18` | Core background |
| **Card BG** | `#FFFFFF` (`bg-white`) | `#0F1E35` | Main card background container |
| **Hover BG** | `#F8FAFC` (`bg-slate-50/50`) | `#13233C` | Highlighted card interior hover background |
| **Accent Primary** | `#2563EB` (`bg-blue-600`) | `#06B6D4` (`cyan-500`) | Active button, focus, and role container accent |
| **Border Normal** | `#E2E8F0` (`border-slate-200`) | `rgba(59, 130, 246, 0.1)` (`border-blue-500/10`) | Default subtle borders |
| **Border Hover** | `rgba(37, 99, 235, 0.3)` (`border-blue-500/30`) | `rgba(37, 99, 235, 0.3)` | Card borders when hovered |
| **Text Heading** | `#0F172A` (`text-slate-900`) | `#FFFFFF` (`text-white`) | Primary titles and labels |
| **Text Body** | `#64748B` (`text-slate-500`) | `#94A3B8` (`text-slate-400`) | Descriptions and secondary text |

---

## 2. Animated Elements

### A. Moving Grid Background
The LMS utilizes a sliding graph paper style grid representing structured learning.
- **HTML Class**: `.bg-grid-paper`
- **Animation**: `.animate-grid-slide`
- **CSS Definition**:
```css
.bg-grid-paper {
  background-image: 
    linear-gradient(to right, rgba(11, 102, 162, 0.15) 1.5px, transparent 1.5px),
    linear-gradient(to bottom, rgba(11, 102, 162, 0.15) 1.5px, transparent 1.5px);
  background-size: 40px 40px;
}
:where(.dark) .bg-grid-paper {
  background-image: 
    linear-gradient(to right, rgba(169, 210, 240, 0.09) 1.5px, transparent 1.5px),
    linear-gradient(to bottom, rgba(169, 210, 240, 0.09) 1.5px, transparent 1.5px);
}
@keyframes grid-slide {
  from { background-position: 0 0; }
  to { background-position: 400px 400px; }
}
.animate-grid-slide {
  animation: grid-slide 25s linear infinite;
}
```

### B. Gradient Fades
To prevent the background grid from being overly distracting, it is masked with soft layout overlays:
- **Vertical Mask**: `bg-gradient-to-t from-slate-50 via-15% via-transparent via-85% to-slate-50` (or `dark:from-[#050B18]...`)
- **Horizontal Mask**: `bg-gradient-to-r from-slate-50 via-15% via-transparent via-85% to-slate-50` (or `dark:from-[#050B18]...`)

This keeps the center transparent (70% of screen) to expose the clear grid, while fading smoothly at the screen boundaries.

---

## 3. Interactive Components

### Role Selection Cards
The role cards use a 3D lift offset transition when hovered.

#### Structure
```tsx
<div className="relative group">
  {/* Underlay Offset Background */}
  <div className="absolute inset-0 bg-blue-600 dark:bg-cyan-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 translate-y-0 group-hover:translate-x-1.5 group-hover:translate-y-1.5" />

  {/* Main Card Element */}
  <button className="relative w-full h-full flex flex-col items-start bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl p-8 text-left transition-all duration-300 transform translate-x-0 translate-y-0 group-hover:-translate-x-1 group-hover:-translate-y-1 hover:border-blue-500/30 dark:hover:border-blue-500/30 dark:hover:bg-[#13233c] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 z-10">
    {/* Icon Container */}
    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-cyan-400 mb-6 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-cyan-500 dark:group-hover:text-slate-950 transition-all duration-300">
      <Icon className="w-6 h-6" />
    </div>
    
    {/* Content */}
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
      Title
    </h3>
    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
      Description
    </p>

    {/* CTA Indicator */}
    <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-cyan-400 mt-auto group-hover:gap-2.5 transition-all">
      <span>Action Title</span>
      <ArrowRight className="w-4 h-4" />
    </div>
  </button>
</div>
```

---

## 4. Typography & Spacing

To align with modern dashboard rhythms, follow these specifications:

- **Primary Title**: `text-3xl font-bold tracking-tight`
- **Section Heading / Card Header**: `text-lg font-semibold`
- **Body & Description**: `text-sm leading-relaxed`
- **Standard Card Padding**: `p-8`
- **Inner Gap Spacing**:
  - E.g. Icon to Heading: `mb-6`
  - Heading to Paragraph: `mb-2`
  - Paragraph to Action Link: `mb-6`
- **Responsive Layout**:
  - Mobile: Single column with `p-4` layout container.
  - Tablet: `grid md:grid-cols-2 gap-6`.
  - Desktop: `grid lg:grid-cols-3 gap-6 max-w-4xl mx-auto`.
