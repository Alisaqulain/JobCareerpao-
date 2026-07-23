export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] };

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  readTime: string;
  author: string;
  blocks: BlogBlock[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "career-tips-2026",
    title: "10 Career Tips to Thrive in 2026",
    category: "Career Tips",
    excerpt: "Actionable advice to future-proof your career in a rapidly evolving job market.",
    date: "Jul 18, 2026",
    readTime: "6 min",
    author: "Priya Nair",
    blocks: [
      {
        type: "p",
        text: "The Indian job market in 2026 rewards candidates who combine technical depth with adaptability. Whether you are a fresher or a senior professional, these ten habits will keep you ahead.",
      },
      { type: "h2", text: "1. Build a skills stack, not a single skill" },
      {
        type: "p",
        text: "Companies hiring for tech and product roles increasingly look for T-shaped profiles — deep expertise in one area plus familiarity with adjacent tools. Pair your core skill with communication, basic analytics, or cloud fundamentals.",
      },
      { type: "h2", text: "2. Treat your profile like a product" },
      {
        type: "ul",
        items: [
          "Keep your resume updated with measurable outcomes.",
          "Upload a clean PDF resume on JobCareerPao before applying.",
          "Fill every required field in the application form — incomplete profiles get filtered early.",
        ],
      },
      { type: "h2", text: "3. Apply with intention" },
      {
        type: "p",
        text: "Instead of mass applying, shortlist roles that match your experience band and location preference. Each application on JobCareerPao includes a fee — make every submission count.",
      },
      { type: "h2", text: "4–10: Quick wins" },
      {
        type: "ul",
        items: [
          "Follow up on application status from your profile dashboard.",
          "Prepare one strong STAR story for behavioral rounds.",
          "Learn what the company does before you apply.",
          "Network on LinkedIn with people in similar roles.",
          "Track salary benchmarks for your city and level.",
          "Upskill with free resources between applications.",
          "Stay consistent — hiring cycles move in waves.",
        ],
      },
    ],
  },
  {
    slug: "ats-resume-guide",
    title: "Build an ATS-Friendly Resume That Gets Noticed",
    category: "Resume Tips",
    excerpt: "Learn how hiring teams and ATS systems evaluate resumes — and how to pass both.",
    date: "Jul 14, 2026",
    readTime: "8 min",
    author: "Rahul Mehta",
    blocks: [
      {
        type: "p",
        text: "Applicant Tracking Systems (ATS) scan resumes before a human ever sees them. In India’s competitive market, a well-structured resume can be the difference between an interview call and silence.",
      },
      { type: "h2", text: "Format rules that always work" },
      {
        type: "ul",
        items: [
          "Use a single-column layout — avoid tables and text boxes.",
          "Stick to standard headings: Education, Experience, Skills, Projects.",
          "Save and upload as PDF unless the job specifies otherwise.",
          "Keep file size under 5 MB on JobCareerPao.",
        ],
      },
      { type: "h2", text: "Keywords matter" },
      {
        type: "p",
        text: "Mirror language from the job description. If the role asks for React, TypeScript, and REST APIs, ensure those terms appear naturally in your skills and project bullets — not stuffed awkwardly.",
      },
      { type: "h2", text: "Quantify impact" },
      {
        type: "p",
        text: "Replace vague lines like 'worked on backend' with 'Built REST APIs serving 50K daily users, reducing latency by 30%.' Numbers catch both ATS parsers and hiring managers.",
      },
    ],
  },
  {
    slug: "interview-prep-masterclass",
    title: "Interview Preparation Masterclass",
    category: "Interview Preparation",
    excerpt: "From behavioral rounds to system design — a complete preparation playbook.",
    date: "Jul 10, 2026",
    readTime: "12 min",
    author: "Ananya Patel",
    blocks: [
      {
        type: "p",
        text: "You paid the application fee and got the call — now preparation decides the outcome. This masterclass covers the three rounds most Indian tech companies use.",
      },
      { type: "h2", text: "Round 1: HR / screening" },
      {
        type: "ul",
        items: [
          "Prepare a crisp 60-second introduction.",
          "Know your expected CTC and notice period.",
          "Explain why you applied to this specific company.",
        ],
      },
      { type: "h2", text: "Round 2: Technical" },
      {
        type: "p",
        text: "Revise fundamentals for your stack. For developers: DSA basics, one language deeply, and one project you can whiteboard. For non-tech roles: case studies and domain questions.",
      },
      { type: "h2", text: "Round 3: Behavioral" },
      {
        type: "p",
        text: "Use the STAR method — Situation, Task, Action, Result. Prepare five stories covering conflict, failure, leadership, tight deadlines, and learning something new.",
      },
    ],
  },
  {
    slug: "india-salary-guide-2026",
    title: "India Salary Guide 2026 by Role & City",
    category: "Salary Guide",
    excerpt: "Benchmark your compensation across tech, consulting, and product roles.",
    date: "Jul 5, 2026",
    readTime: "10 min",
    author: "Vikram Singh",
    blocks: [
      {
        type: "p",
        text: "Salary expectations vary sharply by city, company tier, and experience. Use this guide as a reference when evaluating job listings on JobCareerPao.",
      },
      { type: "h2", text: "Software engineering (annual CTC, INR)" },
      {
        type: "ul",
        items: [
          "Fresher (Tier-1 city): ₹4–8 LPA",
          "3–5 years (Bengaluru/Hyderabad): ₹12–22 LPA",
          "5–8 years (product companies): ₹25–45 LPA",
          "8+ years (lead/architect): ₹40–70+ LPA",
        ],
      },
      { type: "h2", text: "City multipliers" },
      {
        type: "p",
        text: "Bengaluru and Hyderabad typically lead for tech. Mumbai and Pune are strong for BFSI and consulting. Tier-2 cities may offer 15–25% lower base but growing remote options balance the gap.",
      },
      { type: "h2", text: "Negotiation tip" },
      {
        type: "p",
        text: "Always clarify fixed vs variable pay, ESOPs, and joining bonus before accepting. The listed salary range on a job post is a starting anchor — not always the final offer.",
      },
    ],
  },
  {
    slug: "hiring-trends-india",
    title: "Top Hiring Trends Across Indian Industries",
    category: "Industry News",
    excerpt: "What's hot in hiring: AI roles, hybrid policies, and skills employers want now.",
    date: "Jun 28, 2026",
    readTime: "7 min",
    author: "Editorial Team",
    blocks: [
      {
        type: "p",
        text: "H1 2026 showed sustained demand in AI/ML, cloud engineering, and product management across India’s top employers.",
      },
      { type: "h2", text: "Trend 1: AI literacy everywhere" },
      {
        type: "p",
        text: "Even non-AI roles now list prompt engineering, data literacy, or automation tools as nice-to-have skills.",
      },
      { type: "h2", text: "Trend 2: Hybrid is the default" },
      {
        type: "p",
        text: "Most Bengaluru and Hyderabad postings specify hybrid or remote-friendly policies. On-site-only roles are concentrated in banking and manufacturing.",
      },
      { type: "h2", text: "Trend 3: Skills over degrees" },
      {
        type: "p",
        text: "Portfolio projects and verified application profiles carry more weight for junior and mid-level tech hiring than ever before.",
      },
    ],
  },
  {
    slug: "fresher-job-search-guide",
    title: "Fresher's Guide to Landing Your First Job in India",
    category: "Career Tips",
    excerpt: "A step-by-step roadmap for students and fresh graduates entering the job market.",
    date: "Jun 20, 2026",
    readTime: "9 min",
    author: "Sneha Reddy",
    blocks: [
      {
        type: "p",
        text: "Your first job sets the trajectory for your career. Here is a practical roadmap tailored for Indian freshers using JobCareerPao.",
      },
      { type: "h2", text: "Step 1: Create a complete profile" },
      {
        type: "p",
        text: "Sign up, verify your email, add education details, and upload a one-page resume. Recruiters on our platform review complete profiles first.",
      },
      { type: "h2", text: "Step 2: Target the right roles" },
      {
        type: "ul",
        items: [
          "Filter jobs by 'Internship' or '0–2 years' experience.",
          "Read the full description before paying the application fee.",
          "Apply to 5–10 well-matched roles rather than 50 random ones.",
        ],
      },
      { type: "h2", text: "Step 3: Prepare for aptitude + technical tests" },
      {
        type: "p",
        text: "Many companies include online assessments. Practice quantitative aptitude, logical reasoning, and basic coding on platforms like LeetCode Easy and HackerRank.",
      },
    ],
  },
  {
    slug: "linkedin-profile-optimization",
    title: "How to Optimize Your LinkedIn Profile in 2026",
    category: "Career Tips",
    excerpt: "Turn your LinkedIn into a magnet for opportunities alongside your JobCareerPao profile.",
    date: "Jun 12, 2026",
    readTime: "5 min",
    author: "Karan Joshi",
    blocks: [
      {
        type: "p",
        text: "Your JobCareerPao profile handles applications and payments. LinkedIn complements it for visibility and networking.",
      },
      { type: "h2", text: "Headline formula" },
      {
        type: "p",
        text: "Role + value + niche. Example: 'Full Stack Developer | React & Node.js | Building scalable products for Indian startups'",
      },
      { type: "h2", text: "About section" },
      {
        type: "p",
        text: "Write in first person. Three short paragraphs: who you are, what you have built, what you are looking for next.",
      },
      { type: "h2", text: "Activity" },
      {
        type: "p",
        text: "Comment thoughtfully on posts in your industry once or twice a week. Consistency beats viral posts for long-term visibility.",
      },
    ],
  },
  {
    slug: "remote-work-india",
    title: "Remote Work in India: What Candidates Should Know",
    category: "Industry News",
    excerpt: "Tax implications, time zones, and how to find legitimate remote roles.",
    date: "Jun 5, 2026",
    readTime: "6 min",
    author: "Editorial Team",
    blocks: [
      {
        type: "p",
        text: "Remote roles on JobCareerPao are clearly tagged. Here is what to consider before applying.",
      },
      { type: "h2", text: "Verify legitimacy" },
      {
        type: "p",
        text: "All jobs on our platform are posted by admin on behalf of verified companies. Never pay fees outside the official Razorpay checkout on the apply page.",
      },
      { type: "h2", text: "Set up your workspace" },
      {
        type: "ul",
        items: [
          "Stable broadband (minimum 50 Mbps recommended for video calls).",
          "Dedicated quiet space for interviews.",
          "Backup power or mobile hotspot for critical meetings.",
        ],
      },
    ],
  },
  {
    slug: "government-job-vs-private",
    title: "Government vs Private Jobs: Which Path Is Right for You?",
    category: "Career Tips",
    excerpt: "Compare stability, growth, and lifestyle factors before choosing your career track.",
    date: "May 28, 2026",
    readTime: "8 min",
    author: "Dr. Meena Iyer",
    blocks: [
      {
        type: "p",
        text: "Indian candidates often debate between PSU/government exams and private sector roles. Both have merit depending on your priorities.",
      },
      { type: "h2", text: "Government / PSU" },
      {
        type: "ul",
        items: [
          "High job security and structured promotions.",
          "Long exam preparation cycles.",
          "Lower initial pay but strong benefits.",
        ],
      },
      { type: "h2", text: "Private sector" },
      {
        type: "ul",
        items: [
          "Faster hiring and higher starting salaries in tech.",
          "Performance-driven growth.",
          "More location and role flexibility.",
        ],
      },
      {
        type: "p",
        text: "JobCareerPao focuses on private sector and corporate openings. Browse roles by company, pay the application fee, and track status from your profile.",
      },
    ],
  },
  {
    slug: "soft-skills-that-get-hired",
    title: "7 Soft Skills That Get You Hired Faster",
    category: "Interview Preparation",
    excerpt: "Technical skills open the door — these soft skills help you walk through it.",
    date: "May 20, 2026",
    readTime: "5 min",
    author: "Arjun Kapoor",
    blocks: [
      {
        type: "p",
        text: "Hiring managers consistently rank communication, ownership, and adaptability among top differentiators.",
      },
      {
        type: "ul",
        items: [
          "Clear written communication in emails and Slack.",
          "Ownership — you finish what you start.",
          "Curiosity — you ask good questions.",
          "Collaboration across teams.",
          "Time management under deadlines.",
          "Receiving feedback without defensiveness.",
          "Professionalism in every interaction.",
        ],
      },
      {
        type: "p",
        text: "Demonstrate these in your application form answers and interview stories — not just on your resume.",
      },
    ],
  },
  {
    slug: "bengaluru-tech-scene-2026",
    title: "Bengaluru Tech Scene 2026: Companies & Roles to Watch",
    category: "Industry News",
    excerpt: "India's Silicon Valley continues to lead hiring — here's what's moving the market.",
    date: "May 12, 2026",
    readTime: "7 min",
    author: "Editorial Team",
    blocks: [
      {
        type: "p",
        text: "Bengaluru remains India's largest tech hiring hub with GCCs, startups, and global product companies all competing for talent.",
      },
      { type: "h2", text: "Hot roles" },
      {
        type: "ul",
        items: [
          "AI/ML engineers and MLOps specialists.",
          "Full-stack developers with cloud experience.",
          "Product managers with B2B SaaS background.",
          "DevOps and platform engineers.",
        ],
      },
      { type: "h2", text: "Living & commute" },
      {
        type: "p",
        text: "Factor commute time when choosing roles. Many companies near Whitefield, ORR, and Electronic City offer hybrid schedules to reduce daily travel.",
      },
    ],
  },
  {
    slug: "application-fee-explained",
    title: "Why Job Application Fees Exist — And How to Apply Smartly",
    category: "Career Tips",
    excerpt: "Understand application fees on JobCareerPao and how to make every application count.",
    date: "May 5, 2026",
    readTime: "4 min",
    author: "JobCareerPao Team",
    blocks: [
      {
        type: "p",
        text: "Each job on JobCareerPao may charge a one-time application fee. This covers processing, verification, and platform operations — there are no monthly plans or subscriptions.",
      },
      { type: "h2", text: "The apply flow" },
      {
        type: "ul",
        items: [
          "Browse jobs and open a listing you qualify for.",
          "Complete your profile and upload your resume.",
          "Fill the job-specific application form.",
          "Pay via secure Razorpay checkout.",
          "Track status under Profile → Applications.",
        ],
      },
      { type: "h2", text: "Before you pay" },
      {
        type: "p",
        text: "Read eligibility criteria, last date, and required documents. Application fees are generally non-refundable once submitted — choose roles carefully.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getBlogCategories(): string[] {
  return [...new Set(blogPosts.map((p) => p.category))];
}
