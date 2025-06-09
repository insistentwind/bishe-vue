import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue'
import router from './router'
import hevueImgPreview from 'hevue-img-preview'
import * as echarts from 'echarts';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import 'katex/dist/katex.min.css'

const app = createApp(App);
app.use(ElementPlus);
app.use(hevueImgPreview);
app.use(createPinia());
app.use(router);
app.config.globalProperties.$echarts = echarts;
app.component('QuillEditor', QuillEditor)

// 全局属性设置
app.config.globalProperties.apiBaseUrl = 'http://localhost:39999';

app.mount('#app');
