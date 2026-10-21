import { describe, expect, it } from "vitest";

import { echoLeadValues, splitEchoedValues } from "./echo-values";

describe("echoLeadValues", () => {
  it("devuelve solo los campos visibles y no vacíos", () => {
    const formData = new FormData();
    formData.set("name", "Ada");
    formData.set("email", "");
    formData.set("project_stage", "idea");
    formData.set("t_signature", "secreto");
    formData.set("empresa_web", "bot");
    formData.set("fbp", "fb.1.1729400000000.1");
    expect(echoLeadValues(formData)).toEqual({ name: "Ada", project_stage: "idea" });
  });

  it("acota la longitud de lo devuelto", () => {
    const formData = new FormData();
    formData.set("message", "x".repeat(5_000));
    expect(echoLeadValues(formData).message).toHaveLength(2_000);
  });

  it("devuelve las selecciones múltiples y las opciones elegidas", () => {
    const formData = new FormData();
    formData.append("areas", "branding");
    formData.append("areas", "web-design");
    formData.append("needs", "");
    formData.set("budget_range", "3m_8m");
    formData.set("timeline", "sin_fecha");
    const values = echoLeadValues(formData);
    expect(values).toEqual({
      areas: "branding,web-design",
      budget_range: "3m_8m",
      timeline: "sin_fecha"
    });
    expect(splitEchoedValues(values.areas)).toEqual(["branding", "web-design"]);
    expect(splitEchoedValues(values.needs)).toEqual([]);
  });
});
