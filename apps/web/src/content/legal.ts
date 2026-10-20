/**
 * Terms of Use and Privacy Policy, written to match what the app actually does (TECH_DESIGN,
 * docs/LAUNCH_SETUP.md section 2). Review them with someone qualified before a public launch,
 * and update LAST_UPDATED whenever they change.
 *
 * The contact address comes from VITE_CONTACT_EMAIL (build setting), so it is never hard-coded.
 */
export const LAST_UPDATED = '11 October 2026';

export const CONTACT_EMAIL = (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) || '';

export type LegalSection = { heading: string; body: string[] };
export type LegalDoc = { title: string; intro: string; sections: LegalSection[] };

const contact = () => (CONTACT_EMAIL ? CONTACT_EMAIL : 'the contact address shown in the app store listing');

export const privacy = (): LegalDoc => ({
  title: 'Privacy Policy',
  intro:
    'Pune Explorer is a travel guide for Pune with an SOS feature. This policy explains what personal data the app collects, why, who it is shared with, how long it is kept and the rights you have under India’s Digital Personal Data Protection Act, 2023.',
  sections: [
    {
      heading: 'What we collect and why',
      body: [
        'Account: your name, and your email address and/or mobile number, so you can sign in and recover your account. Passwords are stored only as a one-way hash. If you sign in with Google we receive your name, email and Google account id.',
        'Location: used on your phone to show places, hospitals and police near you, and sent to our server for those searches and for directions. Your location history is not stored.',
        'SOS and live trip sharing: when you start an SOS or share a trip, your live location is sent to our safety service so the people you chose can follow it through a private link. It is kept for at most 24 hours. The start of each SOS (time and place) is recorded so the alert can be delivered once and audited.',
        'Emergency contacts: the names and mobile numbers you add, used only to send them your SOS, “I’m safe”, trip and test messages. By adding someone you confirm they agree to receive these messages.',
        'Medical information (optional): blood group, allergies, medicines and notes. It is encrypted on our server and included only in the SOS text sent to your emergency contacts.',
        'Profile photo (optional): re-encoded on upload, which removes location and camera details from the file.',
        'Plans, saved places, stamps and XP: to provide those features.',
        'Technical logs: time, request id, page path and result of each request, kept 14 to 30 days for security and fixing faults. They never contain passwords, codes, tokens, medical information or message text, and phone numbers are masked.',
      ],
    },
    {
      heading: 'On your phone',
      body: [
        'The app keeps your theme, language, settings, last known position, a copy of your emergency contacts (so SOS can text them with no internet) and any offline packs on your device. Signing out keeps the contact copy and offline packs so SOS keeps working; deleting your account removes the contact copy and position.',
        'No login tokens are kept in browser storage. In the Android app the sign-in token is encrypted with a key held by Android, and app data is excluded from cloud backups.',
      ],
    },
    {
      heading: 'Who we share it with',
      body: [
        'We do not sell personal data or use it for advertising. We share only what each service needs to do its job:',
        'SMS provider (Twilio or MSG91): your contacts’ numbers and the message text, to deliver SOS and other messages, and your number to send login codes.',
        'Email provider (Resend): your email address, to send password-reset emails.',
        'Google: only if you choose “Continue with Google”.',
        'Google Maps: place photos, ratings, opening hours and side quests come from Google Maps. Our server asks Google about a place without your identity; your device loads the photos directly from Google, so Google sees your IP address. Google’s Privacy Policy (policies.google.com/privacy) applies to that.',
        'Map tile provider: your device loads map images directly from it, so it sees your IP address and the map area on screen.',
        'Routing and address search (OpenStreetMap-based services): our server sends them the start and end points of a route or the text you search, without your identity.',
        'Error reporting (Sentry): crash details with personal data removed (no request contents, IP addresses or account details).',
        'Hosting: our servers and database run with a cloud provider (Google Cloud) that stores the data on our behalf.',
        'Emergency services are never contacted by the app automatically: the SOS button opens your phone’s dialer with 112.',
        'We may disclose data where Indian law requires it.',
      ],
    },
    {
      heading: 'How long we keep it',
      body: [
        'Account data, contacts, medical information and plans: until you delete them or your account.',
        'Live location: at most 24 hours. SOS records: until you delete your account. Message delivery records: kept with masked numbers only.',
        'Logs: 14 to 30 days. Backups roll over within 30 days.',
      ],
    },
    {
      heading: 'Your rights',
      body: [
        'You can see and correct your data in the app (Profile, Emergency contacts, Medical info), and delete your account at any time in Settings → Sign out → Delete my account. Deletion removes your account, contacts, medical information, plans, photo, sessions and SOS records.',
        `For any other request (a copy of your data, a correction, a complaint, or naming someone to act for you), write to ${contact()}. We reply within 30 days. If you are not satisfied, you can complain to the Data Protection Board of India.`,
      ],
    },
    {
      heading: 'Children',
      body: ['The app is meant for people aged 18 and over. Younger people should use it only with a parent or guardian, who consents on their behalf.'],
    },
    {
      heading: 'Security',
      body: [
        'Connections are encrypted (HTTPS). Passwords, login codes and reset links are stored only in hashed form; medical information is encrypted; sign-in tokens are short-lived and rotate. No method is perfect: if we learn of a breach affecting you, we will tell you and the Data Protection Board as the law requires.',
      ],
    },
    {
      heading: 'Changes and contact',
      body: [`We will show a notice in the app before material changes take effect. Questions: ${contact()}.`],
    },
  ],
});

export const terms = (): LegalDoc => ({
  title: 'Terms of Use',
  intro: 'By creating an account or using Pune Explorer you agree to these terms. If you do not agree, please do not use the app.',
  sections: [
    {
      heading: 'Pune Explorer is not an emergency service',
      body: [
        'In an emergency, call 112 directly. The SOS feature opens your phone’s dialer with 112 and, where possible, alerts the contacts you chose. Calls, texts, location and internet depend on your phone, its settings, your network and third-party providers, which we do not control. We cannot guarantee that a message is delivered, that a location is accurate, or that help arrives.',
        'Hospital, police and fire-station details come from OpenStreetMap and may be incomplete or out of date.',
      ],
    },
    {
      heading: 'Places, routes and information',
      body: [
        'Opening hours, entry fees, routes and travel times are a guide only. Check with the place before you go, follow local rules and signs, and take care on treks and at forts.',
      ],
    },
    {
      heading: 'Your account',
      body: [
        'Give accurate details and keep your password and phone secure. You are responsible for what happens under your account. Only add people as emergency contacts who have agreed to receive messages from you.',
        'You may delete your account at any time in the app.',
      ],
    },
    {
      heading: 'Acceptable use',
      body: [
        'Do not misuse the SOS or test-alert features (for example, false alarms or messaging people who did not agree), try to break or overload the service, access other people’s data, or use the app against the law.',
        'We may suspend accounts that do this.',
      ],
    },
    {
      heading: 'The service',
      body: [
        'The app is provided “as is” and may change, pause or stop. Map data © OpenStreetMap contributors. Place photos, ratings, opening hours and side quests are from Google Maps; by using them you also agree to the Google Maps Additional Terms of Service (maps.google.com/help/terms_maps) and Google’s Privacy Policy (policies.google.com/privacy). They may be incomplete or out of date: check before you travel. To the extent the law allows, we are not liable for indirect losses arising from use of the app, and nothing in these terms limits rights you have under Indian consumer law.',
      ],
    },
    {
      heading: 'Law and contact',
      body: [`These terms are governed by the laws of India, and the courts at Pune have jurisdiction. Questions: ${contact()}.`],
    },
  ],
});
