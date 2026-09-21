function unwrap(node) {
  if (node?.type === "TSAsExpression" || node?.type === "TSTypeAssertion")
    return unwrap(node.expression);
  return node;
}

function validStyle(node) {
  const value = unwrap(node);
  if (!value || (value.type === "Identifier" && value.name === "undefined")) return true;
  if (value.type === "ConditionalExpression") {
    return validStyle(value.consequent) && validStyle(value.alternate);
  }
  if (value.type !== "ObjectExpression") return false;
  return value.properties.every((property) => {
    if (property.type !== "Property") return false;
    const key = property.key;
    const name =
      key.type === "Literal" ? key.value : key.type === "Identifier" ? key.name : undefined;
    return typeof name === "string" && name.startsWith("--");
  });
}

export default {
  meta: {
    type: "problem",
    docs: { description: "Allow inline styles only as props-to-CSS custom property bridges" },
    schema: [],
    messages: { forbidden: "Inline style keys must all start with '--'. Use a CSS Module." }
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name?.name !== "style") return;
        if (node.value?.type !== "JSXExpressionContainer" || !validStyle(node.value.expression)) {
          context.report({ node, messageId: "forbidden" });
        }
      }
    };
  }
};
