import { mapGetters, mapMutations } from 'vuex'
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
      mapView: {},
      setMapPosition: false,
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
    // Set block coords and map view to default
    this.setAddrSearch({})
    this.setBlock({})
    this.setMapView({})

    this.setBroadband({
      tech: this.defaultTech,
      speed: this.defaultSpeed
    })

    // EventHub.$on('searchByAddr', this.updateURLParams)
    EventHub.$on('searchByAddr', (typeaheadModel) => this.searchByAddr(typeaheadModel))
    EventHub.$on('searchByCoords', (coordinates) => this.searchByCoords(coordinates))
    EventHub.$on('updateMapSettings', (selectedTech, selectedSpeed) => this.updateTechSpeed(selectedTech, selectedSpeed))
    EventHub.$on('removeLayers', (propertyID, removeAll) => this.removeLayers(propertyID, removeAll))
    EventHub.$on('setOpacity', (opacity) => this.setOpacity(opacity))
    EventHub.$on('updateHighlight', (highlight) => this.updateHighlight(highlight))
    EventHub.$on('setWaterBlocks', (showWaterBlocks) => this.setWaterBlocks(showWaterBlocks))
    EventHub.$on('setUnPopBlocks', (showUnPopBlocks) => this.setUnPopBlocks(showUnPopBlocks))
  },
  destroyed () {
    EventHub.$off('searchByAddr')
    EventHub.$off('searchByCoords')
    EventHub.$off('updateMapSettings')
    EventHub.$off('removeLayers')
    EventHub.$off('setOpacity')
    EventHub.$off('updateHighlight')
    EventHub.$off('setWaterBlocks')
    EventHub.$off('setUnPopBlocks')
  },
  methods: {
    ...mapGetters([
      // Mount store getters to component scope
      'getBroadband',
      'getBlock',
      'getMapView',
      'getAddrSearch'
    ]),
    ...mapMutations([
      // Mount store mutation functions
      'setBroadband',
      'setBlock',
      'setMapView',
      'setAddrSearch'
    ]),
    mapInit (map, mapOptions) {
      this.Map = map
      this.mapOptions = mapOptions

      this.Map.on('style.load', () => {
        // Get the URL query params and update the map view
        this.loadParamsFromUrl()
        this.positionMapView()

        // If one or more technologies is selected, then reload the tech/speed layers when the base layer style is changed
        // Need to reload tech/speed layers so the labels will appear on top
        if (!this.removeAllLayers) {
          this.updateTechSpeed(this.getBroadband().tech, this.getBroadband().speed)
        }
      })
    },
    searchByAddr (typeaheadModel) {
      let lat = typeaheadModel.center[1].toFixed(6)
      let lon = typeaheadModel.center[0].toFixed(6)

       // Reset the map view
      this.setMapView({})

      // Store the search query (place_name)
      this.setAddrSearch({
        place_name: typeaheadModel.place_name
      })

      // Store the location coords
      this.setBlock({
        lat: lat,
        lon: lon
      })

      // Update the URL with store params
      this.updateURL()

      // Get the block FIPS
      this.getFIPS(lat, lon)
    },
    searchByCoords (coords) {
      let lat = coords[0]
      let lon = coords[1]

      // Reset address search
      this.setAddrSearch({})

      // Reset the map view
      this.setMapView({})

      // Store the block coords
      this.setBlock({
        lat: lat,
        lon: lon
      })

      // Update the URL with store params
      this.updateURL()

       // Get the block FIPS
      this.getFIPS(lat, lon)
    },
    getLatLon (event) {  // Called when map is clicked ('map-click' event emitted by NBMap component)
      this.lat = event.lngLat.lat.toFixed(6)
      this.lon = event.lngLat.lng.toFixed(6)

      // Get block FIPS
      this.getFIPS(this.lat, this.lon)

      // Remove vlat, vlon param when map clicked
      if (this.$route.query.vlat && this.$route.query.vlon) {
        this.setMapView({})
      }

      // Reset the address query
      this.setAddrSearch({
        place_name: undefined
      })

      // Store the block coords
      this.setBlock({
        lat: this.lat,
        lon: this.lon
      })

     // Update the URL with store params
      this.updateURL()
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

      this.positionMapView()
    },
    positionMapView () {
      // Position map based on view params (vlat, vlon, vzoom)
      if (this.getMapView().vlat !== undefined && this.getMapView().vlon !== undefined) {
        this.Map.jumpTo({
          center: [this.getMapView().vlon, this.getMapView().vlat],
          zoom: this.getMapView().vzoom
        })

        this.setMapPosition = true
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
      this.clearProviderTable()

      // Hide alert message for no providers
      this.noProviders = false

      // Reset store params
      this.setBlock({})
      this.setAddrSearch({})
      this.setMapView({})

      this.updateURL()
    },
    mapZoomEnd (event) {
      let mapCenter = this.Map.getCenter()

      // If map already positioned, don't update it again
      if (this.setMapPosition) {
        this.setMapPosition = false

        return
      }

      this.setMapView({
        vlat: mapCenter.lat.toString(),
        vlon: mapCenter.lng.toString(),
        vzoom: this.Map.getZoom()
      })

      this.updateURL()
    },
    mapDragEnd () { // When map drag event ends, update URL with vlat, vlon, vzoom
      let mapCenter = this.Map.getCenter()

      this.setMapView({
        vlat: mapCenter.lat.toString(),
        vlon: mapCenter.lng.toString(),
        vzoom: this.Map.getZoom()
      })

      this.updateURL()
    },
    loadParamsFromUrl () {
      // Validate address
      if (this.isValidAddress(this.$route.query.place_name)) {
        this.setAddrSearch({
          place_name: this.$route.query.place_name
        })
      }

      // Validate tech and speed
      let tech = this.$route.query.tech
      let speed = this.$route.query.speed

      if (this.isValidTech(tech) && this.isValidSpeed(speed)) {
        this.setBroadband({
          tech: tech,
          speed: speed
        })

        EventHub.$emit('loadBroadband', tech, speed)
      }

      // Validate block lat and lon
      if (this.isValidLatLon(this.$route.query.lat, this.$route.query.lon)) {
        let lat = this.$route.query.lat.trim()
        let lon = this.$route.query.lon.trim()

        this.setBlock({
          lat: lat,
          lon: lon
        })

        this.getFIPS(lat, lon)
      }

      // Validate view lat and lon
      if (this.isValidLatLon(this.$route.query.vlat, this.$route.query.vlon)) {
        this.setMapView({
          vlat: this.$route.query.vlat.trim(),
          vlon: this.$route.query.vlon.trim(),
          vzoom: this.$route.query.vzoom
        })
      }

      this.updateURL()
    },
    updateURL () { // Update URL with values from store
      let routeQueryParams = Object.assign({}, this.getAddrSearch(), this.getBlock(), this.getBroadband(), this.getMapView())

      this.$router.replace({
        name: 'LocationSummary',
        query: routeQueryParams
      })
    }
  },
  watch: {
    // When query params change for the same route (URL slug)
    '$route' (to, from) {
      // If no query params, reset map to default center and zoom
      if (Object.keys(to.query).length === 0 && to.query.constructor === Object) {
        this.viewNationwide()

        this.Map.easeTo({
          center: this.mapOptions.center,
          zoom: this.mapOptions.zoom
        })
      }
    }
  }
}
