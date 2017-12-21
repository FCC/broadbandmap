import { Carousel, Slide } from 'uiv'
import axios from 'axios'

import nbMap from '../NBMap/'
import nbMapSidebar from '../NBMap/NBMapSidebar/'
import StackedBarChart from './StackedBarChart'

import EventHub from '../../_mixins/EventHub.js'
import { urlValidation } from '../../_mixins/urlValidation.js'
import { updateMapLayers } from '../../_mixins/map-update-layers.js'

export default {
  name: 'AreaSummary',
  components: { Carousel, Slide, nbMap, nbMapSidebar, StackedBarChart },
  props: [],
  mixins: [urlValidation, updateMapLayers],
  data () {
    return {
      socrataData: [],
      showCharts: false,
      settlementType: 'Settlement Type',
      popChartData: {
        labels: ['0.2', '10', '25', '50', '100'],
        datasets: []
      },
      urbanRuralChartData: {
        labels: ['Urban', 'Rural'],
        datasets: []
      },
      tribalChartData: {
        labels: ['Tribal', 'Non-tribal'],
        datasets: []
      },
      chartStyles: {width: 'auto', height: '350px'},
      sidebarTitle: ''
    }
  },
  mounted () {
    EventHub.$on('updateGeogSearch', this.updateURLParams)
    EventHub.$on('updateMapSettings', (selectedTech, selectedSpeed) => this.updateTechSpeed(selectedTech, selectedSpeed))
    EventHub.$on('removeLayers', (propertyID, removeAll) => this.removeLayers(propertyID, removeAll))
  },
  destroyed () {
    EventHub.$off('updateMapSettings')
    EventHub.$off('removeLayers')
  },
  methods: {
    mapInit (map, mapOptions) {
      this.Map = map
      this.mapOptions = mapOptions

      this.Map.on('style.load', () => {
        // If one or more technologies is selected, then reload the tech/speed layers when the base layer style is changed
        // Need to reload tech/speed layers so the labels will appear on top
        if (!this.removeAllLayers) {
          // If no tech is selected use default tech and speed settings (calls common function in map-update-layers.js)
          if (this.$route.query.selectedTech === undefined) {
            this.updateTechSpeed(this.defaultTech, this.defaultSpeed)
            return
          }

          // If selectedTech parameter value is in the URL, use that value
          if (this.$route.query.selectedTech !== '') {
            this.updateTechSpeed(this.$route.query.selectedTech, this.$route.query.selectedSpeed)
          } else {
            this.fetchAreaData()
          }
        }

        this.validateURL()
      })
    },
    validateURL () {
      // If at least one query param was passed in, but "selectedTech" and "selectedSpeed" are not valid
      if (Object.keys(this.$route.query).length && (!this.isValidQueryParam('selectedTech') || !this.isValidQueryParam('selectedSpeed'))) {
        this.updateURLParams()
      }
      // Update charts, map, and sidebar title
      this.fetchAreaData()
    },
    updateURLParams () {
      let routeQueryParams = {}

      // Get existing route query parameters
      let routeQuery = this.$route.query

      // Get map zoom level
      let zoomLevel = this.Map.getZoom()

      // Add routeQuery properties to routeQueryParams
      Object.keys(routeQuery).map(property => {
        routeQueryParams[property] = routeQuery[property]
      })

      // Add select tech, selected speed, and zoom to routeQueryParams
      routeQueryParams.selectedTech = this.selectedTech
      routeQueryParams.selectedSpeed = this.selectedSpeed
      // routeQueryParams.zoom = zoomLevel

      // Update URL fragment with routeQueryParams
      this.$router.replace({
        name: 'AreaSummary',
        query: routeQueryParams
      })
    },
    fetchAreaData () {
      const self = this

      // Hide charts before data refreshes
      this.showCharts = false

      // Set defaults
      let geogType = 'nation'
      let geoid = 0
      let isValidType = ['state', 'county', 'place', 'cbsa', 'cdist', 'tribal'].indexOf(this.$route.query.type) !== -1

      // If the geoid and geography type are in the query string, use those
      if (typeof this.$route.query.type !== 'undefined' && isValidType && typeof this.$route.query.geoid !== 'undefined') {
        geogType = this.$route.query.type
        geoid = this.$route.query.geoid
      }

      // Call Socrata API - Area table for charts
      let socrataURL = ''
      let appToken = ''
      let httpHeaders = {}

      if (process.env.SOCRATA_ENV === 'DEV') {
        socrataURL = process.env.SOCRATA_DEV_AREA
        httpHeaders = {
          // Dev: Authentication to Socrata using HTTP Basic Authentication
          'Authorization': 'Basic ' + process.env.SOCRATA_DEV_HTTP_BASIC_AUTHENTICATION
        }
      } else if (process.env.SOCRATA_ENV === 'PROD') {
        socrataURL = process.env.SOCRATA_PROD_AREA
        // Socrata does not currently enforce an app token, but may in the future
        appToken = process.env.SOCRATA_PROD_APP_TOKEN
      } else {
        console.log('ERROR: process.env.SOCRATA_ENV in .env file must be PROD or DEV, not ' + process.env.SOCRATA_ENV)
      }

      // Convert selectedSpeed to numeric value
      let speedNumeric = 0
      if (this.selectedSpeed === '200') {
        speedNumeric = 0.2
      } else if (this.selectedSpeed === '10_1') {
        speedNumeric = 10
      } else if (this.selectedSpeed === '25_3') {
        speedNumeric = 25
      } else if (this.selectedSpeed === '50_5') {
        speedNumeric = 50
      } else if (this.selectedSpeed === '100_10') {
        speedNumeric = 100
      }

      axios
      .get(socrataURL, {
        params: {
          id: geoid,
          type: geogType,
          tech: this.selectedTech,
          // speed: speedNumeric,
          $order: 'speed',
          $$app_token: appToken
        },
        headers: httpHeaders
      })
      .then(function (response) {
        // console.log('Socrata AREA table response= ', response)
        self.socrataData = response.data

        if (self.socrataData.length > 0) {
          self.dedupSocrataData()

          self.calculatePopChartData()
          self.calculateUrbanRuralChartData()
          self.calculateTribalChartData()

          self.showCharts = true
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
      // END of "area" table query

      // If this is the nationwide view
      if (geoid === 0) {
        this.sidebarTitle = 'Nationwide'
        // console.log('TODO: Revert the map back to the national view')
      // Otherwise this is a specific geography the user searched for
      } else {
        // Query lookup table for this specific geography
        if (process.env.SOCRATA_ENV === 'DEV') {
          socrataURL = process.env.SOCRATA_DEV_LOOKUP
        } else if (process.env.SOCRATA_ENV === 'PROD') {
          socrataURL = process.env.SOCRATA_PROD_LOOKUP
        }
        axios
        .get(socrataURL, {
          params: {
            geoid: geoid,
            type: geogType,
            $$app_token: appToken
          },
          headers: httpHeaders
        })
        .then(function (response) {
          // console.log('Socrata GEOGRAPHY DETAILS query response= ', response)
          // Display name of searched geography
          this.sidebarTitle = response.data[0].name
          // Get lat/lon pair
          let bbox = response.data[0].bbox_arr.replace(/{/g, '').replace(/}/g, '')
          let envArray = bbox.split(',')
          // Zoom and center map to envelope
          this.Map.fitBounds(envArray, {
            animate: false,
            easeTo: true,
            padding: 100
          })

          // Highlight the selected geography type based on geoid
          this.Map.setFilter(geogType + '-highlighted', ['==', 'geoid', geoid])
        }
        .bind(this))
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
        // END of query to lookup table
      }
    },
    dedupSocrataData () {
      let dedupList = []
      let dedupedSocrataData = []

      for (let sdi in this.socrataData) {
        var sd = this.socrataData[sdi]
        let found = false
        for (let ddli in dedupList) {
          if (sd.speed === dedupList[ddli].speed &&
              sd.has_0 === dedupList[ddli].has_0 &&
              sd.has_1 === dedupList[ddli].has_1 &&
              sd.has_2 === dedupList[ddli].has_2 &&
              sd.has_3plus === dedupList[ddli].has_3plus) {
            found = true
            break
          }
        }
        if (found) {
          // Duplicate, must be ignored
          continue
        } else {
          dedupList.push({speed: sd.speed, has_0: sd.has_0, has_1: sd.has_1, has_2: sd.has_2, has_3plus: sd.has_3plus})
          dedupedSocrataData.push(sd)
        }
      }
      this.socrataData = dedupedSocrataData
    },
    aggregate (chartData, label_field, label_code) {
      for (let li in chartData.labels) {
        let label = chartData.labels[li]
        if (label_code) label = label_code[label]
        // Summarize
        for (let sdi in this.socrataData) {
          let sd = this.socrataData[sdi]

          if (sd[label_field] === label) {
            chartData.datasets[0].data[li] += parseInt(sd.has_0)
            chartData.datasets[1].data[li] += parseInt(sd.has_1)
            chartData.datasets[2].data[li] += parseInt(sd.has_2)
            chartData.datasets[3].data[li] += parseInt(sd.has_3plus)
          }
        }
        // Normalize
        let labelTotalPop = 0.0
        for (let i = 0; i < 4; i++) {
          labelTotalPop += chartData.datasets[i].data[li]
        }
        for (let i = 0; i < 4; i++) {
          chartData.datasets[i].data[li] = (100.0 * chartData.datasets[i].data[li] / (1.0 * labelTotalPop)).toFixed(2)
        }
      }
      return chartData
    },
    calculatePopChartData () {
      this.popChartData.datasets = [
        {data: [0, 0, 0, 0, 0]},
        {data: [0, 0, 0, 0, 0]},
        {data: [0, 0, 0, 0, 0]},
        {data: [0, 0, 0, 0, 0]}
      ]
      this.popChartData = this.aggregate(this.popChartData, 'speed', undefined)
    },
    calculateUrbanRuralChartData () {
      this.urbanRuralChartData.datasets = [
        {data: [0, 0]},
        {data: [0, 0]},
        {data: [0, 0]},
        {data: [0, 0]}
      ]
      this.urbanRuralChartData = this.aggregate(this.urbanRuralChartData, 'urban_rural', {'Urban': 'U', 'Rural': 'R'})
    },
    calculateTribalChartData () {
      this.tribalChartData.datasets = [
        {data: [0, 0]},
        {data: [0, 0]},
        {data: [0, 0]},
        {data: [0, 0]}
      ]
      this.tribalChartData = this.aggregate(this.tribalChartData, 'tribal_non', {'Tribal': 'T', 'Non-tribal': 'N'})
    }

  },
  computed: {

  },
  watch: {
    // When query params change for the same route (URL slug)
    '$route' (to, from) {
      this.validateURL()
    }
  }
}
