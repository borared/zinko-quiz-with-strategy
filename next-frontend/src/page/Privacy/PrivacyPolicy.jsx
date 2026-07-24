import Link from 'next/link';
import PrivacyFloatingDecor from '@/components/Privacy/PrivacyFloatingDecor';

const sections = [
  {
    title: '1. Introduction',
    body: (
      <p>
        Zinko (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is a quiz and learning game platform.
        This Privacy Policy explains what information we collect, how we use it, and the choices you have
        when you use zinko.app and related services (the &quot;Service&quot;).
      </p>
    ),
  },
  {
    title: '2. Information We Collect',
    body: (
      <>
        <p className="mb-4">We collect only what we need to run the Service:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Account information</strong> — When you sign up or sign in, we receive basic profile
            details (such as your name and email) through Clerk, our authentication provider.
          </li>
          <li>
            <strong>Quiz content</strong> — Titles, questions, answers, cover images, and settings for quizzes
            you create or save.
          </li>
          <li>
            <strong>Gameplay data</strong> — Nicknames, scores, team choices, and session activity when you
            host or join a live game.
          </li>
          <li>
            <strong>Technical data</strong> — Standard server logs (IP address, browser type, timestamps) used
            for security and reliability.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '3. How We Use Your Information',
    body: (
      <ul className="list-disc pl-6 space-y-2">
        <li>Create and manage your account</li>
        <li>Store, display, and run your quizzes and live games</li>
        <li>Improve performance, fix bugs, and keep the Service secure</li>
        <li>Respond to support requests you send us</li>
      </ul>
    ),
  },
  {
    title: '4. Cookies',
    body: (
      <p>
        We use only essential cookies required for authentication and to keep you signed in. We do not use
        advertising or third-party tracking cookies. Clerk may set session cookies as part of sign-in; see{' '}
        <a
          href="https://clerk.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zk-blue underline underline-offset-2 hover:text-zk-purple"
        >
          Clerk&apos;s Privacy Policy
        </a>{' '}
        for details on how they handle auth data.
      </p>
    ),
  },
  {
    title: '5. Sharing Your Information',
    body: (
      <>
        <p className="mb-4">
          <strong>We do not sell your personal information.</strong> We share data only when necessary:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Service providers</strong> — Such as Clerk (authentication) and our hosting infrastructure,
            under contracts that limit use to providing the Service.
          </li>
          <li>
            <strong>Public quizzes</strong> — If you publish a quiz to Discovery, its title and content are
            visible to other users as you intended.
          </li>
          <li>
            <strong>Legal requirements</strong> — When required by law or to protect the rights and safety of
            users.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '6. Data Retention',
    body: (
      <p>
        We keep your account and quiz data while your account is active. If you delete quizzes or close your
        account, we remove or anonymize associated data within a reasonable period, except where we must retain
        it for legal or security reasons.
      </p>
    ),
  },
  {
    title: '7. Your Choices & Rights',
    body: (
      <ul className="list-disc pl-6 space-y-2">
        <li>Update profile details through your account settings</li>
        <li>Delete quizzes you created from your dashboard</li>
        <li>Request access, correction, or deletion of your data by contacting us (see below)</li>
      </ul>
    ),
  },
  {
    title: '8. Children & Students',
    body: (
      <p>
        Zinko is used in classrooms and study groups. Teachers and hosts are responsible for obtaining any
        consent required before students join a game. We collect only the nickname and gameplay data needed for
        a session; students do not need a full Zinko account to play.
      </p>
    ),
  },
  {
    title: '9. Changes to This Policy',
    body: (
      <p>
        We may update this Privacy Policy from time to time. We will post the revised version on this page and
        update the &quot;Last updated&quot; date. Continued use of the Service after changes means you accept
        the updated policy.
      </p>
    ),
  },
  {
    title: '10. Contact Us',
    body: (
      <p>
        Questions about this policy or your data? Email us at{' '}
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

export default function PrivacyPolicy() {
  return (
    <div className="flex-1 w-full bg-zk-yellow relative overflow-hidden pt-12 pb-16 font-sans min-h-[80vh]">
      <PrivacyFloatingDecor />
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12">
          <p className="text-sm font-bold uppercase tracking-wider text-zk-purple mb-3">Legal</p>
          <h1
            className="text-4xl sm:text-5xl font-bold text-zk-black mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Privacy Policy
          </h1>
          <p className="text-sm text-zk-black/60 mb-10">Last updated: June 30, 2026</p>

          <div className="space-y-10 text-zk-black/90 leading-relaxed">
            {sections.map((section) => (
              <section key={section.title}>
                <h2
                  className="text-xl font-bold text-zk-black mb-3"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {section.title}
                </h2>
                <div className="text-base">{section.body}</div>
              </section>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t-2 border-zk-black/10">
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