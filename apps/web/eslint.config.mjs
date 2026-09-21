import base from "@studionomade/config/eslint";
import designSystem from "@studionomade/config/eslint/design-system";

const eslintConfig = [...base, ...designSystem];

export default eslintConfig;
