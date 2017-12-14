import Vue from 'vue'
import mapboxgl from 'mapbox-gl'
import layers from '@/components/NBMap/layers-location.js'
import NBMap from '@/components/NBMap'

describe('NBMap.vue', () => {
  it('should render the map container', () => {
    const Constructor = Vue.extend(NBMap, {
      mapboxgl,
      layers
    })
    const vm = new Constructor().$mount()

    expect(vm.$el.querySelector('canvas'))
      .to.equal('mapboxgl-canvas')
  })
})
