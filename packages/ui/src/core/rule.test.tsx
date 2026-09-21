import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import { Rule } from "./rule";
it("aplica la variante como dato", () => {
  const { container } = render(<Rule variant="short" />);
  expect(container.firstChild).toHaveAttribute("data-variant", "short");
});
