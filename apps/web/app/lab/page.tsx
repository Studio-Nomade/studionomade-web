import type { Metadata } from "next";
import Link from "next/link";
import { LAB_PROTOTYPES } from "../../content/lab";
import { PublicPage } from "../../components/public/public-shell";
import styles from "../../components/public/public.module.css";

export const metadata: Metadata = {
  title: "Digital Lab | Studio Nomade",
  description: "Experimentos digitales de Studio Nomade."
};

export default async function LabPage({
  searchParams
}: {
  searchParams: Promise<{ industry?: string; solution?: string; maturity?: string }>;
}) {
  const filters = await searchParams;
  const prototypes = LAB_PROTOTYPES.filter(
    (item) =>
      (!filters.industry || item.industry === filters.industry) &&
      (!filters.solution || item.solution === filters.solution) &&
      (!filters.maturity || item.maturity === filters.maturity)
  );
  return (
    <PublicPage>
      <section className={styles.section}>
        <p className={styles.eyebrow}>Digital Lab</p>
        <h1>Ideas en estado de prueba.</h1>
        <p className={styles.lead}>
          Prototipos autocontenidos con datos ficticios. No son productos ni representan servicios
          activos.
        </p>
        <form method="get" aria-label="Filtrar prototipos">
          <label>
            Industria{" "}
            <select name="industry" defaultValue={filters.industry ?? ""}>
              <option value="">Todas</option>
              {[...new Set(LAB_PROTOTYPES.map((item) => item.industry))].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Solución{" "}
            <select name="solution" defaultValue={filters.solution ?? ""}>
              <option value="">Todas</option>
              {[...new Set(LAB_PROTOTYPES.map((item) => item.solution))].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Madurez{" "}
            <select name="maturity" defaultValue={filters.maturity ?? ""}>
              <option value="">Todas</option>
              <option value="concepto">concepto</option>
              <option value="prototipo">prototipo</option>
            </select>
          </label>
          <button type="submit">Aplicar filtros</button>
        </form>
        <div className={styles.grid}>
          {prototypes.map((item) => (
            <article className={styles.card} key={item.slug}>
              <p>{item.tags.join(" · ")}</p>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <Link href={`/lab/${item.slug}`}>Ver experimento</Link>
            </article>
          ))}
          {prototypes.length === 0 && <p>No hay prototipos para estos filtros.</p>}
        </div>
      </section>
    </PublicPage>
  );
}
