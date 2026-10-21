import { RedPlanetMark } from "@/components/Marks";
import { ThemeToggle } from "@/components/ThemeToggle";

type Props = {
  /**
   * "home" keeps the nav as bare fragments so they scroll in place and do not
   * drop any query string. "page" prefixes them so they travel back to the
   * homepage from /privacy and /terms.
   */
  variant?: "home" | "page";
};

export function Header({ variant = "home" }: Props) {
  const to = (hash: string) => (variant === "home" ? hash : `/${hash}`);

  return (
    <header className="rph-header">
      <a href={to("#top")} className="rph-brand">
        <RedPlanetMark />
        <span className="rph-brand__name">Red Planet</span>
      </a>
      <nav className="rph-nav">
        <a href={to("#atlas")}>Atlas</a>
        <a href={to("#engine")}>How it works</a>
        <a href={to("#products")}>Atlas</a>
        <a href={to("#coverage")}>Coverage</a>
        <a
          href="https://docs.redplanetdata.com"
          target="_blank"
          rel="noopener"
        >
          Documentation
        </a>
        {/* LAND-1.2: the Atlas sign-in, at the shell's Vercel address until a redplanetdata.com record exists for it. */}
        <a href="https://atlas-umber-pi.vercel.app/login">Sign in</a>
        <ThemeToggle />
        <a href={to("#contact")} className="rph-pill-cta">
          Get in touch
        </a>
      </nav>
    </header>
  );
}
