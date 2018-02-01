// Used by LocationSummary and AreaSummary and referenced in NBMapSettings components
// Common functions for updating tech and speed layers
import { Tooltip } from 'uiv'
import EventHub from './EventHub.js'
import { sourcesTechSpeed, layersTechSpeed } from '@/components/NBMap/layers-techSpeed.js'
import { technologies } from './tech-speeds.js'
import { mapSettings } from './map-settings.js'

export const updateMapLayers = {
  components: { Tooltip },
  data () {
    return {
      defaultTech: 'acfosw',
      defaultSpeed: '25_3',
      removeAllLayers: false,
      togLegendTitle: true,
      selectedTech: '',
      selectedSpeed: '',
      technologies: technologies,
      tech: '',
      speed: '',
      mapOpacity: 1,
      mapHighlight: mapSettings.highlightColor.hex,
      showWaterBlocks: mapSettings.showWaterBlocks,
      showUnPopBlocks: mapSettings.showUnPopBlocks
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
          'fill-outline-color': 'hsl(0, 1%, 46%)',
          'fill-opacity': vm.mapOpacity
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

      vm.updateOpacity(vm.mapOpacity * 100)
      vm.updateHighlight(vm.mapHighlight)
      vm.setWaterBlocks(vm.showWaterBlocks)
      vm.setUnPopBlocks(vm.showUnPopBlocks)
    },
    removeLayers (propertyID, removeAll) { // e.g. acfosw_25_3
      const vm = this

      // When removeAll = true, do not reload tech/speed layers when the base layer style is changed
      this.removeAllLayers = removeAll

      // Loop through each layer and remove from map
      let existLayers = this.layerExists()
      existLayers.forEach(layer => {
        vm.Map.removeLayer(layer.id)
      })

      // Set selected Tech and Speed to empty when all layers are removed
      if (removeAll) {
        this.selectedTech = ''
        this.selectedSpeed = ''

        this.tech = ''
        this.speed = ''

        this.updateURLParams()
      }
    },
    updateTechSpeed (selectedTech, selectedSpeed) { // e.g. acfosw, 25_3
      let propertyID = [selectedTech, selectedSpeed].join('_')
      let techCodes = []
      let techArr = []

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

      // Update tech and speed in sidebar legend
      if (selectedTech !== undefined) {
        techCodes = selectedTech.split('')

        techCodes.forEach(code => {
          this.technologies.filter(tech => {
            if (tech.value === code) {
              techArr.push(tech.name)
            }
          })
        })
      }

      // Move 'Other' to end of the list of technologies
      let otherIndex = techArr.indexOf('Other')
      if (otherIndex > -1) {
        techArr.splice(otherIndex, 1)
        techArr.sort().push('Other')
        this.tech = techArr.join(', ')
      } else {
        this.tech = techArr.sort().join(', ')
      }

      if (selectedTech !== undefined) {
        this.speed = selectedSpeed.split('_').join('/')
      }

      if (this.speed === '200') {
        this.speed = '0.2/0.2'
      }
    },
    openMapSettings () {
      EventHub.$emit('openMapSettings')
    },
    updateOpacity (opacity) { // Update map layer opacity
      this.mapOpacity = opacity / 100

      // Adjust fill-opacity for each tech/speed layer
      let existLayers = this.layerExists()
      existLayers.forEach(layer => {
        this.Map.setPaintProperty(layer.id, 'fill-opacity', this.mapOpacity)
      })
    },
    updateHighlight (highlight) { // Update map layer highlight color
      this.mapHighlight = highlight

      if (this.$route.name === 'LocationSummary') {
        this.Map.setPaintProperty('block-highlighted', 'line-color', highlight)
        this.Map.setPaintProperty('xlarge-blocks-highlighted', 'line-color', highlight)
      }

      if (this.$route.name === 'AreaSummary') {
        // Filter map layers where layer id contains 'highlighted'
        let layersHL = this.Map.getStyle().layers.filter(layer => {
          if (layer.id.split('-')[1] === 'highlighted') {
            return layer
          }
        })

        // Set line-color of layers
        layersHL.forEach(layer => {
          this.Map.setPaintProperty(layer.id, 'line-color', highlight)
        })
      }
    },
    setWaterBlocks (showWaterBlocks) {
      this.showWaterBlocks = showWaterBlocks
      this.setLayerOpts()
    },
    setUnPopBlocks (showUnPopBlocks) {
      this.showUnPopBlocks = showUnPopBlocks
      this.setLayerOpts()
    },
    setLayerOpts (showWaterBlocks, showUnPopBlocks) {
      // Filter tech/speed layers by water or unpopulated block
      let existLayers = this.layerExists()
      existLayers.forEach(layer => {
        let filterArr1 = []
        let filterArr2 = []

        if (!this.showUnPopBlocks && !this.showWaterBlocks) {
          filterArr1 = ['!=', 'h2only_undev', 1]
          filterArr2 = ['!=', 'h2only_undev', 2]
        }

        if (this.showUnPopBlocks && !this.showWaterBlocks) {
          filterArr1 = ['!=', 'h2only_undev', '']
          filterArr2 = ['!=', 'h2only_undev', 1]
        }

        if (!this.showUnPopBlocks && this.showWaterBlocks) {
          filterArr1 = ['!=', 'h2only_undev', '']
          filterArr2 = ['!=', 'h2only_undev', 2]
        }

        if (this.showUnPopBlocks && this.showWaterBlocks) {
          filterArr1 = ['!=', 'h2only_undev', '']
          filterArr2 = ['!=', 'h2only_undev', '']
        }

        this.Map.setFilter(layer.id, ['all', filterArr1, filterArr2])
      })
    },
    layerExists () {
      let layers = []

      // Get the layers that are loaded in the map
      for (var key in layersTechSpeed) {
        let layer = layersTechSpeed[key]
        let layerExists = this.Map.getLayer(layer.id)

        if (layerExists) {
          layers.push(layer)
        }
      }

      return layers
    }
  }
}
