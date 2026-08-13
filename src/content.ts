// =====================================================================
//  SITE CONTENT — this is the only file you need to edit to update text.
//  No UI, styling, or animation code lives here. Change a string, add an
//  item to a list, and the site updates itself. TypeScript will warn you
//  if an entry is missing a field.
// =====================================================================

/* ---------- Hero (Home section) ---------- */
export const hero = {
  greeting: "Hi, I'm",
  name: 'Nathan Tran',
  tagline: 'CS student at Georgia Tech building interactive experiences across games, web, and XR — with research in AI-driven robotics.',
}

/* ---------- Links (used by the hero buttons AND the Contact section) ---------- */
export const links = {
  email: 'nathangsu306@gmail.com',
  github: 'https://github.com/ntran306',
  linkedin: 'https://www.linkedin.com/in/ntran306/',
  resume: '/assets/resume.pdf',
}

/* ---------- About ---------- */
export const about = {
  heading: 'About',
  // Short facts line shown between the photos and the bio.
  facts: ['Georgia Tech', 'CS + FinTech', 'Atlanta, GA'],
  bio: "I'm a Computer Science student at Georgia Tech minoring in FinTech, focused on building interactive systems that span game development, fullstack web, and VR/robotics research. Right now I'm splitting time between a VR + AI research project, two fullstack products, and a solo game I've been building since 2023. Outside of class, I'm part of VGDev (GT's Video Game Development Club) and GT Swim Club, and I spend my free time on calisthenics, bouldering, piano, and probably too much UFC. Always looking for the next thing to build.",
  // Impact stats — the number counts up when scrolled into view.
  stats: [
    { value: 4, suffix: '+', label: 'Years of coding experience' },
    { value: 2, suffix: '+', label: 'Years of AI applications' },
    { value: 450, suffix: '+', label: 'Game demo visits attracted' },
  ],
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
}

export const experience = {
  heading: 'Experience',
  subhead: "Where I've worked and what I've led.", // shown on mobile / reduced-motion
  scrollHint: 'Scroll to travel the timeline.', // shown under the pinned heading
  // ➕ Add a new experience: copy one block, edit it, drop it in (newest first).
  items: [
    { title: 'Georgia Tech VIP — Undergraduate Researcher', year: '2025 – Present', text: 'Researching how VR, AI, and robotics can improve safety and learning in construction — building 6+ interactive Unity environments with cross-platform VR support at a stable 90+ FPS.', tags: ['Unity', 'VR', 'AI', 'Research'] },
    { title: 'Viet Home Care LLC — Caregiver', year: '2025 – Present', text: 'Providing in-home nursing support — diet monitoring, mobility assistance, and technological aid — with the consistent communication and companionship that keep clients comfortable and independent.', tags: ['Caregiving', 'Communication'] },
    { title: "St. Mary's Academy — Swim Instructor & Varsity Captain", year: '2020 – 2024', text: 'Led the varsity team to state-level championships 4 years in a row, grew membership over 200%, and coached 30+ swimmers from elementary through high school.', tags: ['Leadership', 'Coaching'] },
  ] satisfies Experience[],
}

/* ---------- Projects ---------- */
export interface Project {
  title: string
  pill: string
  text: string
  tags: string[]
  href: string
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
  categories: [
    {
      name: 'Videogame Development',
      projects: [
        { title: 'Chime', pill: 'Unity', text: 'Roguelike built with a small team — core gameplay systems, 7+ modeled & rigged NPCs, and 50+ playtests ahead of the VGDev Fall demo.', tags: ['C#', 'Unity', 'Blender'], href: '#' },
        { title: 'The Known World', pill: 'Solo Project', text: 'A solo-developed game — coded, modeled, and animated the movement systems myself; optimized rendering cut CPU load 20% and grew playtime 50%+.', tags: ['C#', 'Unity', 'Blender'], href: '#' },
      ],
    },
    {
      name: 'Web Development',
      projects: [
        { title: 'BuzzedIn', pill: 'Fullstack', text: 'A job-matching platform connecting job seekers and recruiters, with 5+ integrated APIs and dynamic filtering that lifted engagement 30%+.', tags: ['Fullstack', 'APIs'], href: '#' },
        { title: 'Tutortle', pill: 'Fullstack', text: 'Location-based tutoring platform with real-time distance matching and in-app scheduling — cut matching time 40% and boosted coordination 25%.', tags: ['Fullstack', 'APIs', 'Real-time'], href: '#' },
      ],
    },
    {
      name: 'XR / VR Development',
      projects: [
        { title: 'Autorobotics in Construction', pill: 'Research', text: 'Undergraduate VR/AI/robotics research improving safety and learning in construction — 6+ Unity environments, cross-platform VR support, 90+ FPS pipeline.', tags: ['Unity', 'VR', 'AI', 'Robotics'], href: '#' },
      ],
    },
    {
      name: 'Miscellaneous Development',
      projects: [
        { title: 'Misc Project', pill: 'Tool', text: 'One-line: why it exists and who it helps.', tags: ['Python', 'CLI'], href: '#' },
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
    { k: 'Languages', v: 'Java • Python • C# • JavaScript • Lua • Assembly • SQL • HTML' },
    { k: 'Frameworks', v: 'Django • MySQL • PythonAnywhere' },
    { k: 'Engines', v: 'Unity • Unreal Engine' },
    { k: 'Tools', v: 'Blender • Twilio' },
    { k: 'Specialized', v: 'VR Development • Human-Robot Interaction • Game Design • AI Applications • Web Development' },
  ] satisfies Skill[],
}

/* ---------- Contact ---------- */
export const contact = {
  heading: 'Contact',
  subhead: 'Always open to new opportunities',
  // The subject line of contact-form emails is prefixed with this.
  emailSubjectPrefix: 'NathanTran.com Notification - ',
}
