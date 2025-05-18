import tsParser from "@typescript-eslint/parser"

export default {
    root: true,
    parser: tsParser,
    parserOptions: {
      ecmversion: "latest",
      sourceType: "module",
      project: "./tsconfig.json"
    },
    plugins: ["@typescript-eslint"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier"
    ],
    rules: {
        "@typescript-eslint/no-explicit-any": "warn"
    }
}