// Used by LocationSummary and AreaSummary and referenced in NBMapSettings components
// Common functions for updating tech and speed layers

import { sourcesTechSpeed, layersTechSpeed } from '@/components/NBMap/layers-techSpeed.js'

export const updateMapLayers = {
  data () {
    return {
      defaultTech: 'acfosw',
      defaultSpeed: '25_3',
      removeAllLayers: false,
      togLegendTitle: true
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

      let layer = layersTechSpeed[speed] === undefined ? layersTechSpeed['25'] : layersTechSpeed[speed]
      let lyrStyle = {}

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
                  [3, '#225ea8'],
                  [4, '#253494'],
                  [6, '#081d58'],
                  [12, '#000000']
            ],
            'default': '#ffffcc'
          },
          'fill-outline-color': 'hsl(0, 1%, 46%)'
        },
        'source-layer': ''
      }

      // Modify layer template based on property and layer ID
      layerStyle.paint['fill-color'].property = propertyID
      layerStyle['source-layer'] = layer.id

      // Merge layer style properties
      lyrStyle = Object.assign({}, layerStyle, layer)

      // Add layer to map
      vm.Map.addLayer(lyrStyle, layer.beforeLayer)
    },
    removeLayers (propertyID, removeAll) { // e.g. acfosw_25_3
      const vm = this

      // When removeAll = true, do not reload tech/speed layers when the base layer style is changed
      this.removeAllLayers = removeAll

      // Loop through each layer and remove from map
      for (var key in layersTechSpeed) {
        let layer = layersTechSpeed[key]
        let layerExists = vm.Map.getLayer(layer.id)

        if (layerExists) {
          vm.Map.removeLayer(layer.id)
        }
      }

      // Set selected Tech and Speed to empty when all layers are removed
      if (removeAll) {
        this.selectedTech = ''
        this.selectedSpeed = ''
        this.updateURLParams()
      }
    },
    updateTechSpeed (selectedTech, selectedSpeed) { // e.g. acfosw, 25_3
      let propertyID = [selectedTech, selectedSpeed].join('_')

      // When base layer style is changed, the selected tech & speed layers will be reloaded
      this.selectedTech = selectedTech
      this.selectedSpeed = selectedSpeed

      // Update URL params when selected Tech and Speed change
      this.updateURLParams()

      // Add layer sources if they don't exist already
      if (this.Map.getSource('25_3') === undefined) {
        this.addSources()
      } else {
        // Remove existing map layers
        this.removeLayers(propertyID, false)
      }

      // add new map layers
      this.addLayers(propertyID)

      // If this is the Area Summary page
      if (this.$route.path === '/area-summary') {
        // Update charts
        this.validateURL()
      }
    },
    toggleLegendTitle (zoomLevel) {
      this.togLegendTitle = zoomLevel <= 10
    }
  }
}
