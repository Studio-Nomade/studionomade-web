import { describe, expect, it } from "vitest";

import { CAMPAIGN_FOOTER_COLUMNS, FOOTER_COLUMNS } from "./site";

const hrefs = (columns: typeof FOOTER_COLUMNS) =>
  columns.flatMap((column) => column.items.map((item) => item.href).filter(Boolean));

describe("footer de campañas", () => {
  it("quita los enlaces a Proyectos, Nosotros, Blog y Contacto", () => {
    const links = hrefs(CAMPAIGN_FOOTER_COLUMNS);
    for (const path of ["/proyectos", "/nosotros", "/blog", "/contacto"]) {
      expect(links).not.toContain(path);
      expect(hrefs(FOOTER_COLUMNS)).toContain(path);
    }
  });

  it("conserva oficinas y contacto del footer del sitio", () => {
    const [studio, contacto] = CAMPAIGN_FOOTER_COLUMNS;
    expect(studio).toEqual(FOOTER_COLUMNS[0]);
    expect(contacto).toEqual(FOOTER_COLUMNS[1]);
  });
});
