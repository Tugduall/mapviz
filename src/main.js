import {createApp} from 'vue'
import App from './App.vue'

import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import '/node_modules/primeflex/primeflex.css'
import './assets/scss/global.scss'
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";
import router from './router'
import ToastService from "primevue/toastservice";

const app = createApp(App).use(router);

app.use(PrimeVue);
app.use(router)
app.use(ToastService);
app.directive('tooltip', Tooltip);
app.mount('#app');

