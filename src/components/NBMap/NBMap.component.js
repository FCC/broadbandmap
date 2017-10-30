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
        container: 'map-location',
        style: this.mapLayers,
        logoPosition: 'bottom-left',
        maxZoom: 16,
        minZoom: 3,
        center: [-94.96, 38.82],
        zoom: 3
      }
      // If valid latitude and longitude are in query string, override defaults, and zoom in
      if (this.isValidLatLon(this.$route.query.lat, this.$route.query.lon)) {
        this.mapOptions.center = [this.$route.query.lon.trim(), this.$route.query.lat.trim()]
        this.mapOptions.zoom = 15
      // If invalid lat or lon are passed in, remove from the query string
      } else if (this.$route.query.lat !== undefined || this.$route.query.lon !== undefined) {
        this.$router.push('location-summary')
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
    showBlock: function (event) { // Highlight census block when map is clicked
      let x = 0
      let y = 0
      let clickedPoint = []
      let feature = {}
      let bbx = ''
      let boundingBox = []

      // When the map is clicked, get x, y values from the clicked point
      if (event.point) {
        x = event.point.x
        y = event.point.y
        clickedPoint = [[x - 5, y - 5], [x + 5, y + 5]]
      }

      // Query the block layer based on the clicked point
      feature = this.Map.queryRenderedFeatures(clickedPoint, {layers: ['block']})

      // Get the bounding box of the selected feature
      bbx = feature[0].properties.bbox_arr
      boundingBox = JSON.parse(bbx)

      // Highlight the selected block
      this.Map.setFilter('block-highlighted', ['==', 'bbox_arr', bbx])

      // Zoom and center map to bounding box
      this.Map.fitBounds(boundingBox, {
        padding: 100
      })
    },
    highlightBlock (response) { // Highlight census block when map is searched
      let fipsCode = ''
      let envelope = 0
      let envArray = []
      let feature = {}

      // Get FIPS and envelope from response data
      fipsCode = response.data.Results.block[0].FIPS
      envelope = response.data.Results.block[0].envelope
      envArray = [envelope.minx, envelope.miny, envelope.maxx, envelope.maxy]

      // Zoom and center map to envelope
      this.Map.fitBounds(envArray, {
        animate: false,
        easeTo: true,
        padding: 100
      })

      // Query the block layer based on the FIPS code
      feature = this.Map.querySourceFeatures('block', {
        sourcelayer: 'nbm2_block2010geojson',
        filter: ['==', 'block_fips', fipsCode]
      })

      // Highlight the selected block
      this.Map.setFilter('block-highlighted', ['==', 'block_fips', fipsCode])
    }
  },
  computed: {

  },
  watch: {
    // When query params change for the same route (URL slug)
    '$route' (to, from) {
      const self = this
      let lat = parseFloat(to.query.lat.trim())
      let lon = parseFloat(to.query.lon.trim())

      // Highlight census block if valid lat, lon
      if (this.isValidLatLon(to.query.lat, to.query.lon)) {
        let blockAPI = 'https://www.broadbandmap.gov/broadbandmap/census/block'

        // Call block API and expect FIPS and bounding box in response
        axios
          .get(blockAPI, {
            params: {
              longitude: lon,
              latitude: lat,
              format: 'json'
            }
          })
          .then(self.highlightBlock)
          .catch(function (error) {
            if (error.response) {
              // Server responded with a status code that falls out of the range of 2xx
              console.log(error.response.data)
              console.log(error.response.status)
              console.log(error.response.headers)
            } else if (error.request) {
              // Request was made but no response was received
              console.log(error.request)
            } else {
              // Something happened in setting up the request that triggered an Error
              console.log('Error', error.message)
            }
            console.log(error)
          })
      // If lat or lon become invalid, remove from the query string
      } else if (this.$route.query.lat !== undefined || this.$route.query.lon !== undefined) {
        this.$router.push('location-summary')
      // Otherwise fly to national view
      } else {
        this.Map.flyTo({
          center: this.mapOptions.center,
          zoom: this.mapOptions.zoom
        })
      }
    }
  }
}
