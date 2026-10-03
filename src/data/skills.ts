import type { SkillGroup } from '../types'

export const skillGroups: SkillGroup[] = [
  {
    id: 'frontend',
    label: 'Frontend',
    blurb: 'React interfaces built against real APIs.',
    accent: 'cobalt',
    skills: ['React', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Vite', 'Responsive Design'],
  },
  {
    id: 'backend',
    label: 'Backend',
    blurb: 'Where the business rules live — my deepest layer.',
    accent: 'coral',
    skills: [
      'Java',
      'Spring Boot',
      'Spring MVC',
      'Spring Security',
      'Hibernate',
      'JPA',
      'REST APIs',
      'JWT',
      'Microservices',
      'JDBC',
      'Servlets',
      'JSP',
    ],
  },
  {
    id: 'database',
    label: 'Database',
    blurb: 'Relational modelling first — Redis when speed demands it.',
    accent: 'mint',
    skills: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Database Design'],
  },
  {
    id: 'devops',
    label: 'DevOps & Tools',
    blurb: 'Containerize, version, ship, observe.',
    accent: 'yellow',
    skills: ['Git', 'GitHub', 'Maven', 'Postman', 'Docker', 'JUnit', 'Mockito', 'AWS', 'CI/CD'],
  },
]

export const currentlyLearning = ['Spring Microservices', 'System Design', 'JUnit testing']
