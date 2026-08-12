# Kulturbrücke Brandenburg e.V. — Website

Website for a mosque and community centre in Brandenburg an der Havel, run by a
registered German non-profit association (gemeinnütziger Verein).

This file records decisions that have already been made. They are not
suggestions. Where something here conflicts with a habit or a common default,
this file wins. If a decision seems wrong, say so before implementing something
different — do not silently substitute.

---

## Stack

| | |
| --- | --- |
| Framework | Next.js 16, App Router, React 19 |
| Language | TypeScript, strict |
| Styling | Tailwind CSS 4 — CSS-first `@theme`, no `tailwind.config.js` |
| i18n | next-intl v4 |
| Testing | Vitest |
| Validation | JSON Schema (Ajv or equivalent) |
| Tooling | npm, ESLint, Prettier |
| Output | `output: "standalone"` |

### Do not add

- **Zod** — validation is JSON Schema. Not negotiable.
- **Any prayer-time library** — see "Prayer times" below.
- **Animation or motion libraries** — nothing on this site needs them.
- **A payment provider** — donations are bank transfer only.
- **A CMS or database** — all content is hand-authored JSON in this repo.
- **State management libraries** — there is no client state worth managing.

Do not add dependencies that are not already listed without asking first.

---

## Absolute rules

1. **No prayer-time calculation in this repo.** Times are produced by a separate
   application and read from JSON. This site displays; it never computes.
2. **No Zod.**
3. **RTL is a first-class layout, not a mirror.** Use logical properties
   everywhere: `ps-*`, `pe-*`, `ms-*`, `me-*`, `border-s-*`, `text-start`,
   `text-end`. Never `pl-*`, `pr-*`, `ml-*`, `mr-*`, `text-left`, `text-right`.
4. **Palette is fixed.** Only the eleven hex values below, defined once in
   `globals.css`. Never write a hex in a component and never take a colour
   from the design tool's defaults. Tailwind opacity modifiers of these
   eleven (`border-secondary/30`, `bg-secondary/13`) are the sanctioned way
   to make a hairline or a tint — do not invent a new hex for one.
5. **Everything localizable is localized.** Missing keys fall back to English,
   per key.
6. **Never invent content.** Addresses, bank details, names, dates, contact
   information: if it is not in `config/site.json` or a message file, use a
   visible placeholder. Do not guess plausible values.
7. **One source of truth per fact.** A shape, a string, or a value is defined
   in exactly one place and imported everywhere else. Never re-declare a type
   that a schema already describes; never copy a value into a second file
   "for convenience". See "Types" below.

---

## Types

**Every type describing data on disk is generated from its JSON Schema.**

```shell
schemas/site-config.schema.json      ->  src/types/site-config.schema.d.ts
schemas/announcement.schema.json     ->  src/types/announcement.schema.d.ts
schemas/prayer-times.schema.json     ->  src/types/prayer-times.schema.d.ts
```

```bash
npm run generate:types    # json2ts -i schemas -o src/types
```

`src/types/` is build output. Never edit those files, never commit them, and
never hand-write an interface that mirrors one of them. If a shape is wrong,
the schema is wrong — fix the schema and regenerate.

Generated root type names come from each schema's `title`. Import them by
their real module path (`@/types/site-config.schema`, not
`@/types/site-config`).

**Derived types are allowed** where they describe something the file format
does not — for example the loader's `PrayerDay`, which is a `Day` from the
schema with its ISO date key attached. Derive them with `extends`, `Pick`,
`Omit` or an index into the generated type. Never restate the fields.

Run `generate:types` before `typecheck`, `build` and `test`, so a schema change
surfaces as a compile error rather than a runtime one.

---

## i18n

next-intl v4. Three locales, German is default, English is the fallback.

```ts
locales: ["de", "ar", "en"]
defaultLocale: "de"
fallbackLocale: "en"
localePrefix: "always"
```

**URLs stay German in every locale.** Only the prefix changes. Do not configure
localized pathnames.

```shell
/de/moschee/gebetszeiten
/ar/moschee/gebetszeiten
/en/moschee/gebetszeiten
```

`/moschee/hausordnung` is printed on a QR code inside the building. That path
must not change.

**Fallback** is implemented by deep-merging the English messages underneath the
active locale in `getRequestConfig`, so any missing key resolves to English
automatically. There is no per-key fallback logic anywhere else in the codebase.

```ts
messages: deepmerge(englishMessages, localeMessages)
```

**Middleware lives in `src/proxy.ts`** — Next.js 16 renamed `middleware.ts`.
Use `createMiddleware(routing)` from `next-intl/middleware`.

Every page and layout must call `setRequestLocale(locale)` or static generation
breaks.

---

## Routes

```shell
/                                homepage
/moschee                         mosque hub — the "Moschee" nav item
/moschee/gebetszeiten            prayer times
/moschee/hausordnung             house rules  (QR target — path is fixed)
/moschee/freitagsgebet           Friday prayer
/aktuelles                       announcement list, filtered by category
/aktuelles/[slug]                single announcement
/spenden                         donations
/verein/ueber-uns                mission
/verein/vorstand                 board
/verein/projekte                 project list with intro
/verein/projekte/[slug]          single project
/verein/mitglied-werden          membership
/verein/dokumente                PDF downloads
/kontakt                         contact
/impressum                       legal notice
/datenschutz                     privacy policy
```

Anything not listed returns a localized 404.

**Every route in this list exists as a real page.** A route that has no content
yet renders the shared `UnderConstruction` component with its own title passed
as a prop — one component, never a copied placeholder per page, and never a
catch-all route, which would swallow genuine 404s.

`/impressum` and `/datenschutz` get placeholder text for now. Do not draft legal
copy. Note that § 5 DDG requires a real Impressum once the site is public.

---

## Design

The design files are the source of truth for layout, hierarchy, spacing and
component structure. Three things they do not carry:

**Palette — the complete set. Nothing outside these eleven values.**

| Role | Hex |
| --- | --- |
| Primary | `#002623` |
| Primary shade | `#054239` |
| Primary shade | `#428177` |
| Secondary | `#988561` |
| Secondary shade | `#b9a779` |
| Secondary shade | `#edebe0` |
| Flair | `#260f14` |
| Flair shade | `#4a151e` |
| Flair shade | `#6b1f2a` |
| Body text | `#161616` |
| Secondary text | `#3d3a3b` |

Defined once in `globals.css` under `@theme`. Never hardcode a hex in a
component.

**Typography:**

- Amiri for Arabic, Ubuntu Sans for Latin, both via `next/font/google`
- Amiri renders optically smaller — the Arabic tree needs roughly `1.08em` and
  looser line-height to sit level with the German
- The registered name `Kulturbrücke Brandenburg e.V.` stays in Latin script and
  `dir="ltr"` in every locale, including on Arabic pages
- Two weights only

**RTL** — Arabic screens get their own review, not an assumption that mirroring
the German ones is correct.

**Language switcher** — one component, one appearance, in the navbar on every
page and every breakpoint. A dropdown showing a globe symbol plus the language
name in its own script (`Deutsch`, `العربية`, `English`). No per-page variants,
no separate desktop strip, no mobile-only pill.

---

## Configuration

`config/site.json` holds deployment and organisation metadata — name, contact,
registry, bank details, prayer times path. It is not content and not
translations. Read it through `getSiteConfig()`, never import the JSON ad hoc
in components.

Placeholder values in that file are deliberate. Leave them.

### Which name to display

The association has three names in config and they are not interchangeable:

| Field | Use |
| --- | --- |
| `org.legalName` | Only where the registered name is legally required — Impressum, footer registry line, donation recipient. Latin script, `dir="ltr"`, never translated. |
| `org.localizedName` | **Everywhere else** — header, page copy, titles. Picked by active locale. |
| `org.mosqueName` | The mosque's own pages only — the `/moschee` hub and below. Picked by active locale. |

**The site header shows the association name alone.** The mosque name does not
appear there; it belongs on the mosque pages. Clicking the logo or the name
goes to the homepage.

`localizedName` and `mosqueName` are objects keyed by language code with at
least one entry; resolve with the active locale, then the fallback locale,
then any available entry. Never assume a given language is present.

These names live in `config/site.json` only. Do not duplicate them into the
message files.

---

## Prayer times

**Generated elsewhere.** A separate application computes a full calendar year
and outputs JSON validated against `schemas/prayer-times.schema.json`. That
schema is a contract between two codebases — do not edit it here.

**This site only reads.** Resolution:

```shell
{config.prayerTimes.basePath}/{currentYear}/times.json
```

The year is derived from the current date at runtime, so a new year needs only a
new folder — no code change.

**If the file is missing, or the requested date is not in it, show an error
message telling the user no times have been uploaded.** Do not fall back to a
previous year, do not interpolate, do not compute anything.

**File shape.** `days` is an **object keyed by ISO date**, not an array. The
day entries therefore carry no date of their own — the key is the date. Any
read attaches it back on. The sunrise field is called **`shuruq`**. There is no
`jumuah` field: the Friday prayer time comes from
`config.fridayPrayer.khutbahTime`, because it is a decision of this mosque and
not astronomy.

**The Hijri date comes from the JSON**, per day, already offset by the
generator. `hijri.month` is a **number 1–12**. The message files key their
month names by slug, and `src/lib/hijri.ts` holds the single mapping between
the two. This site contains no Hijri conversion.

**Do not implement, port, copy or reimplement any solar position or prayer time
calculation in this repository, for any reason.**

---

## Content

All content is hand-authored and committed to this repo — JSON for structured
records, Markdown for long-form documents. One author. No admin interface, no
CMS.

### Announcements

```jsonc
{
  "slug": "eid-al-adha-2026",
  "publishDate": "2026-08-15",
  "category": "eid",              // optional
  "pinnedUntil": "2026-08-21",    // optional
  "title": { "de": "…", "ar": "…", "en": "…" },
  "body":  { "de": "…", "ar": "…", "en": "…" }
}
```

`schemas/announcement.schema.json` is authoritative for this shape — the block
above is illustration, not specification.

- **`category` is free text and optional.** Any string is valid. It is
  translated through the normal message lookup (`categories.<slug>`), falling
  back to English, then to the raw slug. There is no fixed list, no union type,
  no registry file. An announcement without a category renders with the default
  icon and does not appear in the filter.
- **Icons by filename convention** — `<category>.svg` if it exists, otherwise
  `default.svg`. Resolved at build time from the filesystem, not with a
  browser-side error handler.
- **The filter lists categories that actually occur** in the current set, not
  every category ever defined.
- **`pinnedUntil` is a date, not a boolean.** Pinned items sort above the rest
  until it passes.
- **`title` and `body` are objects keyed by language code**, with at least one
  entry. No language is mandatory and the set is not restricted to the three UI
  locales — the key states which language the text is written in. Resolve with
  the active locale, then the fallback locale, then any available entry, and set
  `lang` and `dir` on the rendered element to match what was actually chosen.
- **Body may contain Markdown.** Render a limited subset. Sanitize.
- **Ordering** — pinned first, then `publishDate` descending. Announcements
  older than the current view's window move to the past view.

### Projects

Same pattern: hand-authored JSON, list page with an intro, detail pages at
`/verein/projekte/[slug]`.

### Validation

Content is validated against JSON Schema at build time. Malformed JSON,
duplicate slugs and inconsistent dates must fail the build, not render blank.

---

## Pages with specific requirements

**`/moschee`** — the mosque hub. Shows `org.mosqueName` and links onward to
`/moschee/gebetszeiten`, `/moschee/hausordnung` and `/moschee/freitagsgebet`.

**`/moschee/hausordnung`** — the house rules. Reached by a QR code inside the
building, so its readers are largely not browsing the site in their own
language. The document is offered in **seven** languages independent of the
three site locales (`de ar en fa tr ru id`), one Markdown file per language,
selected through `?sprache=`. The document carries its own `lang` and `dir`,
independent of the page locale. Its picker is a separate, labelled control —
not the navbar language switcher.

**`/moschee/gebetszeiten`** — the prayer times table.

- The Friday prayer time (`config.fridayPrayer.khutbahTime`) appears in the
  page header.
- **One print button, no download button.** Print resolves to the browser's own
  dialog, which offers "save as PDF". There is no second control and no
  server-side PDF generation.

*Three row markings, each carried by a different CSS property so they compose
on a row that is more than one of them and none can mask another:*

| Marking | Carried by |
| --- | --- |
| today | background colour |
| Friday | thick border on the start side |
| Ayyam al-Bid — Hijri day 13, 14, 15 | border on all four sides |

A Friday inside Ayyam al-Bid therefore shows a thick start side and three
ordinary ones. The distinction rests on width, not hue, so it survives
greyscale printing and red-green colour deficiency.

Read `hijri.day` from the row's own data; never compute it. Use logical
properties (`border-inline-start`), never physical ones.

Border colours must invert on today's dark background: a dark border measures
about 1.4:1 there and is invisible, a light one about 9.5:1. On the light rows
the reverse holds. Every colour pairing in this table has been contrast-checked
— re-check before changing one, and note that the palette has only about three
distinct luminance levels, so two dark colours will not distinguish two
markings.

*Columns:* weekday, Gregorian date, Hijri date, then the six prayers.

*Two listing modes, switchable by the visitor:*

| Mode | Rows | Separator row |
| --- | --- | --- |
| Gregorian | one Gregorian month | where a Hijri month begins |
| Hijri | one Hijri month | where a Gregorian month begins |

Separator rows are **desktop only**.

A Hijri month can span two Gregorian year files and the loader reads one year
at a time, so the Hijri view may need both:

- **Both present** — read from both, render the complete Hijri month.
- **The adjoining file absent** — render the days that exist and state at the
  cut that the rest has not been uploaded. The gap can fall at either end.

**This is the one place partial data is allowed**, and it does not weaken the
rule elsewhere: never interpolate, never compute, never present another year's
times as if they were this year's. A month with no data at all is still the
"not uploaded" state, not a partial view.

*Mobile is a single day per page*, each prayer on its own row, with the
weekday, Gregorian date and Hijri date in the day header. No separator rows.

*URL state:* `?month=` for the desktop month view, `?date=` for the mobile day
view, so both are linkable and survive a refresh. The desktop table is wider
than the site's usual maximum content width.

**`/verein/vorstand`** — roles come from § 14 of the Satzung and are fixed;
names are optional and only present where written consent exists. The page must
look complete with role titles alone. No empty avatars, no placeholder faces.

**`/spenden`** — IBAN plus a GiroCode (EPC QR) with the Verwendungszweck
pre-filled per purpose. Purposes: Zakat, Zakat al-Fitr, Sadaqa, projects, mosque
purchase. Bank details come from `config/site.json`. No payment provider. Do not
write tax or deductibility claims — those need professional review and are
placeholders until then.

**`/verein/dokumente`** — static PDFs served as downloads. No code reads,
generates, parses or modifies any PDF.

---

## Deployment

Shared hosting (netcup, Plesk, Passenger), Node 24, `output: "standalone"`.

GitHub Actions on push to `main`: typecheck → test → build → bundle → FTP
upload. `npm run bundle` copies `.next/static` into `.next/standalone`, which
the standalone output does not include.

Passenger is restarted manually in Plesk after deploy.

Do not change the build output mode, the workflow, or the bundle step without
asking — the hosting depends on all three.

---

## Testing

Vitest. Every change ships with its tests written or updated in the same
commit — new behaviour gets coverage, changed behaviour gets its existing
tests corrected, removed behaviour gets its tests deleted.

Test the logic, not the markup: date and calendar arithmetic, the localized
fallback chain, content loading and validation, sorting and filtering, payload
builders. Do not write tests that assert the DOM matches itself.

If something is not worth testing, say so rather than padding the suite.

---

## Working style

- **Ask before adding scope.** Implement what was requested. If something
  adjacent seems necessary, say so and wait.
- **Do not invent requirements.** If a detail is unspecified, ask rather than
  choosing a sensible-looking default and building on it.
- **Say "I don't know."** A stated gap is more useful than a plausible guess.
- **Cite the rule.** When a decision here constrains an implementation, name it
  rather than silently working around it.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->