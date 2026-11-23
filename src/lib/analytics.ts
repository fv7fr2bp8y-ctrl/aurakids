// Google tag (GA4 + Google Ads), loaded only after the parent says yes in the
// consent banner ("basic" Consent Mode v2: nothing is sent before that), and
// never inside the Google Play apps (their Play declarations say no tracking).
// The child's name is never sent: events carry only the variant, plan, etc.

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
export const ADS_ID = process.env.NEXT_PUBLIC_GADS_ID || "";
export const CONSENT_KEY = "ak-consent"; // "granted" | "denied"

// Runs as an inline script in <head>, before React: loads the tag right away
// for visitors who already agreed.
export function bootScript(): string {
  return `(function(){
  var GA=${JSON.stringify(GA_ID)}, ADS=${JSON.stringify(ADS_ID)};
  function store(){ try { return localStorage.getItem("ak-store-app")==="1" || /^android-app:\\/\\/fun\\.aurakids\\./.test(document.referrer||""); } catch(e){ return false; } }
  window.akLoadGtag = function(){
    if (!GA || window.akGtagLoaded || store()) return;
    window.akGtagLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag("consent","default",{ad_storage:"granted",ad_user_data:"granted",ad_personalization:"granted",analytics_storage:"granted"});
    gtag("js", new Date());
    gtag("config", GA, { anonymize_ip: true });
    if (ADS) gtag("config", ADS);
    var s=document.createElement("script"); s.async=true; s.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(GA);
    document.head.appendChild(s);
  };
  try { if (localStorage.getItem(${JSON.stringify(CONSENT_KEY)})==="granted") window.akLoadGtag(); } catch(e){}
})();`;
}

type Gtag = (...args: unknown[]) => void;

export function trackEvent(name: string, params: Record<string, string | number> = {}) {
  try {
    const g = (window as unknown as { gtag?: Gtag }).gtag;
    if (g) g("event", name, params);
  } catch { /* never break the page */ }
}
