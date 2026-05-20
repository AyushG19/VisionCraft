import unusedImports from "eslint-plugin-unused-imports";
import { nextJsConfig } from "@repo/eslint-config/next-js";

export default [
  ...nextJsConfig,

  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
