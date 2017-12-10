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
      defaultTech: 'acfosw',
      defaultSpeed: '25_3',
      popChartData: {
        labels: ['0.2', '10', '25', '50', '100'],
        datasets: [{
          data: [40, 39, 10, 40, 20]
        },
        {
          data: [40, 39, 10, 40, 20]
        },
        {
          data: [20, 10, 12, 33, 20]
        },
        {
          data: [50, 20, 11, 13, 60]
        }]
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
        // Trigger reload when base layer style is changed
        this.validateURL()
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
      axios
      .get(socrataURL, {
        params: {
          id: id,
          type: type,
          tech: 'a',
          $order: 'speed',
          $$app_token: appToken
        },
        headers: httpHeaders
      })
      .then(function (response) {
        // console.log('Socrata response= ', response)
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
