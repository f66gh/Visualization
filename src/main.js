import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import store from './store'

import './assets/main.css'

const app = createApp(App)

app.use(router)

app.use(ElementPlus)
app.use(store)
app.mount('#app')