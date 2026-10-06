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
  headline: 'I teach computers to see.',
  tagline: 'Third-year CS at Georgia Tech. Computer vision, XR, and the occasional video game.',
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
  bio: "I'm a third-year CS student at Georgia Tech. I like problems where a computer has to look at the real world and react to it, which is how I ended up in computer vision, XR, and games. I learn by building the thing, breaking it, and building it again. Outside class I model 3D art for VGDev and swim with GT Swim Club, and my free time goes to bouldering, calisthenics, MMA, piano, and trails. The last one was Tough Mudder. Whatever it is, I'm after the next adventure.",
  // Impact stats — the number counts up when scrolled into view. Counts of
  // work that exists, not years served: every one of these is checkable
  // against the Projects and Experience sections below.
  stats: [
    { prefix: '', value: 7, suffix: '', label: 'Projects built' },
    { prefix: '', value: 6, suffix: '+', label: 'VR scenarios' },
    { prefix: '', value: 2, suffix: '', label: 'Games with VGDev' },
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
  /** Optional image / gif / video shown beside the project — a local path
   *  under public/, or a full URL (the video demos are hosted on Cloudinary;
   *  see README). Videos (.mp4/.webm/.mov) autoplay muted; anything else
   *  renders as an <img>. Falls back to a placeholder when omitted.
   *  An array crossfades through the images on a timer (see SLIDE_MS in
   *  Projects.tsx) — for a project with screenshots but no demo video. */
  media?: string | string[]
  /** How the media fills its panel. Defaults to 'cover' — right for a
   *  screenshot or screen recording, which should bleed to the edges. Use
   *  'contain' for a logo or anything with its own margins, which cover would
   *  crop into. */
  mediaFit?: 'cover' | 'contain'
  /** The panel's own aspect ratio (width / height), matched to this media's
   *  real dimensions — e.g. a 960x402 video is 960/402. Defaults to 16/10 when
   *  omitted. Set this so the panel takes the shape of what's actually in it
   *  rather than a fixed box that crops a mismatched video/screenshot/logo. */
  mediaAspect?: number
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
      name: 'AI & Computer Vision',
      projects: [
        {
          title: 'RatFinder',
          pill: 'Tournament',
          text: 'A competitive game-playing agent for the ByteFight tournament that localizes a hidden target from noisy sensor data with a Bayesian belief filter. Rebuilt a greedy baseline as alpha-beta search with transposition caching, lifting win rate against the benchmark bot from 50% to 80%+ — top 30% of 192 teams.',
          tags: ['Python', 'Bayesian Inference', 'Alpha-Beta'],
          href: 'https://github.com/ntran306/Ratfinder3600',
          media: 'https://res.cloudinary.com/evfukudw/video/upload/v1789702113/ratfinder-demo.mp4',
          mediaAspect: 960 / 402,
        },
        {
          title: 'FletchFlow',
          pill: 'Solo',
          text: 'A computer-vision archery game that uses MediaPipe hand tracking to nock, draw, and release a virtual bow. A 3-thread pipeline isolates 29 ms hand detection from the 60 FPS render loop so both hold full rate, with One Euro filtering and a debouncing gesture state machine keeping draw-and-release stable under hand jitter.',
          tags: ['Python', 'MediaPipe', 'OpenCV', 'moderngl'],
          href: 'https://github.com/ntran306/FletchFlow',
          media: 'https://res.cloudinary.com/evfukudw/video/upload/v1789702113/fletchflow-demo.mp4',
          mediaAspect: 960 / 540,
        },
      ],
    },
    {
      name: 'Game Development',
      projects: [
        {
          title: 'Sleighers',
          pill: '3D Art',
          text: "A Christmas-themed multiplayer hero shooter from Georgia Tech's VGDev club. Two teams, Fir and Fae, fight over one snow map, decorating objectives and then holding them to fill a Cheer meter. Modeled and animated the festive tommy gun in Blender for the Unreal build.",
          tags: ['Unreal Engine', 'Blender', '3D Modeling', '3D Animation'],
          href: 'https://www.gtvgdev.com/games-archive/sleighers',
          media: [
            '/assets/sleighers-1.jpg',
            '/assets/sleighers-2.jpg',
            '/assets/sleighers-3.jpg',
            '/assets/sleighers-4.jpg',
            '/assets/sleighers-5.jpg',
          ],
          mediaAspect: 1280 / 720,
        },
        {
          title: 'Chime',
          pill: 'Code + Art',
          text: "An action roguelike set in Athyrium, a kingdom overrun by monsters, where a talking bell drops you into the memories of the people who lived there. Built by a VGDev team at Georgia Tech. Wrote gameplay code in C# and modeled 3D assets in Blender.",
          tags: ['Unity', 'C#', 'Blender', 'Git', 'GitHub'],
          href: 'https://www.gtvgdev.com/games-archive/chime',
          media: '/assets/chime.gif',
          mediaAspect: 400 / 225,
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
          media: '/assets/tutortle-logo.png',
          mediaFit: 'contain',
          mediaAspect: 1,
        },
        {
          title: 'BuzzedIn',
          pill: 'Django',
          text: 'A Django job-matching platform connecting Georgia Tech students with recruiters. Optimized database access to cut load time by 80%+, and integrated 5+ APIs that lifted engagement 30% through dynamic filtering and responsive UX.',
          tags: ['Django', 'PostgreSQL', 'REST APIs'],
          href: 'https://github.com/ntran306/GTJobSearch',
          media: 'https://res.cloudinary.com/evfukudw/video/upload/v1789702113/buzzedin-demo.mp4',
          mediaAspect: 960 / 436,
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
          media: '/assets/vip-screenshot.jpg',
          mediaAspect: 1192 / 661,
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
