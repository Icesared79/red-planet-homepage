// Canonical content for the two open roles. Lives in one place so the
// /careers index page and each detail page stay in sync.

export type RoleQuestion = {
  id: "q1" | "q2" | "q3";
  prompt: string;
};

export type Role = {
  slug: "head-of-operations-and-strategy" | "head-of-platform";
  title: string;
  summary: string;
  equityRange: string;
  compensation: string;
  ownership: string[];
  qualifications: string[];
  questions: RoleQuestion[];
};

export const ROLES: Role[] = [
  {
    slug: "head-of-operations-and-strategy",
    title: "Head of Operations & Strategy",
    summary:
      "Run the business side of Red Planet end-to-end. Pricing, partnerships, fundraising, hiring — everything that isn't shipping code.",
    equityRange: "4–7%",
    compensation:
      "Equity range: 4–7% depending on experience and scope. Four-year vest, one-year cliff. Cash compensation activates at funding close. Performance accelerator available on successful Series A close.",
    ownership: [
      "Pricing, packaging, and go-to-market for the products built on Atlas.",
      "Partnerships — installers, counselors, lenders, funds, infrastructure operators.",
      "The seed raise alongside the founder; investor relations after close.",
      "First commercial and operations hires once the round closes.",
      "Quarterly priorities and the trade-offs the founder can't see from inside the engine.",
      "Customer relationships at the top — the first ten contracts, personally.",
    ],
    qualifications: [
      "Operating role at an early-stage company that closed at least one institutional round.",
      "Direct experience either leading or substantively contributing to a closed capital raise.",
      "Comfortable owning revenue, hiring, and finance with limited support infrastructure.",
      "Written and verbal communication strong enough to represent the company to investors and customers.",
      "Bias toward shipping decisions and re-evaluating them quickly, not toward consensus.",
      "Willing to operate equity-only until the round closes.",
    ],
    questions: [
      {
        id: "q1",
        prompt:
          "Describe a capital raise you led to close — round size, your role, outcome.",
      },
      {
        id: "q2",
        prompt:
          "Your experience with proptech, fintech, or data infrastructure companies specifically.",
      },
      {
        id: "q3",
        prompt: "Why this role over a salaried executive position elsewhere?",
      },
    ],
  },
  {
    slug: "head-of-platform",
    title: "Head of Platform",
    summary:
      "Own Atlas and everything built on top of it. Source coverage, signal quality, the API, the products. Senior engineer who directs and hardens AI-generated code at production scale.",
    equityRange: "2–3.5%",
    compensation:
      "Equity range: 2–3.5% depending on experience and commitment level. Four-year vest, one-year cliff. Cash compensation activates at funding close.",
    ownership: [
      "The Atlas data pipeline — agents, sources, nightly refresh, self-healing.",
      "Signal quality standards and new composite scores end-to-end.",
      "The API surface and developer experience for everyone building on Atlas.",
      "AI-native development practice — Claude Code in the loop on every commit.",
      "Architectural decisions on what gets built, refactored, or deprecated next.",
      "Engineering hiring and team lead responsibilities once the round closes.",
    ],
    qualifications: [
      "Production ownership of a non-trivial data system — pipelines, ingestion, or platform infrastructure.",
      "Strong Python and SQL. Comfortable with Postgres-scale data and serverless deployment.",
      "Real, demonstrable use of AI-assisted development in production work.",
      "Comfortable making product calls, not just engineering calls.",
      "Senior enough to operate without a manager and ship without permission.",
      "Willing to operate equity-only until the round closes.",
    ],
    questions: [
      {
        id: "q1",
        prompt:
          "Describe a production data system you've owned — scale, hardest reliability problems, how you solved them.",
      },
      {
        id: "q2",
        prompt:
          "Your experience with AI-assisted development in production. If none, how do you think about it?",
      },
      {
        id: "q3",
        prompt: "Why this role at this stage of the company?",
      },
    ],
  },
];

export function getRole(slug: string): Role | undefined {
  return ROLES.find((r) => r.slug === slug);
}

export const ABOUT_LINES: Array<{ label: string; body: string }> = [
  {
    label: "Remote-first.",
    body: "No office. Async writing and short, deliberate calls. Time-zone overlap with U.S. East Coast for a few hours a day is enough.",
  },
  {
    label: "Equity now, cash later.",
    body: "Equity-only pre-raise. Cash compensation activates at funding close. The raise is in motion.",
  },
  {
    label: "AI-native development.",
    body: "Claude Code is core to how we ship. Not a productivity hack — the reason a one-person team has gotten this far.",
  },
  {
    label: "Small team.",
    body: "Solo founder today. These two roles are the first hires. Direct ownership of an entire function from day one.",
  },
];
