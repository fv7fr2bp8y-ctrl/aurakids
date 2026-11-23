"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GA_ID, CONSENT_KEY } from "@/lib/analytics";
import { isStoreApp } from "@/lib/demo";

// Asks once whether we may use Google's cookies (to know which ads bring
// parents). Both buttons are equal; the site works the same either way.
export default function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!GA_ID || isStoreApp()) return;
    try {
      if (!localStorage.getItem(CONSENT_KEY)) setShow(true);
    } catch { /* storage blocked: don't ask, don't track */ }
  }, []);

  const choose = (v: "granted" | "denied") => {
    try { localStorage.setItem(CONSENT_KEY, v); } catch { /* ignore */ }
    if (v === "granted") (window as unknown as { akLoadGtag?: () => void }).akLoadGtag?.();
    setShow(false);
  };

  if (!show) return null;
  return (
    <div className="consent" role="dialog" aria-live="polite" aria-label="Бисквитки">
      <p>
        Ползваме бисквитки от Google, за да знаем кои реклами водят родители до приказките.
        Сайтът работи същото и без тях. <Link href="/privacy#cookies">Повече</Link>
      </p>
      <div className="consent-btns">
        <button onClick={() => choose("denied")}>Отказвам</button>
        <button onClick={() => choose("granted")}>Приемам</button>
      </div>
    </div>
  );
}
