import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";

export default [
  // ESLint の推奨設定
  pluginJs.configs.recommended,

  // TypeScript ESLint の推奨設定
  tseslint.configs.recommended,

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        // その他のグローバル変数
      },
      parser: tseslint.parser, // TypeScript パーサーを指定
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint, // プラグインを登録
    },
    rules: {
      // カスタムルール
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/prefer-const": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
    },
  },
];