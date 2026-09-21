import Link from "next/link";
import styles from "./not-found.module.css";

export default function AreaNotFound() {
  return (
    <main className={styles.page}>
      <h1>Área no encontrada</h1>
      <Link href="/">Volver al inicio</Link>
    </main>
  );
}
