// Used by LocationSummary and AreaSummary and referenced in NBMapSettings components
// Common functions for updating tech and speed layers

import { sourcesTechSpeed, layersTechSpeed, layersSpeed } from '@/components/NBMap/layers-techSpeed.js'

export const updateMapLayers = {
  data () {
    return {
      defaultTech: 'acfosw',
      defaultSpeed: '25_3',
      removeAllLayers: false
    }
  },
  methods: {
    addSources () {
      const vm = this

      vm.removeAllLayers = false

      // Add sources for tech and speed map layers
      sourcesTechSpeed.forEach(source => {
        vm.Map.addSource(source.id, {
          url: source.url,
          type: source.type
        })
      })
    },
    addLayers (propertyID) {
      const vm = this
      const speed = propertyID.split('_')[1]

      let layers = [layersTechSpeed, layersSpeed[speed]]
      let layersLen = layers.length

      // Template for layer style
      let layerStyle = {
        'layout': {
          'visibility': 'visible'
        },
        'maxzoom': 0,
        'type': 'fill',
        'source': '',
        'id': '',
        'paint': {
          'fill-color': {
            'base': 1,
            'type': 'exponential',
            'property': '',
            'stops': [
                  [0, '#ffffcc'],
                  [1, '#a1dab4'],
                  [2, '#41b6c4'],
                  [3, '#225ea8']
            ],
            'default': '#ffffcc'
          }
        },
        'source-layer': ''
      }

      // loop through each layer type and add to map
      for (let i = 0; i < layersLen; i++) {
        layers[i].forEach(layer => {
          let lyrStyle = {}

          layerStyle.paint['fill-color'].property = propertyID
          layerStyle['source-layer'] = layer.id

          lyrStyle = Object.assign({}, layerStyle, layer)

          vm.Map.addLayer(lyrStyle, layer.beforeLayer)
        })
      }
    },
    removeLayers (propertyID, removeAll) { // e.g. acfosw_25_3
      const vm = this
      const speed = propertyID.split('_')[1]

      let layers = [layersTechSpeed, layersSpeed[speed]]
      let layersLen = layers.length

      // When removeAll = true, do not reload tech/speed layers when the base layer style is changed
      this.removeAllLayers = removeAll

      // Loop through each layer type and remove from map
      for (let i = 0; i < layersLen; i++) {
        layers[i].forEach(layer => {
          let layerExists = vm.Map.getLayer(layer.id)

          if (layerExists) {
            vm.Map.removeLayer(layer.id)
          }
        })
      }
    },
    // Called by mounted() and Map.on('load')
    updateTechSpeed (selectedTech, selectedSpeed) { // e.g. acfosw, 25_3
      let propertyID = [selectedTech, selectedSpeed].join('_')

      // When base layer style is changed, the selected tech & speed layers will be reloaded
      this.selectedTech = selectedTech
      this.selectedSpeed = selectedSpeed

      // Add layer sources if they don't exist already
      if (this.Map.getSource('county-techSpeed') === undefined || this.Map.getSource('block-techSpeed') === undefined) {
        this.addSources()
      } else {
        // Remove existing map layers
        this.removeLayers(propertyID, false)
      }

      // Add new map layers
      this.addLayers(propertyID)
    }
  }
}
