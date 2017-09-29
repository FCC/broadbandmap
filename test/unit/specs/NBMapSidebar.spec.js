import Vue from 'vue'
import NBMapSidebar from '@/components/NBMap/NBMapSidebar'

describe('NBMapSidebar.vue', () => {
  it('should render the map sidebar', () => {
    const Constructor = Vue.extend(NBMapSidebar)
    const vm = new Constructor().$mount()

    expect(vm.$el.querySelector('aside').className)
      .to.equal('map-sidebar')
  })
})
