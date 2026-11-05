import { createApp } from "vue";
import { Quasar, Notify, Dialog } from "quasar";
import es from "quasar/lang/es";
import "@quasar/extras/material-icons/material-icons.css";
import "@quasar/extras/roboto-font/roboto-font.css";
import "quasar/src/css/index.sass";
import "./styles.css";
import App from "./App.vue";
import router from "./router.js";
createApp(App)
  .use(Quasar, {
    plugins: { Notify, Dialog },
    lang: es,
    config: {
      dark: true,
      brand: {
        primary: "#8338ec",
        secondary: "#58d8ed",
        positive: "#20d5ab",
        negative: "#ff728b",
        dark: "#101626",
      },
    },
  })
  .use(router)
  .mount("#app");
