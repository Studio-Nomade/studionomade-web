"use client";

import { useEffect, useState } from "react";
import styles from "./language-switch.module.css";

/**
 * Selector de idioma minimal (ES · EN · PT). El sitio se escribe en español y
 * se traduce completo en el navegador con el traductor web de Google:
 * inglés (Estados Unidos) y portugués (Portugal). La elección vive en la cookie
 * `googtrans`, así que persiste al navegar y al volver.
 */
const LANGUAGES = [
  { code: "es", label: "ES", name: "Español" },
  { code: "en", label: "EN", name: "English (US)" },
  { code: "pt-PT", label: "PT", name: "Português (Portugal)" }
] as const;

type LanguageCode = (typeof LANGUAGES)[number]["code"];

const SCRIPT_ID = "sn-google-translate";
const HOST_ID = "sn-google-translate-host";

function readLanguage(): LanguageCode {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/es\/([^;]+)/);
  const code = match?.[1];
  return LANGUAGES.some((language) => language.code === code) ? (code as LanguageCode) : "es";
}

function writeCookie(value: string, expires?: string) {
  const host = window.location.hostname;
  const base = `googtrans=${value}; path=/${expires ? `; expires=${expires}` : ""}`;
  document.cookie = base;
  // El traductor también lee la cookie del dominio padre.
  if (host.includes("."))
    document.cookie = `${base}; domain=.${host.split(".").slice(-2).join(".")}`;
}

/**
 * Google Translate reemplaza nodos de texto por `<font>`; cuando React luego
 * quiere quitar o insertar junto a esos nodos, lanza NotFoundError. Este parche,
 * conocido para React + traductores de página, solo se instala si hay traducción.
 */
function patchDomForTranslation() {
  const proto = Node.prototype as Node & { __snPatched?: boolean };
  if (proto.__snPatched) return;
  proto.__snPatched = true;
  const removeChild = proto.removeChild;
  proto.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return removeChild.call(this, child) as T;
  };
  const insertBefore = proto.insertBefore;
  proto.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) return node;
    return insertBefore.call(this, node, ref) as T;
  };
}

function loadTranslator() {
  if (document.getElementById(SCRIPT_ID)) return;
  patchDomForTranslation();
  if (!document.getElementById(HOST_ID)) {
    const host = document.createElement("div");
    host.id = HOST_ID;
    host.hidden = true;
    document.body.appendChild(host);
  }
  const w = window as typeof window & {
    __snTranslateInit?: () => void;
    google?: { translate?: { TranslateElement: new (options: object, id: string) => unknown } };
  };
  w.__snTranslateInit = () => {
    const TranslateElement = w.google?.translate?.TranslateElement;
    if (TranslateElement)
      new TranslateElement(
        { pageLanguage: "es", includedLanguages: "en,pt-PT", autoDisplay: false },
        HOST_ID
      );
  };
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = "https://translate.google.com/translate_a/element.js?cb=__snTranslateInit";
  script.async = true;
  document.body.appendChild(script);
}

export function LanguageSwitch({ tone = "dark" }: { tone?: "light" | "dark" }) {
  const [current, setCurrent] = useState<LanguageCode>("es");

  useEffect(() => {
    const language = readLanguage();
    setCurrent(language);
    document.documentElement.lang =
      language === "pt-PT" ? "pt-PT" : language === "en" ? "en-US" : "es";
    if (language !== "es") loadTranslator();
  }, []);

  const choose = (code: LanguageCode) => {
    if (code === current) return;
    if (code === "es") writeCookie("", "Thu, 01 Jan 1970 00:00:00 GMT");
    else writeCookie(`/es/${code}`);
    window.location.reload();
  };

  return (
    <div
      className={styles.switch}
      data-tone={tone}
      role="group"
      aria-label="Idioma del sitio"
      translate="no"
    >
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          type="button"
          className={styles.option}
          aria-pressed={current === language.code}
          aria-label={language.name}
          lang={language.code}
          onClick={() => choose(language.code)}
        >
          {language.label}
        </button>
      ))}
    </div>
  );
}
