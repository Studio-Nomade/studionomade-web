"use client";

import { useEffect, useState } from "react";

/** Se conservan los del primer contacto de la sesión (sessionStorage). */
const FIRST_TOUCH_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid"
] as const;

/** Página de llegada y procedencia del primer contacto de la sesión. */
const LANDING_KEYS = ["landing_url", "referrer"] as const;

const KEYS = [...FIRST_TOUCH_KEYS, ...LANDING_KEYS] as const;

function storageGet(key: string): string | null {
  try {
    return window.sessionStorage.getItem(`sn:${key}`);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(`sn:${key}`, value);
  } catch {
    /* Sin almacenamiento se usa lo que vio el servidor. */
  }
}

/**
 * Campos ocultos de atribución. Sin JavaScript se envían los valores que vio el
 * servidor al renderizar (`initial`); con JavaScript, los del primer contacto.
 */
export function UtmFields({ initial }: { initial: Record<string, string | undefined> }) {
  const [values, setValues] = useState(initial);

  useEffect(() => {
    const firstTouch: Record<string, string | undefined> = {};
    for (const key of FIRST_TOUCH_KEYS) {
      const stored = storageGet(key);
      if (stored === null && initial[key]) storageSet(key, initial[key]);
      firstTouch[key] = stored ?? initial[key];
    }

    const storedLanding = storageGet("landing_url");
    if (storedLanding === null) {
      const landingUrl = window.location.href;
      const referrer = document.referrer || initial.referrer || "";
      storageSet("landing_url", landingUrl);
      storageSet("referrer", referrer);
      firstTouch.landing_url = landingUrl;
      firstTouch.referrer = referrer;
    } else {
      firstTouch.landing_url = storedLanding;
      firstTouch.referrer = storageGet("referrer") ?? "";
    }

    setValues(firstTouch);
  }, [initial]);

  return KEYS.map((key) => <input key={key} type="hidden" name={key} value={values[key] ?? ""} />);
}
