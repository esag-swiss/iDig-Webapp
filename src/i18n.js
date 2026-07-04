import { createI18n } from "vue-i18n";
import fr from "./locales/fr.json";
import en from "./locales/en.json";
import de from "./locales/de.json";
import it from "./locales/it.json";
import el from "./locales/el.json";

const i18n = createI18n({
  legacy: true, // required to keep $t / this.$t in Options API components
  locale: "fr", // langue par défaut
  fallbackLocale: "en", // langue de secours
  messages: {
    fr,
    en,
    de,
    it,
    el,
  },
});

export default i18n;
