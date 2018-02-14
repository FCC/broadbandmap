// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import Vuex from 'vuex'

import App from './App'
import router from './router'
import { appStore } from './store.js'

import VueGoodTable from 'vue-good-table'
import './assets/scss/app-theme.scss'

Vue.config.productionTip = false

Vue.use(Vuex)
Vue.use(VueGoodTable)

/* eslint-disable no-new */
const store = new Vuex.Store(appStore)

new Vue({
  store,
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
