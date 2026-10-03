export type AccentName = 'coral' | 'cobalt' | 'yellow' | 'mint'

export interface TechGroup {
  label: string
  items: string[]
}

export interface ArchitectureLayer {
  label: string
  note?: string
}

export interface Project {
  id: string
  slug: string
  number: string
  title: string
  category: string
  status?: string
  accent: AccentName
  description: string
  longDescription: string[]
  problem: string
  solution: string
  features: string[]
  quickFeatures: string[]
  engineeringHighlights: string[]
  security?: string[]
  technologies: string[]
  stack?: string[]
  techGroups: TechGroup[]
  architecture: ArchitectureLayer[]
  architectureNote?: string
  challenges: string[]
  learnings: string[]
  metrics?: string[]
  githubUrl: string
  liveUrl?: string
  demo?: string
  image?: string
  imageSmall?: string
  imageAlt?: string
  year?: string
  role?: string
  duration?: string
  teamSize?: string
  gallery?: string[]
  featured: boolean
}

export interface OpenSourceContribution {
  id: string
  project: string
  period: string
  summary: string
  status: 'merged' | 'open'
  link: string
  technologies: string[]
}

export interface ExperienceItem {
  id: string
  kind: 'internship' | 'education' | 'independent'
  role: string
  org: string
  period: string
  location: string
  description: string
  achievements: string[]
  technologies: string[]
  size?: 'default' | 'compact'
  contributions?: OpenSourceContribution[]
}

export interface SkillGroup {
  id: string
  label: string
  blurb: string
  accent: AccentName
  skills: string[]
}

export interface Repository {
  name: string
  url: string
  description: string
  language: string | null
  stars: number | null
}
