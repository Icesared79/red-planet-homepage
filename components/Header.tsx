import { RedPlanetMark } from "@/components/Marks";

export function Header() {
  return (
    <header className="rph-header">
      <a href="#top" className="rph-brand">
        <RedPlanetMark />
        <span className="rph-brand__name">Red Planet</span>
      </a>
      <nav className="rph-nav">
        <a href="#atlas">Atlas</a>
        <a href="#engine">How it works</a>
        <a href="#products">Platforms</a>
        <a href="#coverage">Coverage</a>
        <a href="https://docs.redplanetdata.com">Documentation</a>
        <a href="#contact" className="rph-pill-moss">
          Get in touch
        </a>
      </nav>
    </header>
  );
}
