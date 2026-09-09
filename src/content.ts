// =====================================================================
//  SITE CONTENT — this is the only file you need to edit to update text.
//  No UI, styling, or animation code lives here. Change a string, add an
//  item to a list, and the site updates itself. TypeScript will warn you
//  if an entry is missing a field.
// =====================================================================

/* ---------- Hero (Home section) ---------- */
export const hero = {
  // The name sits as a small byline here — the nav already carries it, so the
  // headline leads with the work instead.
  eyebrow: 'Nathan Tran',
  headline: 'I build things that see, learn, and scale.',
  tagline: 'CS at Georgia Tech — data engineering, applied AI, computer vision, and XR.',
}

/* ---------- Links (used by the Contact section) ---------- */
export const links = {
  email: 'nathangsu306@gmail.com',
  github: 'https://github.com/ntran306',
  linkedin: 'https://www.linkedin.com/in/ntran306/',
  resume: '/assets/resume.pdf',
}

/* ---------- About ---------- */
export interface Stat {
  /** Rendered before the number — e.g. '$'. Use '' for none. */
  prefix: string
  /** Counts up from 0 when the card scrolls into view. */
  value: number
  suffix: string
  label: string
}

export const about = {
  heading: 'About',
  // Short facts line shown between the photos and the bio.
  facts: ['Georgia Tech', 'CS + FinTech', 'Atlanta, GA'],
  // Shown on its own line under the facts — too long to sit in that chip row.
  concentration: 'Information Internetworks & Intelligence (AI)',
  bio: "I'm a Computer Science student at Georgia Tech minoring in FinTech, drawn to problems where a system has to see, decide, or scale. Lately that's meant mapping 12,000+ cloud resources as a data engineering intern at Georgia-Pacific, building VR training scenarios for construction safety research, and writing game-playing AI agents that reason under uncertainty. Outside class I'm part of VGDev and GT Swim Club, and I spend my free time on calisthenics, bouldering, MMA, piano, and video games. Always looking for the next thing to build.",
  // Impact stats — the number counts up when scrolled into view.
  stats: [
    { prefix: '', value: 4, suffix: '+', label: 'Years of coding experience' },
    { prefix: '', value: 2, suffix: '+', label: 'Years of AI applications' },
  ] satisfies Stat[],
  // ➕ Add up to 3 photos (paths under public/, e.g. '/assets/name.jpg'). Fewer
  // than 3 leaves the remaining diamond(s) as a placeholder.
  photos: [
    '/assets/photo1_sq.jpg',
    '/assets/photo2_sq.jpg',
    '/assets/photo3_sq.jpg',
  ],
}

/* ---------- Experience ---------- */
export interface Experience {
  title: string
  year: string
  text: string
  tags: string[]
  /** Optional company logo shown left of the title (path under public/, e.g.
   *  '/assets/logo-name.svg'). Omit it and the title sits on its own. */
  logo?: string
  /** How to keep the mark legible on the near-black card. Leave it off for a
   *  logo that already reads light on dark (a bright or mid-tone full-color
   *  mark on a transparent background).
   *  - 'invert' — flips a black / near-black single-color mark to white.
   *  - 'plate'  — sits the logo on a light rounded tile. Use it for a dark
   *    full-color mark, where inverting would wreck the brand colors, and for
   *    any logo that ships with a white background instead of transparency. */
  logoFit?: 'invert' | 'plate'
}

export const experience = {
  heading: 'Experience',
  subhead: "Where I've worked and what I've built.", // shown on mobile / reduced-motion
  scrollHint: 'Scroll to travel the timeline.', // shown under the pinned heading
  // ➕ Add a new experience: copy one block, edit it, drop it in (newest first).
  //    Add `logo:` to show a company mark beside the title.
  items: [
    {
      title: 'Georgia-Pacific — Data Engineering Intern',
      year: 'May – Aug 2026',
      text: 'Built an app catalog mapping dependencies across 200+ applications, and provisioned AWS infrastructure with Terraform to automate dependency and cost extraction across 12,000+ resources — surfacing $100,000+ in potential annual cloud savings.',
      tags: ['AWS', 'Terraform', 'Python'],
      logo: '/assets/logo-georgia-pacific.png',
      logoFit: 'plate',
    },
    {
      title: 'Autorobotics in Construction — Undergraduate Researcher',
      year: 'Aug 2025 – Present',
      text: 'Researching AI and VR for construction safety and training: 6+ interactive Unity scenarios with cross-platform OpenXR support across Meta Quest, SteamVR, and Oculus, holding 90+ FPS in PC-streamed builds.',
      tags: ['Unity', 'OpenXR', 'AI'],
      logo: '/assets/logo-vip.png',
      logoFit: 'plate',
    },
    {
      title: 'Viet Home Care LLC — Caregiver',
      year: 'Jan 2025 – Present',
      text: 'Providing in-home nursing support — diet monitoring, mobility assistance, and technological aid — alongside the companionship and reliable communication that keep clients comfortable and independent.',
      tags: ['Care', 'Communication'],
      logo: '/assets/logo-viet-home-care.png',
      logoFit: 'plate',
    },
  ] satisfies Experience[],
}

/* ---------- Projects ---------- */
export interface Project {
  title: string
  pill: string
  text: string
  tags: string[]
  /** Omit when there's nothing public to link — the button hides itself. */
  href?: string
  /** Optional image / gif / video shown beside the project. Videos (.mp4/.webm)
   *  autoplay muted; anything else renders as an <img>. Falls back to a
   *  placeholder when omitted. */
  media?: string
}
export interface ProjectCategory {
  name: string
  projects: Project[]
}

export const projects = {
  heading: 'Projects',
  subhead: 'Expand a category to explore.',
  // ➕ Add a project inside the matching category's `projects` list.
  //    The wheel shows exactly four categories (one per compass point).
  categories: [
    {
      name: 'AI & Algorithms',
      projects: [
        {
          title: 'RatFinder',
          pill: 'Tournament',
          text: 'A competitive game-playing agent for the ByteFight tournament that localizes a hidden target from noisy sensor data with a Bayesian belief filter. Rebuilt a greedy baseline as alpha-beta search with transposition caching, lifting win rate against the benchmark bot from 50% to 80%+ — top 30% of 192 teams.',
          tags: ['Python', 'Bayesian Inference', 'Alpha-Beta'],
          href: 'https://github.com/ntran306/Ratfinder3600',
        },
      ],
    },
    {
      name: 'Computer Vision',
      projects: [
        {
          title: 'FletchFlow',
          pill: 'Solo',
          text: 'A computer-vision archery game that uses MediaPipe hand tracking to nock, draw, and release a virtual bow. A 3-thread pipeline isolates 29 ms hand detection from the 60 FPS render loop so both hold full rate, with One Euro filtering and a debouncing gesture state machine keeping draw-and-release stable under hand jitter.',
          tags: ['Python', 'MediaPipe', 'OpenCV', 'moderngl'],
          href: 'https://github.com/ntran306/FletchFlow',
        },
      ],
    },
    {
      name: 'Web Development',
      projects: [
        {
          title: 'Tutortle',
          pill: 'Lead',
          text: 'Led end-to-end development of a location-based tutoring platform, improving tutor-student matching speed by 40%. Deployed 4+ APIs for real-time distance and travel-time estimates, and lifted session coordination 25% with in-app messaging.',
          tags: ['Full-Stack', 'REST APIs', 'Real-time'],
          href: 'https://github.com/ntran306/CollegeStudySite',
        },
        {
          title: 'BuzzedIn',
          pill: 'Django',
          text: 'A Django job-matching platform connecting Georgia Tech students with recruiters. Optimized database access to cut load time by 80%+, and integrated 5+ APIs that lifted engagement 30% through dynamic filtering and responsive UX.',
          tags: ['Django', 'PostgreSQL', 'REST APIs'],
          href: 'https://github.com/ntran306/GTJobSearch',
        },
      ],
    },
    {
      name: 'XR / VR Development',
      projects: [
        {
          title: 'Autorobotics in Construction',
          pill: 'Research',
          text: 'Undergraduate research into AI and VR for construction safety and education — 6+ interactive Unity scenarios, instructional VR for an AI-guided adaptive training platform, and cross-platform OpenXR support holding 90+ FPS in PC-streamed builds.',
          tags: ['Unity', 'OpenXR', 'C#', 'AI'],
        },
      ],
    },
  ] satisfies ProjectCategory[],
}

/* ---------- Skills ---------- */
export interface Skill {
  k: string
  v: string
}

export const skills = {
  heading: 'Skills',
  subhead: 'Technologies I work with.',
  items: [
    { k: 'Languages', v: 'Java • Python • C • C# • JavaScript • SQL • Lua • Assembly • HTML/CSS' },
    { k: 'Frameworks & Engines', v: 'Django • FastAPI • React • Unity • Unreal Engine' },
    { k: 'Libraries', v: 'MediaPipe • OpenCV • NumPy • pygame • moderngl • JAX • Flax • HuggingFace' },
    { k: 'Tools', v: 'AWS • Terraform • Docker • Git • GitHub • PostgreSQL • MySQL • Twilio • Blender' },
    { k: 'Concepts', v: 'Full-Stack • Backend • Frontend • REST APIs • CI/CD • Automation • Agile/Scrum • DevOps' },
  ] satisfies Skill[],
}

/* ---------- Contact ---------- */
export const contact = {
  heading: 'Contact',
  subhead: 'Always open to new opportunities',
  // The subject line of contact-form emails is prefixed with this.
  emailSubjectPrefix: 'nathanantran.com — ',
}
