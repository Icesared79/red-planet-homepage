import { Container } from "./Container";
import { Wordmark } from "./Wordmark";

const links = [
  { label: "Documentation", href: "/docs" },
  { label: "Developer Portal", href: "https://api.redplanetdata.com" },
  { label: "Contact", href: "#apply" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-bg-base py-12">
      <Container>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <Wordmark />
            <nav className="flex flex-wrap gap-x-8 gap-y-3">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-mono text-eyebrow uppercase text-fg-secondary transition-colors hover:text-fg-primary"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <p className="font-mono text-mono-sm text-fg-muted">
            The intelligence engine for the built environment.
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span className="font-mono text-eyebrow uppercase text-fg-muted">
              &copy; 2026 Red Planet Data
            </span>
            <a
              href="mailto:hello@redplanetdata.com"
              className="font-mono text-eyebrow uppercase text-fg-muted transition-colors hover:text-fg-primary"
            >
              hello@redplanetdata.com
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
