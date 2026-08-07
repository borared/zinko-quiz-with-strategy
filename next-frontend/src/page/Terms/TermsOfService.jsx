import Link from 'next/link';
import PrivacyFloatingDecor from '@/components/Privacy/PrivacyFloatingDecor';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: (
      <p>
        By accessing or using Zinko ("we," "us," or "our"), you agree to be bound by these Terms of Service.
        If you disagree with any part of the terms, you do not have permission to access the Service.
      </p>
    ),
  },
  {
    title: '2. User Accounts',
    body: (
      <ul className="list-disc pl-6 space-y-2">
        <li>You are responsible for safeguarding the password that you use to access the Service.</li>
        <li>You must not disclose your password to any third party.</li>
        <li>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
        <li>You may not use as a username the name of another person or entity that is not lawfully available for use.</li>
      </ul>
    ),
  },
  {
    title: '3. Content Creation and Usage',
    body: (
      <>
        <p className="mb-4">
          Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You retain any and all of your rights to any Content you submit or post on the Service.</li>
          <li>By posting Content to the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service.</li>
          <li>You agree that your Content will not violate any law or infringe the rights of any third party (including copyright, trademark, privacy, or personality rights).</li>
        </ul>
      </>
    ),
  },
  {
    title: '4. Subscriptions and Pro Plans',
    body: (
      <p>
        Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis. Zinko reserves the right to change the subscription fee for any subscriptions at any time with prior notice.
      </p>
    ),
  },
  {
    title: '5. Acceptable Use',
    body: (
      <p>
        You agree not to use the Service for any unlawful purpose or to solicit others to perform or participate in any unlawful acts. We reserve the right to terminate your use of the Service or any related website for violating any of the prohibited uses.
      </p>
    ),
  },
  {
    title: '6. Limitation of Liability',
    body: (
      <p>
        In no event shall Zinko, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
      </p>
    ),
  },
  {
    title: '7. Governing Law',
    body: (
      <p>
        These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which Zinko operates, without regard to its conflict of law provisions.
      </p>
    ),
  },
  {
    title: '8. Changes to Terms',
    body: (
      <p>
        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
      </p>
    ),
  },
  {
    title: '9. Contact Us',
    body: (
      <p>
        If you have any questions about these Terms, please contact us at{' '}
        <a
          href="mailto:zinkoquiz@gmail.com"
          className="text-zk-blue underline underline-offset-2 hover:text-zk-purple"
        >
          zinkoquiz@gmail.com
        </a>
        .
      </p>
    ),
  },
];

export default function TermsOfService() {
  return (
    <div className="flex-1 w-full bg-zk-bg relative overflow-hidden pt-12 pb-16 font-sans min-h-[80vh]">
      <PrivacyFloatingDecor />
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12">
          <p className="text-sm font-bold uppercase tracking-wider text-zk-purple mb-3">Legal</p>
          <h1
            className="text-4xl sm:text-5xl font-bold text-zk-text mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Terms of Service
          </h1>
          <p className="text-sm text-zk-text/60 mb-10">Last updated: June 30, 2026</p>

          <div className="space-y-10 text-zk-text/90 leading-relaxed">
            {sections.map((section) => (
              <section key={section.title}>
                <h2
                  className="text-xl font-bold text-zk-text mb-3"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {section.title}
                </h2>
                <div className="text-base">{section.body}</div>
              </section>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t-2 border-zk-border/10">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-bold text-zk-blue hover:text-zk-purple transition-colors"
            >
              ← Back to Zinko
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
