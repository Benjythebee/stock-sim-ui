/**
 * Per-route <head> tags. index.html carries the defaults for "/" (what social crawlers see, since they don't
 * run JS); Layout calls applyPageMeta(pageMetaFor(path)) on every navigation so Google, which does render JS,
 * gets the right title, description, canonical and robots for each page. Keep index.html, public/sitemap.xml
 * and HOME below in sync.
 */
export const SITE_URL = 'https://tendiesbrawl.com';

const SITE_NAME = 'Tendies Brawl';

type PageMeta = {
  title: string;
  description: string;
  /** Canonical path. Omit for pages that shouldn't be indexed. */
  path?: string;
  noindex?: boolean;
};

const HOME: PageMeta = {
  title: 'Tendies Brawl – Multiplayer Stock Trading Game with Friends',
  description:
    'Free multiplayer stock trading game in your browser. Trade one stock against friends and AI bots on a live order book, grab power-ups, and finish with the best P&L to win.',
  path: '/',
};

const ABOUT: PageMeta = {
  title: 'How to Play Tendies Brawl – Stock Market Party Game with Power-Ups',
  description:
    'How Tendies Brawl works: create a room, invite friends, trade a fictional stock against AI bots, open briefcases for power-ups like Insider Tips and DDoS attacks, and win on P&L.',
  path: '/about',
};

/** Path is Layout's normalized pathname (no trailing slash, "/" for home). */
export function pageMetaFor(path: string): PageMeta {
  if (path === '/') return HOME;
  if (path === '/about') return ABOUT;
  if (path === '/cast') return { title: `${SITE_NAME} – Cast`, description: HOME.description, noindex: true };

  // Everything else is a room code: ephemeral, so never indexed.
  const [, room, sub] = path.split('/');
  const code = decodeURIComponent(room ?? '');
  return sub === 'spectate'
    ? { title: `Spectating room ${code} · ${SITE_NAME}`, description: `Watch the live trading in Tendies Brawl room ${code}.`, noindex: true }
    : { title: `Room ${code} · ${SITE_NAME}`, description: `Join Tendies Brawl room ${code} and trade against your friends.`, noindex: true };
}

function setTag(selector: string, create: () => HTMLElement, attr: string, value: string | null) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (value === null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

const meta = (key: 'name' | 'property', name: string, content: string | null) =>
  setTag(`meta[${key}="${name}"]`, () => {
    const el = document.createElement('meta');
    el.setAttribute(key, name);
    return el;
  }, 'content', content);

export function applyPageMeta({ title, description, path, noindex }: PageMeta) {
  const url = path && !noindex ? SITE_URL + path : null;

  document.title = title;
  meta('name', 'description', description);
  meta('name', 'robots', noindex ? 'noindex' : 'index, follow, max-image-preview:large');
  setTag('link[rel="canonical"]', () => {
    const el = document.createElement('link');
    el.rel = 'canonical';
    return el;
  }, 'href', url);

  meta('property', 'og:title', title);
  meta('property', 'og:description', description);
  meta('property', 'og:url', url);
  meta('name', 'twitter:title', title);
  meta('name', 'twitter:description', description);
}
