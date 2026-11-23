"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

// Stripe sends a paying family back to /?thanks=1: count the trial start once
// (as a conversion for Google Ads) and drop the parameter from the address.
export default function ThanksTracker() {
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("thanks") !== "1") return;
      trackEvent("trial_started", { currency: "EUR", value: 0 });
      url.searchParams.delete("thanks");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch { /* ignore */ }
  }, []);
  return null;
}
