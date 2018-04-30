import { mapGetters, mapMutations } from 'vuex'
import { Typeahead } from 'uiv'
import axios from 'axios'

import EventHub from '../../_mixins/EventHub.js'
import { urlValidation } from '../../_mixins/urlValidation.js'

const GEOGS = ['State', 'County', 'Congressional District', 'Census Place', 'Tribal Area', 'CBSA (MSA)']

export default {
  components: {
    Typeahead: Typeahead
  },
  mixins: [urlValidation],
  // Bind vars passed in via the <Autocomplete> tag
  props: ['placeholderText', 'searchType', 'originPage'],
  data () {
    return {
      typeaheadModel: '',
      dataSource: [],
      asyncSrc: '',
      asyncKey: '',
      itemKey: '',
      selectedItem: {}
    }
  },
  mounted () {
    // Check query string for initial values
    this.$nextTick(this.populateTypeahead)
  },
  methods: {
    ...mapGetters([
      // Mount store getters to component scope
      'getAppRelease',
      'getAddrSearch'
    ]),
    ...mapMutations([
      // Mount store mutation functions
      'setAddrSearch'
    ]),
    validateQuery (event) {
      // Validate address search
      if (this.searchType === 'Address') {
        if (this.getAddrSearch().place_name && this.getAddrSearch().place_name === this.typeaheadModel) {
          return
        }

        // If enter key pressed, wait for typeahead to be updated before validating
        setTimeout(() => {
          this.geoCode()
        }, 100)
      }

      // Validate coordinates search
      if (this.searchType === 'Coordinates') {
        this.validateCoords()
      }

      // Validate geography (state, county, etc.) search
      if (GEOGS.indexOf(this.searchType) > -1) {
        if (event && event.keyCode === 13) {
          // If enter key pressed, wait for typeahead to be updated before validating
          setTimeout(() => {
            this.selectedItem = this.typeaheadModel
            this.validateGeog()
          }, 100)
        } else {
          this.validateGeog()
        }
      }
    },
    geoCode () {
      let query = this.typeaheadModel.hasOwnProperty('place_name') ? this.typeaheadModel.place_name : this.typeaheadModel

      let geoCodeURL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + query + '.json?country=us&limit=10&access_token=' + process.env.MAPBOX_ACCESS_TOKEN + '&'

      if (query === '') {
        this.showError()
      } else {
        axios.get(geoCodeURL)
          .then(response => {
            let results = response.data.features

            let foundResult = results.filter(result => {
              return result.place_name === query
            })

            if (foundResult.length > 0) {
              this.typeaheadModel = foundResult[0]

              this.validateLocation()
            } else {
              this.showError()
            }
          })
          .catch(error => {
            this.showError()
          })
      }
    },
    validateLocation () {
      // Provider search is validated in Provider component
      if (this.searchType === 'Provider') {
        return
      }

      // If search type is geography (state, county, etc.) then validate geography, otherwise validate address
      if (GEOGS.indexOf(this.searchType) > -1) {
        this.validateGeog()
      } else if (typeof this.typeaheadModel === 'object' && typeof this.typeaheadModel.id === 'string') {
        this.gotoGeography()
        this.selectedItem = this.typeaheadModel

        this.setAddrSearch({
          place_name: this.typeaheadModel.place_name
        })
      } else {
        this.showError()
      }
    },
    validateCoords () {
      let coordinates = this.typeaheadModel.split(',')

      if (coordinates.length === 2 && this.isValidLatLon(coordinates[0], coordinates[1])) {
        this.coordinates = coordinates
        this.gotoGeography()
      } else {
        this.showError()
      }
    },
    validateGeog () {
      let searchTxt = document.getElementById('addr').value

      if (this.typeaheadModel.hasOwnProperty('geoid') && this.typeaheadModel.geoid !== '' && searchTxt !== '') {
        this.gotoGeography()
      } else {
        this.showError()
      }
    },

    // Called when user pressed enter or clicked search
    gotoGeography (event) {
      switch (this.searchType) {
        case 'Address':
          EventHub.$emit('searchByAddr', this.typeaheadModel)
          break
        case 'Coordinates':
          EventHub.$emit('searchByCoords', this.coordinates)
          break
        case 'State':
          if (this.originPage !== 'AreaComparison') {
            EventHub.$emit('searchByGeog', 'state', this.typeaheadModel)
          }
          break
        case 'CBSA (MSA)':
          EventHub.$emit('searchByGeog', 'cbsa', this.typeaheadModel)
          break
        case 'County':
          EventHub.$emit('searchByGeog', 'county', this.typeaheadModel)
          break
        case 'Congressional District':
          EventHub.$emit('searchByGeog', 'cd', this.typeaheadModel)
          break
        case 'Tribal Area':
          EventHub.$emit('searchByGeog', 'tribal', this.typeaheadModel)
          break
        case 'Census Place':
          EventHub.$emit('searchByGeog', 'place', this.typeaheadModel)
          break
        default:
          // console.log('DEBUG: No handler in gotoGeography() for searchType = ' + this.searchType)
          break
      }
    },
    showError () {
      let searchType = this.searchType
      let srchLabel = searchType === 'CBSA (MSA)' ? searchType : searchType.toLowerCase()

      let errorGeog = 'Please type then select a valid ' + srchLabel + ' from the search suggestions.'
      let errorCoords = 'Please enter valid coordinates in latitude, longitude format.'

      let errorMsg = searchType === 'Coordinates' ? errorCoords : errorGeog

      // Call Modal component in app footer
      EventHub.$emit('openModal', searchType + ' not found', errorMsg)

      // Clear search input
      this.typeaheadModel = ''
    },
    // Called by data() on init, and when searchType changes
    populateTypeahead () {
      if (this.searchType === 'Address') {
        this.dataSource = null
        this.asyncKey = 'features'
        this.itemKey = 'place_name'
        this.typeaheadModel = {
          place_name: this.isValidAddress(this.$route.query.place_name) ? this.$route.query.place_name : ''
        }
      } else if (this.searchType === 'Coordinates') {
        let lat = parseFloat(this.$route.query.lat).toFixed(6)
        let lon = parseFloat(this.$route.query.lon).toFixed(6)

        this.dataSource = null
        this.asyncSrc = null
        this.asyncKey = ''
        /* Clearing this throws error, but may need to come back to this later
        this.itemKey = ''
        */
        this.typeaheadModel = this.isValidLatLon(this.$route.query.lat, this.$route.query.lon) ? lat + ', ' + lon : ''
      } else if (this.searchType === 'State') {
        this.itemKey = 'name'
        this.asyncKey = ''
        this.fetchLookupTable('state')
      } else if (this.searchType === 'CBSA (MSA)') {
        this.itemKey = 'name'
        this.asyncKey = ''
        this.fetchLookupTable('cbsa')
      } else if (this.searchType === 'Tribal Area') {
        this.itemKey = 'name'
        this.asyncKey = ''
        this.fetchLookupTable('tribal')
      } else if (this.searchType === 'Census Place') {
        this.itemKey = 'name'
        this.asyncKey = ''
        this.fetchLookupTable('place')
      } else if (this.searchType === 'Congressional District') {
        this.itemKey = 'name'
        this.asyncKey = ''
        this.fetchLookupTable('cd')
      } else if (this.searchType === 'County') {
        this.itemKey = 'name'
        this.asyncKey = ''
        this.fetchLookupTable('county')
      } else if (this.searchType === 'Provider') {
        this.asyncKey = ''
        this.itemKey = 'hocofinal'
        this.fetchLookupTable('provider')
      } else {
        console.log('DEBUG: No handler in Autocomplete for searchType= ', this.searchType)
      }
    },
    // Call Socrata API - Lookup Table for geographies
    fetchLookupTable (fetchType) {
      const self = this
      // Call Socrata API - Combined Table for charts
      let socrataURL = ''
      let appToken = ''
      let httpHeaders = {}
      let axiosParams = {}

      if (fetchType === 'provider') {
        socrataURL = process.env.SOCRATA_PROD_FULL
        appToken = process.env.SOCRATA_PROD_APP_TOKEN
        axiosParams = {
          $select: 'hocofinal',
          $where: 'consumer=1',
          $group: 'hocofinal',
          $limit: 5000,
          $$app_token: appToken
        }
      } else {
        if (process.env.SOCRATA_ENV === 'DEV') {
          socrataURL = process.env.SOCRATA_DEV_LOOKUP
          httpHeaders = {
            // Dev: Authentication to Socrata using HTTP Basic Authentication
            'Authorization': 'Basic ' + process.env.SOCRATA_DEV_HTTP_BASIC_AUTHENTICATION
          }
        } else if (process.env.SOCRATA_ENV === 'PROD') {
          socrataURL = process.env.SOCRATA_PROD_LOOKUP
          // Socrata does not currently enforce an app token, but may in the future
          appToken = process.env.SOCRATA_PROD_APP_TOKEN
        } else {
          console.log('ERROR: process.env.SOCRATA_ENV in .env file must be PROD or DEV, not ' + process.env.SOCRATA_ENV)
        }

        axiosParams = {
          type: fetchType,
          $limit: 50000, // i.e. more than the default 1000
          $order: 'name',
          $$app_token: appToken
        }
      }

      axios
        .get(socrataURL, {
          params: axiosParams,
          headers: httpHeaders
        })
        .then(function (response) {
          self.dataSource = response.data
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
  watch: {
    // When user selects different geography, reconfigure Typeahead component
    searchType () {
      this.populateTypeahead()
    },
    typeaheadModel () {
      if (this.searchType === 'Address') {
        this.asyncSrc = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(this.typeaheadModel) + '.json?country=us&limit=10&access_token=' + process.env.MAPBOX_ACCESS_TOKEN + '&'
      }
    }
  }

}
