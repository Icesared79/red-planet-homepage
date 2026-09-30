import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Privacy Policy | Red Planet Data",
  description:
    "How Red Planet Data handles information collected through redplanetdata.com.",
};

export default function PrivacyPage() {
  return (
    <>
      <div className="rph-page">
        <Header variant="page" />
        <main className="rph-doc">
          <div className="rph-doc__inner">
            <h1>Privacy Policy</h1>
            <p className="rph-doc__lede">
              This policy explains what Red Planet Data collects through
              redplanetdata.com, why, and who else handles it.
            </p>
            <p className="rph-doc__updated">Last updated September 2026</p>

            <h2>Who we are</h2>
            <p>
              Red Planet Data builds and operates Atlas, a data intelligence
              engine, and the platforms built on it. In this policy
              &ldquo;we&rdquo; and &ldquo;us&rdquo; mean Red Planet Data, and
              &ldquo;this site&rdquo; means redplanetdata.com. You can reach us
              at{" "}
              <a href="mailto:hello@redplanetdata.com">
                hello@redplanetdata.com
              </a>
              .
            </p>

            <h2>What this policy covers</h2>
            <p>
              It covers this website only. Access to Atlas, TeleAcre or Signal
              is governed by the written agreement under which that access is
              granted, and the handling of records inside those platforms is
              addressed there rather than here.
            </p>

            <h2>What we collect</h2>
            <p>
              <strong>What you send us.</strong> If you use the contact form on
              this site, we receive the topic you chose, your name, your email
              address, and your message. Company, and the markets or product
              you named, are optional and only reach us if you fill them in. We
              do not ask for and do not want payment details or any sensitive
              personal information through this form.
            </p>
            <p>
              <strong>What the server records.</strong> Our hosting provider
              records ordinary request information for every visit, including
              IP address, browser and device type, the pages requested and the
              time of the request. This is used to operate and secure the site.
            </p>
            <p>
              <strong>What we do not do.</strong> This site sets no advertising
              cookies, runs no third-party analytics or tracking scripts, and
              does not build profiles of visitors. We do not sell or rent
              information collected here, and we do not share it for anyone
              else&rsquo;s marketing.
            </p>

            <h2>What is stored on your device</h2>
            <p>
              Two preferences are kept in your browser&rsquo;s local storage so
              the site behaves the way you left it: your choice of the light or
              dark theme, and, if you have used it, the motion setting. Both
              stay on your device, are never sent to us, and clearing your
              browser data removes them.
            </p>

            <h2>How we use what you send</h2>
            <ul>
              <li>To answer you.</li>
              <li>
                To understand which markets and which platforms are being asked
                for, which informs where coverage is expanded next.
              </li>
              <li>
                To keep a record of the conversation so a later reply has its
                context.
              </li>
            </ul>
            <p>
              We rely on our legitimate interest in responding to business
              enquiries, and on your consent where the law requires it.
            </p>

            <h2>Who else handles it</h2>
            <p>
              We use a small number of service providers, each of which handles
              information only to provide its service to us:
            </p>
            <ul>
              <li>
                <strong>Vercel</strong> hosts this site and generates the server
                logs described above.
              </li>
              <li>
                <strong>Supabase</strong> stores contact form submissions.
              </li>
              <li>
                <strong>Resend</strong> delivers the notification email that
                tells us a submission has arrived.
              </li>
            </ul>
            <p>
              These providers operate in the United States. We may also disclose
              information where the law requires it, or to establish or defend a
              legal claim.
            </p>

            <h2>How long we keep it</h2>
            <p>
              Contact submissions are kept while there is a business reason to
              keep them, and are deleted on request. Server logs are retained on
              our provider&rsquo;s ordinary schedule.
            </p>

            <h2>Your choices</h2>
            <p>
              Write to{" "}
              <a href="mailto:hello@redplanetdata.com">
                hello@redplanetdata.com
              </a>{" "}
              to ask what we hold about you, to have it corrected, or to have it
              deleted. Depending on where you live you may also have the right
              to object to or restrict how we use it, to receive a copy in a
              portable form, or to complain to your data protection authority.
              We will not treat you differently for exercising any of these.
            </p>

            <h2>Children</h2>
            <p>
              This site is intended for business use and is not directed to
              children. We do not knowingly collect information from anyone
              under 16.
            </p>

            <h2>Changes</h2>
            <p>
              We update this policy when our practices change. The date above
              shows when it was last revised.
            </p>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
