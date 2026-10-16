// Everything about how we talk to the Events API lives here,
// so the numbers can be tuned in one place.

export const API_BASE_URL='https://render72.pages.dev/api/test';

// How long one request may take before we give up on it.
export const REQUEST_TIMEOUT_MS=8000;

// Total tries for one request (first try + retries).
export const MAX_ATTEMPTS=3;

// Wait before retry 1, retry 2 ... (a little random jitter is added on top).
export const RETRY_DELAYS_MS=[600,1500];

// Cached data younger than this is used without asking the server again.
export const CACHE_FRESH_MS=60*1000;

// Cached data older than this is thrown away instead of being shown.
export const CACHE_MAX_AGE_MS=7*24*60*60*1000;

// Only this many event pages are kept in the browser's storage.
export const MAX_CACHED_DETAILS=40;

// Copy of the events bundled with the site, used if the API is down on a first visit.
export const FALLBACK_LIST_URL='/fallback/events.json';
export const FALLBACK_DETAIL_URL='/fallback/events/';

// All times shown on the site are in Indian Standard Time.
export const TIME_ZONE='Asia/Kolkata';
export const IST_OFFSET='+05:30';

// When nothing has loaded yet: after this long the page says it's taking a while…
export const SLOW_NOTICE_MS=4000;

// …and after this long it shows the last saved copy (or the copy bundled with the site)
// while the retries carry on. When the live data arrives, it quietly replaces the copy.
export const SHOW_BACKUP_AFTER_MS=8000;
