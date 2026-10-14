# ÀWA Yorùbá

ÀWA Yorùbá is a Yoruba learning platform designed especially for children in diaspora families. The product combines tutor-led learning, structured courses, and a growing regional-language and cultural library.

## Product areas

- **Tutor marketplace** — tutor profiles, booking, payment, reviews, and learning credits.
- **Dialect catalogue** — community-reviewed entries about regional Yoruba varieties and their contexts.
- **Cultural library** — stories, proverbs, songs, vocabulary, conversations, transcripts, translations, and audio.
- **Welcome challenge** — the existing Yoruba quiz and learning-credit flow.

The dialect and cultural library is the first step in a larger evolution. Course modules, lessons, and learner progress will be added in a later phase.

## Local development

Requirements: Node.js compatible with the installed Next.js version, npm, and a PostgreSQL database.

```bash
npm install
`npm run dev`
```

Open [http://localhost:3000](http://localhost:3000).

Configure `.env` with the database values used by the project:

```env
DATABASE_URL="..."
DIRECT_URL="..."
```

Do not commit real credentials or copy production secrets into a shared environment.

## Dialect and cultural library database change

The additive migration is:

`prisma/migrations/20261014000000_add_dialect_cultural_library/migration.sql`

It adds `Dialect`, `CulturalResource`, and `ResourceDialect` without renaming or deleting existing tutor, learner, booking, payment, wallet, or challenge data.

After pulling the feature branch, inspect the migration and confirm the target database before applying it:

```bash
npx prisma validate
npx prisma generate
npx prisma migrate status
npx prisma migrate deploy
```

Use `npx prisma migrate dev --name add_dialect_cultural_library` only when intentionally generating a migration in local development. The reviewed migration is already checked in, so do not generate a second migration for the same change.

## Public publishing rules

The public catalogue endpoints expose only records whose status is `PUBLISHED`. Cultural resources also need `consentRecorded = true` and a `rightsStatus` of `ORIGINAL`, `PUBLIC_DOMAIN`, `LICENSED`, or `PERMISSION_GRANTED`.

Use these fields as a release checklist, not as a substitute for real editorial review:

- Confirm the spelling, tone marks, translation, pronunciation, and cultural context with a knowledgeable speaker.
- Record contributor/source attribution and confirm the right to publish the material, including audio and images.
- Record consent where a contributor or performer has provided material.
- Set `reviewedBy` and `reviewedAt` after language/cultural review.
- Keep incomplete or disputed entries in `DRAFT` until reviewed.

There is currently no public write endpoint or editorial admin interface for this catalogue. Do not expose unauthenticated create/update endpoints; an authenticated editor workflow is a later task. Add content through a controlled seed/import or trusted database operation only after review.

## Main routes

- `/tutors` — tutor marketplace
- `/challenge` — existing Yoruba welcome challenge
- `/dialects` — published dialect catalogue
- `/dialects/[slug]` — dialect entry and related resources
- `/library` — published cultural resources and type filters
- `/library/[slug]` — resource detail, text, translation, and optional audio

## Build

```bash
npx prisma generate
npm run build
```

The build and migration should be verified locally against a disposable/test database before merging or applying changes to production.
