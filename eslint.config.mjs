import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";

const baseConfig = js.configs.recommended;

const eslintConfig = [
  {
    ignores: ["**/node_modules/**", "**/.next/**", "**/public/**"],
  },
  {
    ...baseConfig,
    files: ["**/*.{js,jsx,mjs,ts,tsx}", "src/**/*.{js,jsx,ts,tsx}", "pages/**/*.{js,jsx,ts,tsx}", "app/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ...baseConfig.languageOptions,
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        ...baseConfig.languageOptions?.globals,
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        URLSearchParams: "readonly",
        AbortController: "readonly",
        localStorage: "readonly",
        alert: "readonly",
        process: "readonly",
        crypto: "readonly",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...baseConfig.rules,
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-console": "off",
      "react-hooks/exhaustive-deps": "off",
      "no-useless-escape": "warn",
    },
  },
];

export default eslintConfig;
