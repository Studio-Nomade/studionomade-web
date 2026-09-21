"use client";

import { useEffect, useState } from "react";

const KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid"
] as const;

export function UtmFields({ initial }: { initial: Record<string, string | undefined> }) {
  const [values, setValues] = useState(initial);

  useEffect(() => {
    const firstTouch = Object.fromEntries(
      KEYS.map((key) => [key, sessionStorage.getItem(`sn:${key}`) ?? initial[key]])
    );
    for (const key of KEYS) {
      if (!sessionStorage.getItem(`sn:${key}`) && initial[key]) {
        sessionStorage.setItem(`sn:${key}`, initial[key]);
      }
    }
    setValues(firstTouch);
  }, [initial]);

  return KEYS.map((key) => <input key={key} type="hidden" name={key} value={values[key] ?? ""} />);
}
