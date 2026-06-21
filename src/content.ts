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
  tagline: 'Developer passionate about creating interactive experiences through games, web, and XR.',
}

/* ---------- Links (used by the hero buttons AND the Contact section) ---------- */
export const links = {
  email: 'nathangsu306@gmail.com',
  github: 'https://github.com/ntran306',
  linkedin: 'https://www.linkedin.com/in/ntran306/',
  resume: 'assets/resume.pdf',
}

/* ---------- About ---------- */
export const about = {
  heading: 'About',
  subhead: 'A little bit about me.',
  bio: "Write 4–6 sentences: what you're into, what you're building, and what you want next. Keep it simple and confident.",
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
  subhead: "A timeline of what I've done.", // shown on mobile / reduced-motion
  scrollHint: 'Scroll to travel the timeline.', // shown under the pinned heading
  // ➕ Add a new experience: copy one block, edit it, drop it in (newest first).
  items: [
    { title: 'Company — Role', year: '2025', text: 'Impact line. Result. Metric if possible.', tags: ['Python', 'Cloud', 'Data'] },
    { title: 'Research / Club — Title', year: '2024', text: 'What you built / led. Why it mattered.', tags: ['ML', 'Leadership'] },
  ] satisfies Experience[],
}

/* ---------- Projects ---------- */
export interface Project {
  title: string
  pill: string
  text: string
  tags: string[]
  href: string
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
        { title: 'Game Project One', pill: 'Unity', text: "One-line: what you built + what's cool about it.", tags: ['C#', 'Unity'], href: '#' },
      ],
    },
    {
      name: 'Web Development',
      projects: [
        { title: 'Web Project One', pill: 'Live', text: 'One-line: product outcome / users / impact.', tags: ['React', 'Node'], href: '#' },
      ],
    },
    {
      name: 'XR / VR Development',
      projects: [
        { title: 'XR Project', pill: 'Quest', text: 'One-line: interaction/tech highlight.', tags: ['Unity', 'XR'], href: '#' },
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
    { k: 'Languages', v: 'Python • Java • C/C++ • JS/TS • C#' },
    { k: 'Frameworks', v: 'React • Node • Flask • Next.js • Express' },
    { k: 'Engines', v: 'Unity • Unreal Engine' },
    { k: 'Tools', v: 'Git • Docker • Blender • Twilio • AWS' },
    { k: 'Specialized', v: 'Machine Learning • XR/VR • Game Dev • Web3' },
  ] satisfies Skill[],
}

/* ---------- Contact ---------- */
export const contact = {
  heading: 'Contact',
  subhead: 'Always open to new opportunities',
  // The subject line of contact-form emails is prefixed with this.
  emailSubjectPrefix: 'NathanTran.com Notification - ',
}
