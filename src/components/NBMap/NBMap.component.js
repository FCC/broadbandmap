import mapboxgl from 'mapboxgl'
import axios from 'axios'
import { Dropdown, Tooltip } from 'uiv'
import nbMapSearch from './NBMapSearch/'
import EventHub from '../../_mixins/EventHub.js'
import LayersLocation from './layers-location.js'
import LayersArea from './layers-area.js'
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
      required: true
    },
    searchDefault: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      Map: {},
      toggleWidth: false,
      mapLayers: this.mapType === 'location' ? LayersLocation : LayersArea,
      baseLayerNames: [],
      defaultBaseLayer: 'default'
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
      mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN

     // Define default map options
      this.mapOptions = {
        attributionControl: false,
        container: 'map-container',
        style: this.mapLayers,
        logoPosition: 'bottom-left',
        maxZoom: 16,
        minZoom: 3,
        center: [-94.96, 38.82],
        zoom: 3
      }

      // Create map
      let map = new mapboxgl.Map(this.mapOptions)

      // Add Controls to map
      this.addControls(map)

      // Add layer names for layer switch control
      this.getLayerNames()

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
    },
    getLayerNames: function () {
      // Get layer names for base layer switch control
      this.baseLayerNames = this.mapLayers.layers.slice(0, 3).map(baseLayerName => {
        return baseLayerName.id
      })
    },
    switchBaseLayer: function (layerId) {
      // Switch base layer
      this.baseLayerNames.map(layerName => {
        this.Map.setLayoutProperty(layerName, 'visibility', 'none')
      })

      this.Map.setLayoutProperty(layerId, 'visibility', 'visible')
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
    }
  },
  computed: {

  },
  watch: {

  }
}
