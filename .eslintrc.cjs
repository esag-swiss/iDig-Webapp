/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: [
    "plugin:vue/vue3-recommended",
    "eslint:recommended",
    "@vue/eslint-config-prettier/skip-formatting",
  ],
  rules: {
    // Reverse default :
    // "vue/attribute-hyphenation": ["error", "never"],
    // Already in "recommended" or "strongly recommended", but added here to raise error instead of warning :
    "vue/attributes-order": ["error"],
    "vue/component-tags-order": [
      "error",
      { order: ["template", "script", "style"] },
    ],
    "vue/order-in-components": ["error"],
    "vue/v-bind-style": ["error"],
    "vue/v-on-style": ["error"],
    "vue/require-default-prop": ["error"],
    "vue/component-definition-name-casing": ["error"],
    // Extra vue rules ("uncategorized", or "extension rules") :
    "vue/no-static-inline-styles": ["error"],
    "vue/component-options-name-casing": ["error"],
    "vue/component-name-in-template-casing": ["error"],
    // general eslint (and not vue specific) rules :
    curly: "error",
  },
  parserOptions: {
    ecmaVersion: "latest",
  },
};
