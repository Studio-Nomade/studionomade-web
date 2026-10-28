"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./admin.module.css";

const LEAD_ROLES = ["superadmin", "admin", "commercial"];

/** Módulos del panel; Leads solo para roles comerciales y de administración. */
export function AdminNav({ roles }: { roles: readonly string[] }) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Inicio" },
    ...(roles.some((role) => LEAD_ROLES.includes(role))
      ? [{ href: "/leads", label: "Leads" }]
      : []),
    { href: "/blog", label: "Blog" },
    { href: "/proyectos", label: "Proyectos" },
    { href: "/lab", label: "Digital Lab" },
    { href: "/senales", label: "Señales" }
  ];
  return (
    <nav aria-label="Módulos de administración" className={styles.nav}>
      <ul>
        {items.map((item) => {
          const current = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={current ? "page" : undefined}>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
