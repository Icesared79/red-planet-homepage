import { ContactTrigger } from "@/components/ContactTrigger";

export function GetInTouch() {
  return (
    <section id="contact" className="rph-contact">
      <div className="rph-kicker rph-kicker--moss">
        &sect; 07 &mdash; Get in touch
      </div>
      <div className="rph-contact__row">
        <div>
          <h2 className="rph-contact__h2">Get in touch.</h2>
          <p className="rph-contact__sub">
            Tell us what you&rsquo;re looking for and we&rsquo;ll show you what
            we have.
          </p>
        </div>
        <ContactTrigger className="rph-cta">
          Start the conversation
        </ContactTrigger>
      </div>
      <div className="rph-footer">
        <span>Red Planet Data</span>
        <span>&copy; 2026</span>
      </div>
    </section>
  );
}
