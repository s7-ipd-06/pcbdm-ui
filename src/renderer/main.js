import Vue from 'vue'

import App from './App'

import 'bootstrap/dist/css/bootstrap.min.css'

Vue.config.productionTip = false

new Vue({
  components: { App },
  template: '<App/>'
}).$mount('#app')
