import axios from 'axios'

import nbMap from '../NBMap/'
import nbMapSidebar from '../NBMap/NBMapSidebar/'
import MapAppearance from '@/components/NBMap/NBMapAppearance/'

import EventHub from '../../_mixins/EventHub.js'
import { urlValidation } from '../../_mixins/urlValidation.js'
import { updateMapLayers } from '../../_mixins/map-update-layers.js'

export default {
  name: 'LocationSummary',
  components: { axios, nbMap, nbMapSidebar, MapAppearance },
  mixins: [urlValidation, updateMapLayers],
  data () {
    return {
      censusBlock: '',
      providerColumns: [
        {
          label: 'Provider',
          field: 'provider',
          width: '150px'
        },
        {
          label: 'Tech',
          field: 'tech',
          width: '20px'
        },
        {
          label: 'Down (Mbps)',
          field: 'down',
          type: 'number',
          width: '20px'
        },
        {
          label: 'Up (Mbps)',
          field: 'up',
          type: 'number',
          width: '20px'
        }
      ],
      providerRows: [],
      techCodes: {
        10: 'ADSL',
        11: 'ADSL',
        12: 'ADSL',
        13: 'ADSL',
        40: 'Cable',
        41: 'Cable',
        42: 'Cable',
        43: 'Cable',
        50: 'Fiber',
        0: 'Other',
        90: 'Other',
        20: 'Other',
        30: 'Other',
        60: 'Satellite',
        70: 'Fixed Wireless'
      }
    }
  },
  mounted () {
    EventHub.$on('updateAddrSearch', this.updateURLParams)
    EventHub.$on('updateMapSettings', (selectedTech, selectedSpeed) => this.updateTechSpeed(selectedTech, selectedSpeed))
    EventHub.$on('removeLayers', (propertyID, removeAll) => this.removeLayers(propertyID, removeAll))
    EventHub.$on('updateOpacity', (opacity) => this.updateOpacity(opacity))
    EventHub.$on('updateHighlight', (highlight) => this.updateHighlight(highlight))
    EventHub.$on('setWaterBlocks', (showWaterBlocks) => this.setWaterBlocks(showWaterBlocks))
  },
  destroyed () {
    EventHub.$off('updateAddrSearch')
    EventHub.$off('updateMapSettings')
    EventHub.$off('removeLayers')
    EventHub.$off('updateOpacity')
    EventHub.$off('updateHighlight')
    EventHub.$off('setWaterBlocks')
  },
  methods: {
    mapInit (map, mapOptions) {
      this.Map = map
      this.mapOptions = mapOptions

      this.Map.on('style.load', () => {
        // If one or more technologies is selected, then reload the tech/speed layers when the base layer style is changed
        // Need to reload tech/speed layers so the labels will appear on top
        if (!this.removeAllLayers) {
          let tech = this.$route.query.selectedTech
          let speed = this.$route.query.selectedSpeed

          // If tech/speed query params are invalid, use default tech and speed
          if (!this.isValidTech(tech) || !this.isValidSpeed(speed)) {
            this.updateTechSpeed(this.defaultTech, this.defaultSpeed)
          } else {
            this.updateTechSpeed(tech.toLowerCase(), speed)
          }
        }
        // Trigger reload of highlighted block when base layer style is changed
        this.validateURL()
      })
    },
    validateURL () {
      // If valid latitude and longitude, get the FIPS and highlight the census block
      if (this.isValidLatLon(this.$route.query.lat, this.$route.query.lon)) {
        this.getFIPS(this.$route.query.lat.trim(), this.$route.query.lon.trim())

      // If invalid lat or lon are passed in, remove from the query string
      } else if (this.$route.query.lat !== undefined || this.$route.query.lon !== undefined) {
        this.updateURLParams()
      } else {
        this.clearProviderTable()

        this.Map.easeTo({
          center: this.mapOptions.center,
          zoom: this.mapOptions.zoom
        })

        this.updateURLParams()

        // Hide alert message for no providers
        this.noProviders = false
      }

      // If all layers are removed, update tech/speed layers based on URL history
      if (!this.removeAllLayers) {
        this.updateTechSpeed(this.$route.query.selectedTech, this.$route.query.selectedSpeed)
      }
    },
    updateURLParams (event) {
      let routeQueryParams = {}

      // Get existing route query parameters
      let routeQuery = this.$route.query

      // Remove place_name param when map clicked
      if (event !== undefined) {
        if (event.hasOwnProperty('type') && event.type === 'click') {
          delete routeQuery.place_name
        }
      }
      // Get map zoom level
      // let zoomLevel = this.Map.getZoom()

      // If lat is undefined get the value from URL param
      if (this.lat === undefined || this.lon === undefined) {
        if (this.isValidLatLon(this.$route.query.lat, this.$route.query.lon)) {
          this.lat = this.$route.query.lat
          this.lon = this.$route.query.lon
        }
      }

      // Add routeQuery properties to routeQueryParams
      Object.keys(routeQuery).map(property => {
        routeQueryParams[property] = routeQuery[property]
      })

      // Add select tech, selected speed, and zoom to routeQueryParams
      routeQueryParams.selectedTech = this.selectedTech
      routeQueryParams.selectedSpeed = this.selectedSpeed
      routeQueryParams.lat = this.lat
      routeQueryParams.lon = this.lon
      // routeQueryParams.zoom = zoomLevel

      // Update URL fragment
      this.$router.push({
        name: 'LocationSummary',
        query: routeQueryParams
      })

      // Reset lat, lon
      this.lat = (function () { })()
      this.lon = (function () { })()
    },
    getLatLon (event) {  // Called when map is clicked ('map-click' event emitted by NBMap component)
      this.lat = event.lngLat.lat.toFixed(6)
      this.lon = event.lngLat.lng.toFixed(6)

      // Get FIPS
      this.getFIPS(this.lat, this.lon)

      // Remove vlat, vlon param when map clicked
      if (this.$route.query.vlat) {
        delete this.$route.query.vlat
        delete this.$route.query.vlon
      }

      this.updateURLParams(event)
    },
    getFIPS (lat, lon) { // Call block API and expect FIPS and bounding box in response
      const blockAPI = process.env.BLOCK_API

      axios
          .get(blockAPI, {
            params: {
              longitude: lon,
              latitude: lat,
              format: 'json',
              showall: false
            }
          })
          .then(response => {
            if (response.data.Block.bbox.length !== 0) {
              this.highlightBlock(response, lat, lon)
              this.fetchProviderData(response)
            } else {
              this.clearProviderTable()
            }
          })
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
    },
    highlightBlock (response, lat, lon) { // Highlight census block when map is searched
      let fipsCode = ''
      let envArray = response.data.Block.bbox

      // Get FIPS and envelope from response data
      fipsCode = response.data.Block.FIPS

      // Display on page
      this.censusBlock = fipsCode

      // Zoom and center map to envelope
      this.Map.fitBounds(envArray, {
        animate: false,
        easeTo: true,
        padding: 100
      })

      // Highlight the selected block
      this.Map.setFilter('block-highlighted', ['==', 'block_fips', fipsCode])
      this.Map.setFilter('xlarge-blocks-highlighted', ['==', 'geoid10', fipsCode])

      // Center map based on view lat, lon
      if (this.isValidLatLon(this.$route.query.vlat, this.$route.query.vlon)) {
        this.Map.jumpTo({
          center: [this.$route.query.vlon, this.$route.query.vlat]
        })
      }
    },
    fetchProviderData (response) {
      let fipsCode = response.data.Block.FIPS

      axios
      .get(process.env.SOCRATA_PROD_FULL, {
        params: {
          blockcode: fipsCode,
          consumer: 1,
          $$app_token: process.env.SOCRATA_APP_TOKEN
        }
      })
      .then(this.populateProviderTable)
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
    },
    populateProviderTable (response) {
      let data = response.data
      // Clear any existing values in the provider array
      this.providerRows = []
      let techCode = ''

      // Loop through all providers
      for (var index in data) {
        if (typeof this.techCodes[data[index].techcode] !== 'undefined') {
          techCode = this.techCodes[data[index].techcode]
        } else {
          techCode = ''
        }

        // Add this provider to the array
        this.providerRows.push({
          id: index,
          provider: data[index].hocofinal,
          tech: techCode,
          down: data[index].maxaddown,
          up: data[index].maxadup
        })
      }

      // Trigger warning message when num. providers = 0
      this.noProviders = !(this.providerRows.length > 0)
    },
    clearProviderTable () { // Remove Census block & provider table results
      this.censusBlock = ''
      this.providerRows = []
    },
    viewNationwide () {
      let routeQuery = this.$route.query

      this.clearProviderTable()

      this.$router.replace({
        name: 'LocationSummary',
        query: {
          selectedTech: routeQuery.selectedTech,
          selectedSpeed: routeQuery.selectedSpeed
        }
      })

      // Hide alert message for no providers
      this.noProviders = false
    },
    mapDragEnd (event) { // When map drag event ends, update URL with vlat, vlon
      let mapCenter = this.Map.getCenter()

      let routeQueryParams = {}

      // Get existing route query parameters
      let routeQuery = this.$route.query

      // Add routeQuery properties to routeQueryParams
      Object.keys(routeQuery).map(property => {
        routeQueryParams[property] = routeQuery[property]
      })

      routeQueryParams.vlat = mapCenter.lat.toString()
      routeQueryParams.vlon = mapCenter.lng.toString()

      // Only update URL fragment when block lat, lon exist
      if (routeQuery.lat && routeQuery.lon) {
        this.$router.replace({
          name: 'LocationSummary',
          query: routeQueryParams
        })
      }
    }
  },
  watch: {
    // When query params change for the same route (URL slug)
    '$route' (to, from) {
      this.validateURL()
    }
  }
}
