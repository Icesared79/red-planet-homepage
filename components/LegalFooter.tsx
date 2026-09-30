import { RedPlanetMark } from "@/components/Marks";

type Props = {
  /**
   * True when the footer is the only closing band on the page, so it takes
   * the rounded top the § 07 band would otherwise have carried. On the
   * homepage it follows that band and sits flush beneath it.
   */
  standalone?: boolean;
};

export function LegalFooter({ standalone = false }: Props) {
  return (
    <footer
      className={`rph-legal${standalone ? " rph-legal--standalone" : ""}`}
    >
      <div className="rph-legal__inner">
        <div className="rph-legal__top">
          <div>
            <span className="rph-legal__brand">
              <RedPlanetMark size={15} />
              Red Planet Data
            </span>
            <p className="rph-legal__notice">
              Red Planet Data builds and operates Atlas and the platforms built
              on it. Red Planet, Atlas, TeleAcre and Signal are trademarks of
              Red Planet Data. Records and analysis presented on this site and
              in its platforms are supplied for business information, and are
              not legal, financial, title or investment advice.
            </p>
          </div>
          <nav className="rph-legal__links" aria-label="Legal">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Use</a>
            <a href="mailto:hello@redplanetdata.com">
              hello@redplanetdata.com
            </a>
          </nav>
        </div>
        <div className="rph-legal__bar">
          <span>&copy; 2026 Red Planet Data. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
