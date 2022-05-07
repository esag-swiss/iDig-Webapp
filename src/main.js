import { createApp } from 'vue';

import App from './App.vue';
import UsersTable from './components/UsersTable';

// import DynaTable from './components/DynaTable';

const app = createApp(App);

app.component('users-table', UsersTable);
// app.component('filter-liste', FilterListe);
// app.component('dyna-table', DynaTable);

app.mount('#app');
