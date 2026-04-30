import { Container } from "./Container";
import { Wordmark } from "./Wordmark";

const platformLinks = [
  { label: "Documentation", href: "/docs" },
  { label: "Developer Portal", href: "https://api.redplanetdata.com" },
  { label: "Pricing", href: "#apply" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-bg-base py-16">
      <Container>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          <div>
            <Wordmark />
            <p className="mt-4 text-body-sm text-fg-muted">
              The intelligence engine for the built environment.
            </p>
            <p className="mt-8 text-body-sm text-fg-muted">
              &copy; 2026 Red Planet Data
            </p>
          </div>
          <div>
            <span className="text-eyebrow uppercase text-fg-muted">
              Platform
            </span>
            <ul className="mt-4 flex flex-col gap-3">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-body-sm text-fg-secondary transition-colors hover:text-fg-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="text-eyebrow uppercase text-fg-muted">
              Contact
            </span>
            <div className="mt-4 flex flex-col gap-3">
              <a
                href="mailto:hello@redplanetdata.com"
                className="text-body-sm text-fg-secondary transition-colors hover:text-fg-primary"
              >
                hello@redplanetdata.com
              </a>
              <span className="text-body-sm text-fg-muted">
                Connecticut &middot; Operating remotely.
              </span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
