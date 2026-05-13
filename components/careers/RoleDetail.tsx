import Link from "next/link";
import { ABOUT_LINES, type Role } from "./roles";
import { ApplyForm } from "./ApplyForm";

export function RoleDetail({ role }: { role: Role }) {
  return (
    <main className="careers-page">
      <div className="careers-wrap-wide">
        <Link href="/careers" className="careers-back">
          <svg width="12" height="10" viewBox="0 0 14 10" fill="none">
            <path
              d="M5 1L1 5L5 9M1 5H13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          All open roles
        </Link>

        <div className="careers-eyebrow">
          {role.equityRange} equity · remote-first
        </div>
        <h1 className="careers-h1">{role.title}</h1>
        <p className="careers-detail-lead">{role.summary}</p>

        <section className="careers-block">
          <h2>What you&apos;ll own</h2>
          <ul>
            {role.ownership.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </section>

        <section className="careers-block">
          <h2>What we&apos;re looking for</h2>
          <ul>
            {role.qualifications.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </section>

        <section className="careers-block">
          <h2>About working at Red Planet</h2>
          <ul className="careers-about-lines">
            {ABOUT_LINES.map((l) => (
              <li key={l.label}>
                <strong>{l.label}</strong>
                {l.body}
              </li>
            ))}
          </ul>
        </section>

        <section className="careers-block">
          <h2>Compensation</h2>
          <div className="careers-comp">{role.compensation}</div>
        </section>

        <section className="careers-block" id="apply">
          <h2>Apply</h2>
          <div className="careers-apply">
            <ApplyForm role={role} />
          </div>
        </section>
      </div>
    </main>
  );
}
