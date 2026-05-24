import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import globals from "globals";

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  skipFormatting,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Already in "recommended" or "strongly recommended", but raised to error here:
      "vue/attributes-order": ["error"],
      "vue/block-order": [
        "error",
        { order: ["template", "script", "style"] },
      ],
      "vue/order-in-components": ["error"],
      "vue/v-bind-style": ["error"],
      "vue/v-on-style": ["error"],
      "vue/require-default-prop": ["error"],
      "vue/component-definition-name-casing": ["error"],
      // Extra vue rules ("uncategorized", or "extension rules"):
      "vue/no-static-inline-styles": ["error"],
      "vue/component-options-name-casing": ["error"],
      "vue/component-name-in-template-casing": ["error"],
      // general eslint (and not vue specific) rules:
      curly: "error",
    },
  },
];
