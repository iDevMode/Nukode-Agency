import React, { useEffect } from 'react';
import { ArrowLeft, Code } from 'lucide-react';
import { Footer } from './Footer';
import { CookieConsent } from './CookieConsent';

const CONTACT_EMAIL = 'phil@nukode.co.uk';
const LAST_UPDATED = '7 November 2026';

type Section = { heading: string; body: React.ReactNode };

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-nukode-muted leading-relaxed mb-4">{children}</p>
);

const UL: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul className="list-disc pl-6 space-y-2 text-nukode-muted leading-relaxed mb-4">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);

const Mail = () => (
  <a href={`mailto:${CONTACT_EMAIL}`} className="text-white underline underline-offset-4">
    {CONTACT_EMAIL}
  </a>
);

const privacySections: Section[] = [
  {
    heading: 'Who we are',
    body: (
      <P>
        Nukode is a trading name of Phil Shields, a sole trader based in the United Kingdom. Phil Shields is the
        controller of the personal data described in this policy. You can contact us about anything in this policy
        at <Mail />.
      </P>
    ),
  },
  {
    heading: 'What we collect',
    body: (
      <UL
        items={[
          <>
            <strong className="text-white font-medium">Audit and enquiry forms</strong> (run on Typeform): your
            name, company, role, email, phone number, and the information you give about your business, such as
            team size, revenue band, processes and budget.
          </>,
          <>
            <strong className="text-white font-medium">Call bookings</strong> (run on Calendly): your name, email,
            the time you book and any answers you give when booking.
          </>,
          <>
            <strong className="text-white font-medium">Emails and messages</strong> you send us, and our replies.
          </>,
          <>
            <strong className="text-white font-medium">Business contact details</strong> of people we may contact
            about our services, taken from public sources such as company websites and business directories,
            including Apollo.io.
          </>,
          <>
            <strong className="text-white font-medium">Website visit data</strong>: our hosting provider records
            technical data such as IP address and browser type to run and secure the site. If you accept analytics
            cookies, Apollo.io may identify the company associated with your IP address and the pages you view.
          </>,
        ]}
      />
    ),
  },
  {
    heading: 'How we use it and our lawful basis',
    body: (
      <UL
        items={[
          'To respond to your enquiry, prepare your automation audit and hold calls with you: taking steps at your request before a contract, and our legitimate interest in replying to people who contact us.',
          'To deliver and invoice for work we do for clients: performance of a contract, and legal obligations such as keeping tax records.',
          'To contact businesses about services that may be relevant to them: our legitimate interest in promoting our business. Every message includes a simple way to opt out, and we stop when you ask.',
          'To understand which companies visit our website: your consent, given through the cookie banner. You can change your choice at any time using Cookie Settings at the foot of each page.',
          'To keep our website secure and working: our legitimate interest in running a reliable service.',
        ]}
      />
    ),
  },
  {
    heading: 'AI processing of audit answers',
    body: (
      <P>
        When you complete our automation audit, your answers are analysed by an AI model (Google Gemini) to draft
        your report. The report is an estimate to support a conversation; no decision with legal or similarly
        significant effects is made about you automatically.
      </P>
    ),
  },
  {
    heading: 'Who we share it with',
    body: (
      <>
        <P>
          We do not sell your personal data. We use these service providers, who process data on our behalf under
          contract:
        </P>
        <UL
          items={[
            'Vercel (website hosting)',
            'Typeform (forms)',
            'Calendly (call scheduling)',
            'Google (Gemini AI analysis, Google Workspace email and Google Fonts on this website)',
            'SendGrid by Twilio (sending audit reports and booking emails)',
            'Supabase (secure storage of audit submissions)',
            'Apollo.io (business contact data and, with your consent, website visitor analytics)',
          ]}
        />
        <P>
          Some of these providers are based in or store data in the United States. Where data leaves the UK, we rely
          on safeguards recognised under UK law, such as the UK–US data bridge or the UK International Data Transfer
          Addendum.
        </P>
      </>
    ),
  },
  {
    heading: 'How long we keep it',
    body: (
      <UL
        items={[
          'Enquiries, audit submissions and call notes: up to 24 months after our last contact, unless you become a client.',
          'Client and invoicing records: 6 years after the end of the tax year they relate to, as required by HMRC.',
          'Business contact details used for outreach: up to 12 months unless you reply or ask us to stop, in which case we keep only what we need to make sure we do not contact you again.',
        ]}
      />
    ),
  },
  {
    heading: 'Your rights',
    body: (
      <>
        <P>
          You can ask us to give you a copy of your data, correct it, delete it, restrict or object to how we use
          it, or move it to another provider. You can withdraw consent at any time. To make a request, email{' '}
          <Mail />. We will reply within one month.
        </P>
        <P>
          If you are unhappy with how we handle your data, please tell us first. You also have the right to complain
          to the Information Commissioner's Office at{' '}
          <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-4">
            ico.org.uk
          </a>
          .
        </P>
      </>
    ),
  },
  {
    heading: 'Cookies',
    body: (
      <P>
        This site uses one optional analytics tool (Apollo.io) that only loads if you click Accept on the cookie
        banner. We store your choice in your browser so we don't ask again. Typeform and Calendly open in their own
        pages and set their own cookies under their own policies.
      </P>
    ),
  },
  {
    heading: 'Changes to this policy',
    body: <P>We will update this page if how we use personal data changes. The date below shows the latest version.</P>,
  },
];

const termsSections: Section[] = [
  {
    heading: 'About these terms',
    body: (
      <P>
        These terms cover your use of nukode.co.uk. The website is run by Phil Shields, a sole trader trading as
        Nukode, based in the United Kingdom. By using the site you accept these terms. Contact: <Mail />.
      </P>
    ),
  },
  {
    heading: 'Our services',
    body: (
      <P>
        Information on this site describes the kinds of automation work we do. Any project we take on is governed by
        a separate written proposal or agreement, which takes priority over anything on this website.
      </P>
    ),
  },
  {
    heading: 'Free audits and ROI estimates',
    body: (
      <P>
        Our free automation audit, ROI figures and any report we send are estimates based on the information you
        provide and general assumptions. They are for guidance only and are not a guarantee of results, nor
        financial, legal or tax advice. Please check figures against your own records before making decisions.
      </P>
    ),
  },
  {
    heading: 'Using this website',
    body: (
      <UL
        items={[
          'You may view and share pages from this site for your own business purposes.',
          'You must not misuse the site, for example by attempting to gain unauthorised access, introducing malicious code or submitting false information through our forms.',
          'The content, design and branding on this site belong to Nukode unless stated otherwise. Third-party names and logos belong to their owners.',
        ]}
      />
    ),
  },
  {
    heading: 'Links to other sites',
    body: (
      <P>
        Our site links to services such as Typeform and Calendly. We are not responsible for the content or
        policies of other websites.
      </P>
    ),
  },
  {
    heading: 'Our liability',
    body: (
      <P>
        We take care to keep this site accurate and available, but we do not promise it will always be error-free
        or uninterrupted. To the extent the law allows, we are not liable for any loss arising from your use of the
        website or reliance on its content. Nothing in these terms limits liability for death or personal injury
        caused by negligence, for fraud, or for anything else that cannot be limited by law.
      </P>
    ),
  },
  {
    heading: 'Governing law',
    body: (
      <P>
        These terms are governed by the law of England and Wales, and the courts of England and Wales have
        jurisdiction over any dispute.
      </P>
    ),
  },
];

export const LegalPage: React.FC<{ kind: 'privacy' | 'terms' }> = ({ kind }) => {
  const title = kind === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
  const sections = kind === 'privacy' ? privacySections : termsSections;

  useEffect(() => {
    document.title = `${title} | Nukode`;
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <main className="min-h-screen bg-nukode-black selection:bg-white selection:text-black">
      <header className="border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <Code className="w-6 h-6 text-white" strokeWidth={3} />
            <span className="text-xl font-sans font-bold tracking-tight text-white">Nukode</span>
          </a>
          <a href="/" className="flex items-center gap-2 text-sm text-nukode-muted hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to site
          </a>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-3">{title}</h1>
        <p className="text-sm text-nukode-muted mb-12">Last updated {LAST_UPDATED}</p>
        {sections.map((s) => (
          <section key={s.heading} className="mb-10">
            <h2 className="text-xl font-medium text-white mb-4">{s.heading}</h2>
            {s.body}
          </section>
        ))}
      </article>

      <Footer />
      <CookieConsent />
    </main>
  );
};
