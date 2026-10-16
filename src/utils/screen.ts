/**
 * True on a TV we are cast to: the Chromecast receiver (/cast) iframes the spectator view with `?tv`,
 * and Cast devices put "CrKey" in their user agent. Add `?tv` to any spectate URL to preview the TV
 * look in a browser. Fixed for the page's lifetime: a TV never stops being one.
 */
export const IS_CAST_DEVICE = new URLSearchParams(window.location.search).has('tv') || /CrKey/i.test(navigator.userAgent);
