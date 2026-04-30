import { Container } from "./Container";

export function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-bg-bone py-10">
      <Container className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <p className="font-sans text-body-sm text-ink-muted">
          © 2026 Red Planet Data
        </p>
        <p className="font-sans text-body-sm text-ink-muted">
          Connecticut · United States
        </p>
      </Container>
    </footer>
  );
}
