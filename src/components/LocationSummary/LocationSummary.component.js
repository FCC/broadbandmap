import axios from 'axios'
import nbMap from '../NBMap/'
import EventHub from '../../_mixins/EventHub.js'
import nbMapSidebar from '../NBMap/NBMapSidebar/'
import { urlValidation } from '../../_mixins/urlValidation.js'
import { sourcesTechSpeed, layersTechSpeed } from '../NBMap/layers-techSpeed.js'
import { updateMapLayers } from '../../_mixins/map-update-layers.js'
export default {
  name: 'LocationSummary',
  components: { axios, nbMap, nbMapSidebar },
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
      },
      defaultTech: 'acfosw',
      defaultSpeed: '25_3'
    }
  },
  mounted () {
    EventHub.$on('updateMapSettings', (selectedTech, selectedSpeed) => this.updateTechSpeed(selectedTech, selectedSpeed))
    EventHub.$on('removeLayers', (propertyID, removeAll) => this.removeLayers(propertyID, removeAll))
  },
  destroyed () {
    EventHub.$off('updateMapSettings')
    EventHub.$off('removeLayers')
  },
  methods: {
    mapInit (map, mapOptions) {
      const vm = this

      this.Map = map
      this.mapOptions = mapOptions

      this.Map.on('style.load', () => {
        // If one or more technologies is selected, then reload the tech/speed layers when the base layer style is changed
        // Need to reload tech/speed layers so the labels will appear on top
        if (!vm.removeAllLayers) {
          // If no tech is selected use default tech and speed settings
          if (vm.selectedTech === undefined) {
            vm.updateTechSpeed(vm.defaultTech, vm.defaultSpeed)
          } else {
            vm.updateTechSpeed(vm.selectedTech, vm.selectedSpeed)
          }
        }
        // Trigger reload of highlighted block when base layer style is changed
        this.validateURL()
      })
    },
    validateURL () {
      // If valid latitude and longitude get the FIPS and highlight the census block
      if (this.isValidLatLon(this.$route.query.lat, this.$route.query.lon)) {
        this.getFIPS(this.$route.query.lat.trim(), this.$route.query.lon.trim())
      // If invalid lat or lon are passed in, remove from the query string
      } else if (this.$route.query.lat !== undefined || this.$route.query.lon !== undefined) {
        this.$router.push('location-summary')
      }
    },
    // Called when map is clicked ('map-click' event emitted by NBMap component)
    getLatLon (event) {
      let lat = event.lngLat.lat.toFixed(6)
      let lon = event.lngLat.lng.toFixed(6)

      // Get FIPS
      this.getFIPS(lat, lon)

      // Update URL and query params
      this.$router.push({
        path: 'location-summary',
        query: {
          lat: `${lat}`,
          lon: `${lon}`
        }})
    },
    getFIPS (lat, lon) { // Call block API and expect FIPS and bounding box in response
      const blockAPI = 'https://www.broadbandmap.gov/broadbandmap/census/block'

      axios
          .get(blockAPI, {
            params: {
              longitude: lon,
              latitude: lat,
              format: 'json'
            }
          })
          .then(response => {
            if (response.data.Results.block.length !== 0) {
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
      let envelope = 0
      let envArray = []
      let placeName = this.$route.query.place_name

      // Get FIPS and envelope from response data
      fipsCode = response.data.Results.block[0].FIPS
      // Display on page
      this.censusBlock = fipsCode
      envelope = response.data.Results.block[0].envelope
      envArray = [envelope.minx, envelope.miny, envelope.maxx, envelope.maxy]

      // Zoom and center map to envelope
      this.Map.fitBounds(envArray, {
        animate: false,
        easeTo: true,
        maxZoom: 14,
        padding: 100
      })

      // Highlight the selected block
      this.Map.setFilter('block-highlighted', ['==', 'block_fips', fipsCode])
    },
    fetchProviderData (response) {
      let fipsCode = response.data.Results.block[0].FIPS
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
    },
    // Remove Census block & provider table results
    clearProviderTable () {
      this.censusBlock = ''
      this.providerRows = []
    }
  },
  watch: {
    // When query params change for the same route (URL slug)
    '$route' (to, from) {
      // If valid latitude and longitude get the FIPS and highlight the census block
      if (this.isValidLatLon(to.query.lat, to.query.lon)) {
        let lat = parseFloat(to.query.lat.trim())
        let lon = parseFloat(to.query.lon.trim())

        this.getFIPS(lat, lon)

      // If lat or lon become invalid, remove from the query string
      } else if (this.$route.query.lat !== undefined || this.$route.query.lon !== undefined) {
        this.$router.push('location-summary')
      // Otherwise fly to national view
      } else {
        this.clearProviderTable()
        this.Map.easeTo({
          center: this.mapOptions.center,
          zoom: this.mapOptions.zoom
        })
      }
    }
  }
}
