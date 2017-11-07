import axios from 'axios'
import nbMap from '../NBMap/'
import nbMapSidebar from '../NBMap/NBMapSidebar/'
import { urlValidation } from '../../_mixins/urlValidation.js'

export default {
  name: 'LocationSummary',
  components: { axios, nbMap, nbMapSidebar },
  mixins: [urlValidation],
  methods: {
    mapInit (map, mapOptions) {
      this.Map = map
      this.mapOptions = mapOptions

      // If valid latitude and longitude get the FIPS and highlight the census block
      if (this.isValidLatLon(this.$route.query.lat, this.$route.query.lon)) {
        this.getFIPS(this.$route.query.lat.trim(), this.$route.query.lon.trim())
      // If invalid lat or lon are passed in, remove from the query string
      } else if (this.$route.query.lat !== undefined || this.$route.query.lon !== undefined) {
        this.$router.push('location-summary')
      }
    },
    getLatLon (event) {
      let lat = event.lngLat.lat
      let lon = event.lngLat.lng

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
      let feature = {}
      let placeName = this.$route.query.place_name

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
    },
    fetchProviderData (response) {
      console.log('fetchProviderData(), response= ', response)
      let fipsCode = response.data.Results.block[0].FIPS
      console.log('fipsCode= ', fipsCode)
      axios
      .get('https://opendata.fcc.gov/resource/gx6m-8dv6.json', {
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
      console.log('populateProviderTable(), response=', response)
      let data = response.data
      let dataStr = ''
      for (var index in data) {
        dataStr += data[index].hocofinal + ' - ' + data[index].techcode + ' - ' + data[index].maxaddown + ' - ' + data[index].maxadup + '\n'
      }
      console.log(dataStr)
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
        this.Map.easeTo({
          center: this.mapOptions.center,
          zoom: this.mapOptions.zoom
        })
      }
    }
  }
}
