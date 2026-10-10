// The screening-question contract, shared by the form in the browser and the
// route handler on the server. Both import this file so there is exactly one
// definition of "disqualified" -- the browser stops an applicant before they
// submit, and the route refuses the same answers again, because a hand-rolled
// POST would otherwise walk straight past the client check.
//
// Nothing here is specific to a posting. The questions, their types, whether
// each is required and which answer disqualifies all arrive as a row from
// public.job_postings, so a future posting is an INSERT and not a deploy.

export type QuestionType = "yes_no" | "number";

export type Disqualify =
  | { equals: string }
  | { less_than: number }
  | null
  | undefined;

export type Question = {
  key: string;
  prompt: string;
  type: QuestionType;
  required: boolean;
  disqualify?: Disqualify;
};

/** What the form sends and what an application row stores. */
export type Answer = {
  key: string;
  prompt: string;
  type: QuestionType;
  /** "yes" / "no" for yes_no, a decimal string for number, "" for unanswered. */
  answer: string;
};

/** The one sentence shown to anyone whose answers rule them out. */
export const DECLINE_NOTE =
  "Thank you for your interest. Based on your answers, this role is not the right fit right now.";

export function parseQuestions(raw: unknown): Question[] {
  if (!Array.isArray(raw)) return [];
  const out: Question[] = [];
  for (const q of raw) {
    if (!q || typeof q !== "object") continue;
    const o = q as Record<string, unknown>;
    const key = typeof o.key === "string" ? o.key : "";
    const prompt = typeof o.prompt === "string" ? o.prompt : "";
    const type = o.type === "number" ? "number" : "yes_no";
    if (!key || !prompt) continue;
    let disqualify: Disqualify = null;
    const d = o.disqualify;
    if (d && typeof d === "object") {
      const dd = d as Record<string, unknown>;
      if (typeof dd.equals === "string") disqualify = { equals: dd.equals };
      else if (typeof dd.less_than === "number")
        disqualify = { less_than: dd.less_than };
    }
    out.push({ key, prompt, type, required: o.required === true, disqualify });
  }
  return out;
}

/** "" when the answer is acceptable, otherwise why it is not. */
export function answerProblem(q: Question, answer: string): string {
  const v = (answer ?? "").trim();
  if (!v) return q.required ? "Required." : "";
  if (q.type === "yes_no") {
    return v === "yes" || v === "no" ? "" : "Answer yes or no.";
  }
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return "Enter a number of years.";
  if (n > 80) return "Enter a number of years.";
  return "";
}

/**
 * True when this answer rules the applicant out. An unanswered optional
 * question never disqualifies, and a question with no `disqualify` rule never
 * does either.
 */
export function isDisqualifying(q: Question, answer: string): boolean {
  const d = q.disqualify;
  if (!d) return false;
  const v = (answer ?? "").trim();
  if (!v) return false;
  if ("equals" in d) return v.toLowerCase() === d.equals.toLowerCase();
  if ("less_than" in d) {
    const n = Number(v);
    return Number.isFinite(n) && n < d.less_than;
  }
  return false;
}

export function anyDisqualifying(
  questions: Question[],
  answers: Record<string, string>
): boolean {
  return questions.some((q) => isDisqualifying(q, answers[q.key] ?? ""));
}
