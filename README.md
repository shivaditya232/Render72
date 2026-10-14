# Render72

The event programme for a three-day campus fest: browse every event, filter by what you like, save a plan that flags clashes, and see everything about an event on its own page.

**Live:** https://render72-one.vercel.app

## Pages

| Page | What it does |
| --- | --- |
| `/` | Headline and countdown built from the live data, the six tracks as a dock (desktop) or tiles (phones), the numbers, "registration closes first", featured events and a three-day timetable. |
| `/events` | Every event as posters or a compact list, grouped by day. Search, sort, track chips, a day strip, and more filters (technical or cultural, competition or workshop, on campus or online, fee, team size, open to register). Filters live in the URL, so any view can be shared. |
| `/events/:id` | One event: booking card that changes with the event's state, schedule, prize podium, who can enter, rules, gallery, FAQ, organisers, related events, calendar export and sharing. |

Saved events go into **Your plan** (top right): grouped by day, overlaps flagged, and exportable to any calendar as one `.ics` file.

## Try the failure handling

The API can be made to fail on purpose. Add `?simulate=` to any page URL:

| Mode | What happens |
| --- | --- |
| `offline` | Behaves as if there's no internet |
| `500` | The server fails on every attempt |
| `timeout` | The server never answers |
| `slow` | The server answers 3.5 s late |
| `empty` | Nothing has been published yet |
| `malformed` | The server sends data that can't be read |
| `off` | Back to normal |

The mode sticks for the browser tab until you use `?simulate=off`. The same list is printed in the browser console.

What the site does when things go wrong, in order:

1. **Retries.** Each request times out after 8 s and is tried 3 times with backoff. Errors are typed (offline, timeout, server, not found, bad data…) so each gets its own message.
2. **Last good copy.** Data is cached in the browser (fresh for 60 s, kept up to 7 days). If the API fails, the cached copy is shown with a note saying how old it is and a "Try live again" button.
3. **Bundled copy.** Every build saves a snapshot of the programme into the site itself (`scripts/fetchSnapshot.mjs`). A first-time visitor still sees real events when the API is down.
4. **Short version.** If an event's details fail but the list loaded, its page draws from the list summary and fills in when the details arrive.
5. **Clear error.** Only when there's truly nothing to show: what happened, what to do, and a retry.

Every field from the API is cleaned in one place (`src/models/eventModel.js`), so a missing or odd value never crashes a page. Going offline mid-browse blurs the page and waits for the connection instead of showing a broken screen; page code that failed to download is retried.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # unit tests (Vitest)
npm run build     # saves a fresh snapshot, then builds to dist/
npm run preview   # serves the build
```

## How it's organised

Model, view, controller: hooks are the controllers.

```
src/
  config/       API settings, tracks and colours, filter options, messages
  models/       httpClient (timeouts, retries), cacheStore, eventModel (cleaning + data sources),
                simulator, connection, planStore
  controllers/  useEvents, useEventDetail, useEventFilters, usePlan, useShare, useScrollSpy, …
  views/        components, layout, home, events, detail, plan, pages
  utils/        formatting, filtering, schedules and clashes, calendar files, images
  routes/       router, lazy page loading with retry
scripts/        build-time snapshot, route preloading and CSS inlining
tests/          unit tests
```

Stack: React 19, React Router 8, Tailwind CSS 4, Vite 8. No UI library; icons are inline SVG.

## Performance and accessibility

- Each page's code loads on demand, and it starts downloading together with the main file instead of after it. The events list is requested while the code is still downloading.
- The page frame and styles are inside the HTML, so something appears before any JavaScript runs.
- Photos are requested at the size they're shown. Loading placeholders keep the same shape as the real content, so nothing jumps.
- Fonts are self-hosted and trimmed to the weights and characters the site uses.
- Works with a keyboard and a screen reader: skip link, real buttons and links, native dialogs, labelled controls, and visible focus.
- Reduced motion is respected everywhere.

All times are shown in Indian Standard Time.
