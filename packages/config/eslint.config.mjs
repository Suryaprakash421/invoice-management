import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

/** @param {{ tsconfigPath?: string }} [options] */
export function createConfig(options = {}) {
  return tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          ...(options.tsconfigPath && {
            project: options.tsconfigPath,
          }),
        },
      },
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "warn",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/consistent-type-imports": "warn",
      },
    },
    {
      ignores: ["dist/", "node_modules/", "*.config.*"],
    },
  );
}

export default createConfig();
