import { ContactTrigger } from "@/components/ContactTrigger";
import { LegalFooter } from "@/components/LegalFooter";

export function GetInTouch() {
  return (
    <section id="contact" className="rph-contact">
      <div className="rph-contact__inner">
        <div className="rph-kicker rph-kicker--moss">
          &sect; 07 &mdash; Get in touch
        </div>
        <div className="rph-contact__row">
          <div>
            <h2 className="rph-contact__h2">Get in touch.</h2>
            <p className="rph-contact__sub">
              Tell us what you&rsquo;re looking for and we&rsquo;ll show you
              what we have.
            </p>
          </div>
          <ContactTrigger className="rph-cta">
            Start the conversation
          </ContactTrigger>
        </div>
      </div>
      <LegalFooter />
    </section>
  );
}
