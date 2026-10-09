export interface SampleResume {
  name: string;
  role: string;
  text: string;
}

export const SAMPLE_RESUMES: SampleResume[] = [
  {
    name: 'Alex Rivera (Full Stack Engineer)',
    role: 'Full Stack Software Engineer',
    text: `ALEX RIVERA
San Francisco, CA | alex.rivera@example.com | (555) 382-9102 | linkedin.com/in/alexrivera-dev | github.com/alexrivera

PROFESSIONAL SUMMARY
Results-driven Full Stack Software Engineer with 4+ years of experience designing and deploying scalable web architectures, microservices, and reactive user interfaces. Proficient in TypeScript, React, Node.js, Next.js, and PostgreSQL with hands-on production experience in Docker and AWS CI/CD pipelines. Boosted system throughput by 35% and reduced page latency by 40% in previous SaaS environments.

TECHNICAL SKILLS
- Languages: TypeScript, JavaScript (ES6+), Python, SQL, HTML5, CSS3
- Frontend: React, Next.js, Tailwind CSS, Redux Toolkit, Webpack, Vite
- Backend & APIs: Node.js, Express, NestJS, REST APIs, GraphQL, WebSockets
- Databases: PostgreSQL, MongoDB, Redis, Cloud Firestore
- DevOps & Cloud: AWS (S3, EC2, CloudFront), Docker, GitHub Actions, Vercel
- Testing & Tools: Jest, React Testing Library, Cypress, Git, Agile/Scrum

PROFESSIONAL EXPERIENCE
Senior Full Stack Developer | CloudScale Solutions | 2022 – Present
- Architected and shipped a multi-tenant analytics dashboard serving 120,000+ monthly active users using Next.js, TypeScript, and Tailwind CSS.
- Optimized database queries and implemented a Redis caching layer, decreasing p95 server response times from 480ms to 95ms.
- Built automated end-to-end CI/CD test suites with GitHub Actions, reducing release cycle rollback frequency by 60%.
- Mentored 4 junior engineers in modern TypeScript standards, clean code principles, and defensive API design.

Software Engineer | NexaTech Systems | 2020 – 2022
- Developed scalable RESTful microservices using Node.js and Express, supporting high-concurrency payment and checkout workflows.
- Migrated legacy jQuery frontends to component-driven React SPAs with automated client-side state caching.
- Integrated third-party webhooks and authentication providers with OAuth2 and JWT token verification.

KEY PROJECTS
- OpenDev Platform: Open-source developer productivity tool with real-time markdown collaboration and WebSocket syncing; gained 850+ GitHub stars.
- EcoTracker: Mobile-responsive carbon footprint calculator with automated PDF reporting and interactive data visualizations.

EDUCATION & CERTIFICATIONS
- Bachelor of Science in Computer Science, University of California, Davis (2016 – 2020)
- AWS Certified Solutions Architect – Associate (2023)
`,
  },
  {
    name: 'Priya Sharma (Frontend & UI Engineer)',
    role: 'Frontend Engineer',
    text: `PRIYA SHARMA
New York, NY | priya.sharma@example.com | linkedin.com/in/priyasharma-ui | priyasharma.io

PROFESSIONAL SUMMARY
Passionate Frontend Engineer with 3+ years of expertise building accessible, high-performance web applications using React, TypeScript, and modern CSS architectures. Deep understanding of Core Web Vitals, responsive design systems, and cross-browser compatibility.

SKILLS
- Core: JavaScript, TypeScript, HTML5, CSS3/SCSS
- Libraries & Frameworks: React, Next.js, Vue.js, Tailwind CSS, Material UI, Framer Motion
- State & Performance: TanStack Query, Redux, Zustand, Lighthouse Optimization, Accessibility (WCAG 2.1 AA)
- Tooling: Vite, Git, Jest, Storybook, Figma to Code

EXPERIENCE
Frontend Developer | PixelCraft Labs | 2022 – Present
- Re-architected core e-commerce storefront leading to a 28% increase in mobile conversion rates and a 98/100 Google Lighthouse performance score.
- Established the organization's reusable React design system with 40+ accessible UI components documented in Storybook.
- Implemented client-side performance audits and asset lazy-loading, trimming JavaScript bundle size by 35%.

Junior Web Developer | Innovate Web Studio | 2021 – 2022
- Built custom responsive web interfaces for 15+ international client engagements.
- Conducted cross-device testing and resolved layout shifts and WCAG contrast violations.

EDUCATION
- Bachelor of Technology in Information Technology, State University (2017 – 2021)
- Meta Frontend Developer Professional Certificate (Coursera, 2022)
`,
  },
];

export interface SampleJob {
  title: string;
  company: string;
  description: string;
}

export const SAMPLE_JOBS: SampleJob[] = [
  {
    title: 'Senior Full Stack Engineer',
    company: 'Stripe / Fintech SaaS',
    description: `About the Role:
We are looking for a Senior Full Stack Engineer to lead development of our merchant billing and analytics experiences. You will design, build, and maintain APIs, services, and user interfaces that manage millions of dollars in daily transactions.

Responsibilities:
- Build robust, resilient web applications using React, TypeScript, and Node.js.
- Partner with product designers and backend engineers to craft intuitive merchant dashboards.
- Write clean, maintainable, and thoroughly tested code with high test coverage.
- Monitor application health, debug production issues, and improve p99 latency.
- Contribute to architectural discussions and mentor junior teammates.

Requirements:
- 3+ years of professional full-stack software engineering experience.
- Strong proficiency in modern TypeScript, React, and Node.js.
- Experience with relational databases like PostgreSQL and caching solutions like Redis.
- Familiarity with cloud platforms (AWS/GCP), containerization (Docker), and automated CI/CD.
- Excellent communication skills and passion for customer-centric software.
`,
  },
  {
    title: 'Frontend React Engineer',
    company: 'Vercel / Modern Developer Tools',
    description: `About the Role:
We are seeking a Frontend Engineer passionate about web speed, developer experience, and modern web standards. You will build user-facing products that thousands of developers use every day.

Responsibilities:
- Develop fluid, accessible web interfaces in Next.js, React, and Tailwind CSS.
- Optimize web performance, bundle size, and Core Web Vitals.
- Collaborate with designers in Figma to translate designs into pixel-perfect components.
- Write unit and integration tests using Jest and Playwright.

Requirements:
- Strong foundations in JavaScript, TypeScript, CSS, and DOM APIs.
- Production experience with Next.js App Router, React Server Components, and Tailwind CSS.
- Obsession with polish, micro-interactions, accessibility (WCAG), and responsive layouts.
- Track record of shipping customer-facing web applications.
`,
  },
];
