import Vue from 'vue'
import VueRouter from 'vue-router'
import router from '@/router'
import NavbarSecondary from '@/components/AppHeader/NavbarSecondary'

Vue.use(VueRouter)

describe('NavbarSecondary.vue', () => {
  it('should render the main application navigation links', () => {
    const Constructor = Vue.extend(NavbarSecondary)

    const vm = new Constructor({
      router
    }).$mount()

    expect(vm.$el.querySelectorAll('li').length)
      .to.equal(7)
  })
})
