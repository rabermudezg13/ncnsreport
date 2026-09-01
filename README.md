# NCNS Report

NCNS Report is an internal substitute-attendance application for recording **No Call / No Show** and **Late Cancellation** incidents. It provides protected role-based access, duplicate substitute detection, incident history, repeat-offender indicators, schools, reporting, and CSV export.

## Stack

React 19, TypeScript, Vite, Tailwind CSS, shadcn-style accessible components, React Router, React Hook Form, Zod, Firebase Authentication, Cloud Firestore, Firebase Hosting, Recharts, and TanStack Table.

## Local setup

```bash
git clone https://github.com/rabermudezg13/ncnsreport.git
cd ncnsreport
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local` with the Firebase web app values from **Firebase Console → Project settings → Your apps**. Environment files are ignored by Git; the Firebase web configuration identifies a project but authorization is enforced by Authentication and Firestore Security Rules.

## Firebase configuration

1. Create or select a Firebase project.
2. Add a Web app and copy its configuration into `.env.local`.
3. Open **Authentication → Sign-in method** and enable **Email/Password**.
4. Open **Firestore Database**, create the production database, and choose the appropriate region.
5. Install the Firebase CLI and connect the local repository:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore
```

The data model uses `users`, `substitutes`, `incidents`, `schools`, `settings/general`, and `substitutes/{id}/notes`. Composite indexes are declared in `firestore.indexes.json`.

## Create the first administrator

1. In Firebase Authentication, create an Email/Password user.
2. Copy the user's UID.
3. In the Firestore console, create `users/{UID}` with:

```text
firstName: "First"
lastName: "Admin"
email: "admin@example.org"
role: "admin"
active: true
createdAt: server timestamp
updatedAt: server timestamp
```

Use the Firebase console or Admin SDK for this one-time bootstrap. Do not store passwords in Firestore. After bootstrap, only admins may manage user profile documents; Authentication account creation remains an intentional Firebase Console/Admin SDK operation so the browser never handles other users' passwords.

Supported roles are `admin`, `manager`, `staff`, and `read_only`. Inactive profiles are denied by both the app and database rules.

## Build and deploy

```bash
npm run build
firebase deploy
```

Firebase Hosting serves `dist` and rewrites client routes to `index.html`. Deployments include Hosting, Firestore rules, and indexes. Review index creation in Firebase Console because new composite indexes can take several minutes to become ready.

## Security notes

- Every application route requires an authenticated, active Firestore profile.
- Firestore rules independently enforce roles; frontend checks are only user experience controls.
- Read Only users cannot write. Staff can create incidents and notes. Managers and admins can edit incidents and manage schools. Only admins can manage profiles/settings.
- Incident types are restricted to `no_call_no_show` and `late_cancellation` in TypeScript and Firestore rules.
- Incident creation uses a Firestore transaction to create/update the substitute, create the incident, and update counters atomically.
- Production user provisioning should use a trusted Admin SDK process or Firebase Console.

## Manual production checklist

- Configure the real Firebase environment variables in the hosting build environment.
- Enable Email/Password Authentication and create the initial admin.
- Deploy and verify Firestore rules/indexes before inviting users.
- Add active schools and verify organizational role assignments.
- Test each role with a separate account in the production Firebase project.
