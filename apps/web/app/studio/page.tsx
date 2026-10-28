import { permanentRedirect } from "next/navigation";

/** /studio se reemplazó por /nosotros: redirección permanente (308). */
export default function StudioRoute() {
  permanentRedirect("/nosotros");
}
