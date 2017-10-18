import mapboxgl from 'mapboxgl'
import { Dropdown, Tooltip } from 'uiv'
import nbMapSearch from './NBMapSearch/'
import EventHub from '../../_mixins/EventHub.js'
import LayersLocation from './layers-location.js'
import LayersArea from './layers-area.js'

export default {
  name: 'nbMap',
  components: { Dropdown, Tooltip, nbMapSearch },
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
        container: 'map-location',
        style: this.mapLayers,
        logoPosition: 'bottom-left',
        maxZoom: 10,
        minZoom: 3,
        center: [-94.96, 38.82],
        zoom: 3
      }
      // If valid latitude and longitude are in query string, override defaults, and zoom in
      if (this.isValidLatLon()) {
        this.mapOptions.center = [this.$route.query.lon, this.$route.query.lat]
        this.mapOptions.zoom = 10
      }
      // Create map
      let map = new mapboxgl.Map(this.mapOptions)

      // Add Controls to map
      this.addControls(map)

      // Add layer names for layer switch control
      this.getLayerNames()

      // Register map related events
      this.registerEvents(map)

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
      const _self = this

      // Define listener to resize map full width when sidebar is collapsed
      EventHub.$on('toggleSidebar', data => {
        let element = document.querySelector('.map-sidebar')

        this.toggleWidth = data

        element.addEventListener('transitionend', function (event) {
          map.resize()
        }, false)
      })

      map.on('click', _self.showBlock)
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
      this.Map.flyTo({
        center: [-94.96, 38.82],
        zoom: 3
      })
    },
    showBlock: function (event) {
      let lon = event.lngLat.lng
      let lat = event.lngLat.lat

      this.setLocationMarker(lat, lon)
    },
    setLocationMarker (lat, lon) {
      // Create element for marker
      let el = document.createElement('div')
      el.className = 'marker'

      // Remove pre-existing marker
      if (this.locationMarker) {
        this.locationMarker.remove()
      }

      // Add new marker
      this.locationMarker = new mapboxgl.Marker(el, {
        offset: [0, -41 / 2]
      })
      .setLngLat([lon, lat])
      .addTo(this.Map)

      this.Map.flyTo({
        center: [lon, lat],
        zoom: 10
      })
    },
    isValidLatLon () {
      return (typeof this.$route.query.lat === 'string' && typeof this.$route.query.lon === 'string' && this.$route.query.lat.length && this.$route.query.lon.length && !isNaN(this.$route.query.lat) && !isNaN(this.$route.query.lon))
    }
  },
  computed: {

  },
  watch: {
    // When query params change for the same route (URL slug)
    '$route' (to, from) {
      if (this.isValidLatLon()) {
        this.Map.flyTo({
          center: [to.query.lon, to.query.lat],
          zoom: 10
        })
      } else {
        this.Map.flyTo({
          center: this.mapOptions.center,
          zoom: this.mapOptions.zoom
        })
      }
    }
  }
}
