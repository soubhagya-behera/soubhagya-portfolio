import type { ExperienceItem } from '../types'

export const experience: ExperienceItem[] = [
  {
    id: 'open-source',
    kind: 'independent',
    role: 'Open Source Contributions',
    org: 'GitHub',
    period: '2026',
    location: 'Remote',
    description: '',
    contributions: [
      {
        id: 'quarkus-artifact-metadata',
        project: 'Quarkus',
        period: 'Oct. 7, 2026',
        summary:
          'Avoided unnecessary artifact metadata loading for test-host integration tests and added focused regression coverage.',
        status: 'open',
        link: 'https://github.com/soubhagya-behera/quarkus/pull/57221',
        technologies: ['Java', 'Quarkus', 'JUnit'],
      },
      {
        id: 'agentj-locale-keyword',
        project: 'AgentJ',
        period: 'Oct. 8, 2026',
        summary:
          'Made keyword matching locale-independent with Locale.ROOT and added regression coverage for Turkish locale behavior.',
        status: 'open',
        link: 'https://github.com/soubhagya-behera/agentj/pull/24',
        technologies: ['Java', 'Maven', 'JUnit'],
      },
      {
        id: 'kestra-plugin-serdes',
        project: 'Kestra · plugin-serdes',
        period: 'Sep. 24 – Oct. 1, 2026',
        summary: 'Fixed nullable Avro union handling and added regression coverage.',
        status: 'merged',
        link: 'https://github.com/kestra-io/plugin-serdes/pull/423',
        technologies: ['Java', 'Apache Avro', 'JUnit 5'],
      },
      {
        id: 'mcp-java-testkit',
        project: 'MCP Java Testkit',
        period: 'Sep. 20, 2026',
        summary:
          'Added Spring AI WebMVC/WebFlux end-to-end regression coverage for the spring: URL scheme.',
        status: 'open',
        link: 'https://github.com/senor14/mcp-java-testkit/pull/25',
        technologies: ['Java', 'Spring AI', 'JUnit 5', 'Maven'],
      },
    ],
    achievements: [],
    technologies: [],
  },
  {
    id: 'internship-seeree',
    kind: 'internship',
    role: 'Java Full Stack Developer',
    org: 'Seeree Services Pvt. Ltd.',
    period: 'Oct. 2025 – Apr. 2026',
    location: 'Bhubaneswar, Odisha',
    description: '',
    achievements: [
      'Built banking backend services with Spring Boot and MySQL for 100+ users with RBAC.',
      'Secured 25+ REST APIs using Spring Security and JWT.',
      'Maintained 80%+ unit-test coverage with JUnit and Mockito.',
    ],
    technologies: ['Java', 'Spring Boot', 'React.js', 'MySQL', 'Spring Security', 'JWT', 'Hibernate/JPA', 'JSP', 'Servlets'],
  },
  {
    id: 'mca-usbm',
    kind: 'education',
    role: 'MCA — Computer Applications',
    org: 'United School of Business Management',
    period: '2024 – 2026',
    location: 'Bhubaneswar, Odisha',
    description: '',
    size: 'compact',
    achievements: ['CGPA: 8.3'],
    technologies: [],
  },
]
