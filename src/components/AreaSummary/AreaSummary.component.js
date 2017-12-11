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
      defaultTech: 'acfosw',
      defaultSpeed: '25_3',
      popChartData: {
        labels: ['0.2', '10', '25', '50', '100'],
        datasets: []
      },
      urbanRuralChartData: {
        labels: ['Urban', 'Rural'],
        datasets: [{
          data: [4, 39, 10, 40, 20]
        },
        {
          data: [14, 39, 10, 40, 20]
        },
        {
          data: [82, 10, 12, 33, 20]
        },
        {
          data: [50, 20, 11, 13, 60]
        }]
      },
      tribalChartData: {
        labels: ['Tribal', 'Non-tribal'],
        datasets: [{
          data: [25, 39, 10, 40, 20]
        },
        {
          data: [25, 39, 10, 40, 20]
        },
        {
          data: [25, 10, 12, 33, 20]
        },
        {
          data: [25, 20, 11, 13, 60]
        }]
      },
      chartStyles: {width: 'auto', height: '350px'}
    }
  },
  mounted () {
    EventHub.$on('updateMapSettings', function (selectedTech, selectedSpeed) {
      this.updateTechSpeed(selectedTech, selectedSpeed) // calls common function in map-update-layers.js
    }.bind(this))
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
          // If no tech is selected use default tech and speed settings (calls common function in map-update-layers.js)
          if (vm.selectedTech === undefined) {
            vm.updateTechSpeed(vm.defaultTech, vm.defaultSpeed)
          } else {
            vm.updateTechSpeed(vm.selectedTech, vm.selectedSpeed)
          }
        }
      })
    },
    validateURL () {
      // If at least one query param was passed in, but "type" and "geoid" are not valid
      if (Object.keys(this.$route.query).length && (!this.isValidQueryParam('type') || !this.isValidQueryParam('geoid'))) {
        // Clear out any URL parameters that may exist (this has no effect if we're already looking at the default national view)
        this.$router.push('area-summary')
        // Prevent duplicate call
        return
      }
      this.fetchAreaData()
    },
    fetchAreaData () {
      const self = this

      this.showCharts = false

      let type = ''
      let id = 0
      let isValidType = ['state', 'county', 'place', 'cbsa', 'district', 'tribal'].indexOf(this.$route.query.type) !== -1
      // If the geoid and geography type are in the query string, use those
      if (typeof this.$route.query.type !== 'undefined' && isValidType && typeof this.$route.query.geoid !== 'undefined') {
        type = this.$route.query.type
        id = this.$route.query.geoid
      // Set defaults
      } else {
        type = 'nation'
        id = 0
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
          id: id,
          type: type,
          tech: this.selectedTech,
          //speed: speedNumeric,
          $order: 'speed',
          $$app_token: appToken
        },
        headers: httpHeaders
      })
      .then(function (response) {
        console.log('Socrata AREA table response= ', response)
        self.socrataData = response.data

        self.dedupSocrataData()
        self.calculateChartData()

        self.showCharts = true

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
    calculateChartData () {
      // Calculate population chart data

      this.popChartData = {
        labels: ['0.2', '10', '25', '50', '100'],
        datasets: [
          {data: [0, 0, 0, 0, 0]},
          {data: [0, 0, 0, 0, 0]},
          {data: [0, 0, 0, 0, 0]},
          {data: [0, 0, 0, 0, 0]}
        ]
      }

      for (let li in this.popChartData.labels) {
        let label = this.popChartData.labels[li]
        // Summarize
        for (let sdi in this.socrataData) {
          let sd = this.socrataData[sdi]
          if (sd.speed === label) {
            this.popChartData.datasets[0].data[li] += parseInt(sd.has_0)
            this.popChartData.datasets[1].data[li] += parseInt(sd.has_1)
            this.popChartData.datasets[2].data[li] += parseInt(sd.has_2)
            this.popChartData.datasets[3].data[li] += parseInt(sd.has_3plus)
          }
        }
        // Normalize
        let labelTotalPop = 0.0
        for (let i = 0; i < 4; i++) {
          labelTotalPop += this.popChartData.datasets[i].data[li]
        }
        console.log(label, labelTotalPop)
        for (let i = 0; i < 4; i++) {
          this.popChartData.datasets[i].data[li] = 100.0 * this.popChartData.datasets[i].data[li] / (1.0 * labelTotalPop)
        }
      }
      console.log(this.popChartData)

      // Calculate urban/rural

      // Calculate tribal/non-tribal
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
