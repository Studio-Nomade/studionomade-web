import { describe, expect, it } from "vitest";

import { echoLeadValues } from "./echo-values";

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
});
