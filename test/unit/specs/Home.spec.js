import Vue from 'vue'
import Router from 'vue-router'
import router from '@/router'
import Home from '@/components/Home'

Vue.use(Router)

describe('Home.vue', () => {
  it('should render the Home page with search panel', () => {
    const Constructor = Vue.extend(Home)
    const vm = new Constructor({
      router
    }).$mount()

    expect(vm.$el.querySelector('.panel-title').textContent)
      .to.equal('Search by Address')
  })
})
