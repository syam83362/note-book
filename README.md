# DevLearn

DevLearn is a private learning workspace for DevOps, DevSecOps, and AI. Firebase
is used only for Google Authentication. Learning areas, topics, notes, and
contributor profiles are stored in project JSON files under `data/`.

## Run locally

1. Create a Firebase project, enable **Authentication → Sign-in method →
   Google**, and add your development host under **Authentication → Settings →
   Authorized domains**. Do not create or configure a Firebase database.
2. Copy `.env.example` to `.env.local` and set the Firebase web app
   Authentication configuration:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

   These are Firebase web-app configuration values, not service-account
   credentials. Never put a service-account key in a `NEXT_PUBLIC_` variable.
3. Install dependencies and start the development server:

   ```bash
   npm install
   npm run dev
   ```

4. Sign in, copy your Firebase UID from the Profile page, and add a profile to
   `data/users.json`:

   ```json
   [
     {
       "uid": "paste-the-exact-firebase-uid-here",
       "name": "Your name",
       "email": "you@example.com",
       "avatarUrl": null,
       "active": true
     }
   ]
   ```

   This file is the local allowlist and contributor-profile source. Only active
   UIDs can access the authenticated data handlers. The app cannot add itself
   to the allowlist.

Open [http://localhost:3000](http://localhost:3000).

## JSON data layout

- `data/areas.json` contains learning-area names and dashboard metadata.
- `data/topics.json` contains topic metadata and links each topic to a note file.
- `data/notes/<area>/<topic>.json` contains topic notes. The Docker
  fundamentals guide uses structured sections with required titles and
  descriptions, optional code examples, and optional manually entered output.
- `data/users.json` contains the known-user allowlist and contributor display
  details.

The UI calls the service layer in `src/lib/data/`; components do not import
note files. This leaves a clear seam for replacing the local JSON repository
with a trusted server/API implementation later.

## Editing and deployment limitation

The authenticated Next.js handlers can write topic metadata and notes to the
local JSON files while running with `npm run dev`. The Docker guide can be
edited in the app as notebook-style text and code cells; code is displayed as
an example and is never executed. Revision checks reject stale saves, and Git
can track and review the resulting file changes.

This is a local-development workflow, not browser-to-GitHub editing. The write
handlers reject writes outside development mode. A deployed browser cannot
safely modify files in a Git repository; deployed editing requires a separately
designed trusted API/write service. A deployment also needs a Next.js-compatible
server for the authenticated data handlers; a static-only host cannot serve
these protected API routes.
