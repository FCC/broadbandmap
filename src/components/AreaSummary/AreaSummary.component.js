import { mapGetters, mapMutations } from 'vuex'
import { Carousel, Slide } from 'uiv'
import { Spinner } from 'spin.js'
import axios from 'axios'

import nbMap from '../NBMap/'
import nbMapSidebar from '../NBMap/NBMapSidebar/'
import StackedBarChart from './StackedBarChart'
import MapAppearance from '@/components/NBMap/NBMapAppearance/'

import EventHub from '../../_mixins/EventHub.js'
import { urlValidation } from '../../_mixins/urlValidation.js'
import { updateMapLayers } from '../../_mixins/map-update-layers.js'
import { utility } from '../../_mixins/utilities.js'

export default {
  name: 'AreaSummary',
  components: { Carousel, Slide, Spinner, nbMap, nbMapSidebar, MapAppearance, StackedBarChart },
  props: [],
  mixins: [urlValidation, updateMapLayers, utility],
  data () {
    return {
      mapPositioned: false,
      socrataData: [],
      urbanTotal: 0,
      ruralTotal: 0,
      nonTribalTotal: 0,
      TribalTotal: 0,
      showCharts: false,
      settlementType: 'Settlement Type',
      popChartData: {
        labels: ['0.2/0.2', '4/1', '10/1', '25/3', '100/10', '250/25', '1000/100'],
        datasets: []
      },
      urbanRuralChartData: {
        labels: ['Urban', 'Rural'],
        datasets: []
      },
      tribalChartData: {
        labels: ['Non-tribal', 'Tribal'],
        datasets: []
      },
      chartStyles: {width: 'auto', height: '350px'},
      sidebarTitle: '',
      mapSpeedToSocrata: {'200': '0.2', '4_1': '4', '10_1': '10', '25_3': '25', '100_10': '100', '250_25': '250', '1000/100': '1000'}
    }
  },
  mounted () {
    const self = this

    this.setMapView({})

    this.setGeogSearch({
      type: 'nation',
      geoid: 0,
      bbox_arr: undefined
    })

    this.setBroadband({
      tech: this.defaultTech,
      speed: this.defaultSpeed
    })

    EventHub.$on('searchByGeog', (searchType, typeaheadModel) => this.searchByGeog(searchType, typeaheadModel))

    EventHub.$on('updateMapSettings', function (selectedTech, selectedSpeed) {
      self.updateTechSpeed(selectedTech, selectedSpeed)
      self.fetchAreaData()
    })

    EventHub.$on('removeLayers', (propertyID, removeAll) => this.removeLayers(propertyID, removeAll))
    EventHub.$on('setOpacity', (opacity) => this.setOpacity(opacity))
    EventHub.$on('updateHighlight', (highlight) => this.updateHighlight(highlight))
    EventHub.$on('setWaterBlocks', (showWaterBlocks) => this.setWaterBlocks(showWaterBlocks))
    EventHub.$on('setUnPopBlocks', (showUnPopBlocks) => this.setUnPopBlocks(showUnPopBlocks))

    // Options for spinner graphic
    this.spinnerOpts = {
      lines: 9, // The number of lines to draw
      length: 19, // The length of each line
      width: 9, // The line thickness
      radius: 13, // The radius of the inner circle
      scale: 0.7, // Scales overall size of the spinner
      corners: 1, // Corner roundness (0..1)
      color: '#ffcc44 ', // CSS color or array of colors
      fadeColor: 'transparent', // CSS color or array of colors
      opacity: 0.2, // Opacity of the lines
      rotate: 71, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      speed: 1.4, // Rounds per second
      trail: 64, // Afterglow percentage
      fps: 20, // Frames per second when using setTimeout() as a fallback in IE 9
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      className: 'spinner', // The CSS class to assign to the spinner
      top: '25%', // Top position relative to parent
      left: '50%', // Left position relative to parent
      shadow: 'none', // Box-shadow for the lines
      position: 'relative' // Element positioning
    }

    this.spinnerTarget = document.getElementById('spinner')
  },
  destroyed () {
    EventHub.$off('searchByGeog')
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
      'getMapView',
      'getGeogSearch'
    ]),
    ...mapMutations([
      // Mount store mutation functions
      'setBroadband',
      'setMapView',
      'setGeogSearch'
    ]),
    mapInit (map, mapOptions) {
      this.Map = map
      this.mapOptions = mapOptions

      this.Map.on('style.load', () => {
        // Get the URL query params and update the map view
        this.loadParamsFromUrl()
        this.positionMapView()
        this.fetchAreaData()

        // If one or more technologies is selected, then reload the tech/speed layers when the base layer style is changed
        // Need to reload tech/speed layers so the labels will appear on top
        if (!this.removeAllLayers) {
          this.updateTechSpeed(this.getBroadband().tech, this.getBroadband().speed)
        }
      })
    },
    searchByGeog (searchType, typeaheadModel) {
      let geoid = typeaheadModel.geoid
      let bbox_arr = typeaheadModel.bbox_arr

       // Reset the map view
      this.setMapView({})

      // Store the geog search geoid and bbox_arr
      this.setGeogSearch({
        type: searchType,
        geoid: geoid,
        bbox_arr: bbox_arr
      })

      // Update the URL with store params
      this.updateURL()

      // Get the chart data
      this.fetchAreaData()
    },
    fetchAreaData () {
      const self = this

      // Hide charts before data refreshes
      this.showCharts = false

      // Display spinner while chart data loads
      if (!this.spinner) {
        this.spinner = new Spinner(this.spinnerOpts).spin(this.spinnerTarget)
      } else {
        this.spinner.spin(this.spinnerTarget)
      }

      // Set defaults
      let geogType = 'nation'
      let geoid = 0

      if (this.getGeogSearch().geoid !== 0) {
        geogType = this.getGeogSearch().type
        geoid = this.getGeogSearch().geoid
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
     /* let speedNumeric = 0

      if (this.selectedSpeed === '200') {
        speedNumeric = 0.2
      } else if (this.selectedSpeed === '4_1') {
        speedNumeric = 4
      } else if (this.selectedSpeed === '10_1') {
        speedNumeric = 10
      } else if (this.selectedSpeed === '25_3') {
        speedNumeric = 25
      } else if (this.selectedSpeed === '100_10') {
        speedNumeric = 100
      } else if (this.selectedSpeed === '250_25') {
        speedNumeric = 250
      } else if (this.selectedSpeed === '1000_100') {
        speedNumeric = 1000
      } */

      axios
      .get(socrataURL, {
        params: {
          id: geoid,
          type: geogType,
          tech: this.getBroadband().tech,
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

          self.calculatepopChartData()
          self.calculateUrbanRuralChartData()
          self.calculateTribalChartData()

          self.showCharts = true
          self.spinner.stop()
        }

        if (self.selectedTech === '') {
          self.spinner.stop()
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
          // Display name of searched geography in sidebar
          this.sidebarTitle = response.data[0].name

          // Get lat/lon pair
          let bbox = response.data[0].bbox_arr.replace(/{/g, '').replace(/}/g, '')
          let envArray = bbox.split(',')

          // Don't reposition map if current geoid is the same as previous search
          if (this.getGeogSearch().geoid !== this.prevGeoID) {
            this.Map.fitBounds(envArray, {
              animate: false,
              easeTo: true,
              padding: 100
            })
          }

          // Clear existing geography highlight
          if (this.prevGeogType !== undefined) {
            this.Map.setFilter(this.prevGeogType + '-highlighted', ['==', 'GEOID', ''])
          }

          // Highlight the selected geography type based on geoid
          this.geogHighlight = geogType + '-highlighted'
          this.Map.setFilter(this.geogHighlight, ['==', 'GEOID', geoid])
          this.prevGeogType = geogType
          this.prevGeoID = geoid

           // Position map based on view (vlat, vlon, vzoom)
          this.positionMapView()
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
              sd.has_3more === dedupList[ddli].has_3more) {
            found = true
            break
          }
        }
        if (found) {
          // Duplicate, must be ignored
          continue
        } else {
          dedupList.push({speed: sd.speed, has_0: sd.has_0, has_1: sd.has_1, has_2: sd.has_2, has_3more: sd.has_3more})
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

          if (sd[label_field] === label && (label_field === 'speed' || sd.speed === this.mapSpeedToSocrata[this.selectedSpeed])) {
            chartData.datasets[0].data[li] += parseInt(sd.has_0)
            chartData.datasets[1].data[li] += parseInt(sd.has_1)
            chartData.datasets[2].data[li] += parseInt(sd.has_2)
            chartData.datasets[3].data[li] += parseInt(sd.has_3more)
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

        // Display Urban, Rural totals in chart slide
        if (label_field === 'urban_rural') {
          if (label === 'U') {
            this.urbanTotal = this.formatNumberCommas(labelTotalPop)
          }

          if (label === 'R') {
            this.ruralTotal = this.formatNumberCommas(labelTotalPop)
          }
        }

        // Display Non-tribal, Tribal totals in chart slide
        if (label_field === 'tribal_non') {
          if (label === 'N') {
            this.nonTribalTotal = this.formatNumberCommas(labelTotalPop)
          }

          if (label === 'T') {
            this.tribalTotal = this.formatNumberCommas(labelTotalPop)
          }
        }
      }

      return chartData
    },
    calculatepopChartData () {
      this.popChartData.datasets = [
        {data: [0, 0, 0, 0, 0, 0, 0]},
        {data: [0, 0, 0, 0, 0, 0, 0]},
        {data: [0, 0, 0, 0, 0, 0, 0]},
        {data: [0, 0, 0, 0, 0, 0, 0]}
      ]

      this.popChartData = this.aggregate(this.popChartData, 'speed', {'0.2/0.2': '0.2', '4/1': '4', '10/1': '10', '25/3': '25', '100/10': '100', '250/25': '250', '1000/100': '1000'})
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
    },
    viewNationwide () {
      // Clear search box
      document.getElementById('addr').value = ''

      // Remove map highlight
      let layerExists = this.Map.getLayer(this.geogHighlight)
      if (layerExists) {
        this.Map.setFilter(this.geogHighlight, ['==', 'GEOID', ''])
      }

      this.setGeogSearch({
        type: 'nation',
        geoid: 0,
        bbox_arr: undefined
      })

      this.setMapView({})

      this.updateURL()
      this.fetchAreaData()
    },
    positionMapView () {
      // Position map based on view params (vlat, vlon, vzoom)
      if (this.getMapView().vlat !== undefined && this.getMapView().vlon !== undefined) {
        this.Map.jumpTo({
          center: [this.getMapView().vlon, this.getMapView().vlat],
          zoom: this.getMapView().vzoom
        })

        this.mapPositioned = true
      }
    },
    mapZoomEnd (event) {
      let mapCenter = this.Map.getCenter()

      // If map already positioned, don't update it again
      if (this.mapPositioned) {
        this.mapPositioned = false

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
    loadParamsFromUrl () { // Use URL params if valid, otherwise use default values from store
      // Validate geography search
      let isValidType = ['state', 'county', 'place', 'cbsa', 'cd', 'tribal'].indexOf(this.$route.query.type) !== -1

      if (this.$route.query.type !== 'undefined' && isValidType && typeof this.$route.query.geoid !== 'undefined') {
        this.setGeogSearch({
          type: this.$route.query.type,
          geoid: this.$route.query.geoid,
          bbox_arr: this.$route.query.bbox_arr
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
      let routeQueryParams = Object.assign({}, this.getGeogSearch(), this.getBroadband(), this.getMapView())

      this.$router.replace({
        name: 'AreaSummary',
        query: routeQueryParams
      })
    }
  },
  watch: {
    // When query params change for the same route (URL slug)
    '$route' (to, from) {
      // Hide charts when all tech/speed layers removed
      if (this.removeAllLayers) {
        this.showCharts = false
      }

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
