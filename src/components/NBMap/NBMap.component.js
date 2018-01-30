import mapboxgl from 'mapboxgl'
import { Dropdown, Tooltip } from 'uiv'
import nbMapSearch from './NBMapSearch/'
import EventHub from '../../_mixins/EventHub.js'
import { LayersLocation } from './layers-location.js'
import { LayersArea } from './layers-area.js'

import { urlValidation } from '../../_mixins/urlValidation.js'

export default {
  name: 'nbMap',
  components: { Dropdown, Tooltip, nbMapSearch },
  mixins: [urlValidation],
  props: {
    mapType: {
      type: String,
      required: true
    },
    searchType: {
      type: String,
      required: false
    },
    searchDefault: {
      type: String,
      required: false
    }
  },
  data () {
    return {
      Map: {},
      toggleWidth: false,
      mapLayers: {},
      baseLayerNames: [],
      defaultBaseLayer: 'dark',
      showSearch: this.searchType === 'none',
      baseLayers: [{
        id: 'dark',
        label: 'Dark (Default)',
        styleURL: 'mapbox://styles/fcc/cjan4l3hadb3m2rka6pnx2m4k'
      }, {
        id: 'light',
        label: 'Light',
        styleURL: 'mapbox://styles/fcc/cjan3c2yxe6fg2sqv5rcgmrwz'
      }, {
        id: 'satellite-streets',
        label: 'Satellite',
        styleURL: 'mapbox://styles/mapbox/satellite-streets-v9'
      }]
    }
  },
  mounted () {
     // Initialze Map
    this.$nextTick(this.init)
  },
  beforeDestroy () {
    this.Map.remove()
  },
  methods: {
    init: function () {
      let vm = this
      mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN

      // Define map layers based on map type
      const layerTypes = {
        location: LayersLocation,
        area: LayersArea,
        provider: LayersLocation
      }

      this.mapLayers = layerTypes[this.mapType]

      // Define default map options
      this.mapOptions = {
        attributionControl: false,
        center: [-94.96, 38.82],
        container: 'map-container',
        maxZoom: 22,
        minZoom: 0,
        pitchWithRotate: false,
        style: this.baseLayers[0].styleURL,
        zoom: 3
      }

      // Create map
      let map = new mapboxgl.Map(this.mapOptions)

      // Add Controls to map
      this.addControls(map)

      map.on('load', () => {
        // Fix Mapbox wordmark display
        document.querySelector('.mapboxgl-ctrl-bottom-left').firstChild.setAttribute('style', 'display: block')
      })

      map.on('style.load', () => {
        // Reload the cartographic layers after base layer style change
        vm.addCartographicLayers(this.mapLayers)
      })

      // Register map related events
      this.registerEvents(map)

      // Trigger map initialize event
      this.$emit('map-init', map, this.mapOptions)

      this.Map = map
    },
    addControls: function (map) {
      // Define navigation and geolocation controls
      const navControl = new mapboxgl.NavigationControl()
      const geoLocControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      })

      // Define Attribution Control
      const attrControl = new mapboxgl.AttributionControl({
        compact: true
      })

      // Define custom Nationwide control
      class NationwideBtnControl {
        onAdd (map) {
          this._map = map
          this.container = document.getElementById('btn-custom')
          return this.container
        }
        onRemove () {
          this.container.parentNode.removeChild(this.container)
          this.map = undefined
        }
      }

      const nationwideBtnControl = new NationwideBtnControl()

      // Define custom layer switch control
      class LayerSwitchControl {
        onAdd (map) {
          this._map = map
          this.container = document.getElementById('btn-layerSwitch')
          return this.container
        }
        onRemove () {
          this.container.parentNode.removeChild(this.container)
          this._map = undefined
        }
      }

      const layerSwitchControl = new LayerSwitchControl()

      // Add controls to map
      map.addControl(attrControl, 'bottom-right')
      map.addControl(navControl, 'top-left')
      map.addControl(geoLocControl, 'top-left')
      map.addControl(nationwideBtnControl, 'top-left')
      map.addControl(layerSwitchControl, 'top-left')
    },
    registerEvents: function (map) {
      const vm = this

      // Define listener to resize map full width when sidebar is collapsed
      EventHub.$on('toggleSidebar', data => {
        let element = document.querySelector('.map-sidebar')

        this.toggleWidth = data

        element.addEventListener('transitionend', function (event) {
          map.resize()
        }, false)
      })

      map.on('click', function (event) {
        vm.$emit('map-click', event)
      })

      map.on('zoomend', function (event) {
        console.log('zoom = ', map.getZoom())

        let zoomLevel = map.getZoom()

        vm.$emit('map-zoomend', zoomLevel)
      })

      map.on('dragend', function (event) {
        vm.$emit('map-dragend', event)
      })
    },
    switchBaseLayer: function (layerId) {
      let baseLayerURL = ''

      // Find the base layer style URL
      this.baseLayers.forEach(baseLayer => {
        if (baseLayer.id === layerId) {
          baseLayerURL = baseLayer.styleURL
        }
      })

      this.Map.setStyle(baseLayerURL)
    },
    addCartographicLayers (mapLayers) {
      let layers = this.Map.getStyle().layers

      let firstSymbolId

      for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
          firstSymbolId = layers[i].id
          break
        }
      }

      mapLayers.forEach(layer => {
        this.Map.addLayer(layer, firstSymbolId)
      })
    },
    viewNationwide: function () {
      // Reset pitch and bearing
      this.Map.setPitch(0)
      this.Map.setBearing(0)

      // Recenter map
      this.Map.easeTo({
        center: [-94.96, 38.82],
        zoom: 3
      })

      // Trigger map initialize event
      this.$emit('map-viewNationwide', this.Map)
    }
  },
  computed: {

  },
  watch: {

  }
}
