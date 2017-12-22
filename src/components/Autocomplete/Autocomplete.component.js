import axios from 'axios'
// Include the needed "uiv" library components
import { Typeahead } from 'uiv'
import { urlValidation } from '../../_mixins/urlValidation.js'
import EventHub from '../../_mixins/EventHub.js'
export default {
  components: {
    Typeahead: Typeahead
  },
  mixins: [urlValidation],
  // Bind vars passed in via the <Autocomplete> tag
  props: ['placeholderText', 'searchType', 'originPage'],
  // Initialize vars
  data () {
    return {
      typeaheadModel: '',
      dataSource: [],
      asyncSrc: '',
      asyncKey: '',
      itemKey: ''
    }
  },
  methods: {
    searchButtonClicked () {
      if (this.searchType !== 'Provider') {
        this.gotoGeography()
      }
    },
    enterClicked () {
      if (this.originPage !== 'AreaComparison' || this.originPage === 'ProviderDetail') {
        if (typeof this.typeaheadModel === 'object' || this.searchType !== 'Address') {
          this.gotoGeography()
        }
      }
    },
    // Called when user pressed enter or clicked search
    gotoGeography () {
      let newURL = ''
      switch (this.searchType) {
        case 'Address':
          if (typeof this.typeaheadModel === 'object' && typeof this.typeaheadModel.id === 'string') {
            // Create the URL
            newURL = 'location-summary?lat=' + this.typeaheadModel.center[1].toFixed(6) + '&lon=' + this.typeaheadModel.center[0].toFixed(6) + '&place_name=' + encodeURIComponent(this.typeaheadModel.place_name)
            this.$router.push(newURL)
            EventHub.$emit('updateAddrSearch')
          } else {
            // Call Modal component in app footer
            EventHub.$emit('openModal', 'No results found', 'Please enter and then select a valid U.S. address.')
          }
          break
        case 'Coordinates':
          let coordinatesArray = this.typeaheadModel.split(',')
          if (coordinatesArray.length === 2 && this.isValidLatLon(coordinatesArray[0], coordinatesArray[1])) {
            newURL = 'location-summary?lat=' + coordinatesArray[0].trim() + '&lon=' + coordinatesArray[1].trim()
            this.$router.push(newURL)
            EventHub.$emit('updateAddrSearch')
          } else {
            // Call Modal component in app footer
            EventHub.$emit('openModal', 'No results found', 'Please enter valid coordinates in "latitude, longitude" format.')
          }
          break
        case 'State':
          // console.log('gotoGeography(), searchType= ' + this.searchType + ', typeaheadModel= ', this.typeaheadModel)
          newURL = 'area-summary?type=state&geoid=' + this.typeaheadModel.geoid + '&bbox=' + this.typeaheadModel.bbox_arr
          this.$router.push(newURL)
          EventHub.$emit('updateGeogSearch')
          break
        case 'CBSA (MSA)':
          // console.log('gotoGeography(), searchType= ' + this.searchType + ', typeaheadModel= ', this.typeaheadModel)
          newURL = 'area-summary?type=cbsa&geoid=' + this.typeaheadModel.geoid + '&bbox=' + this.typeaheadModel.bbox_arr
          this.$router.push(newURL)
          EventHub.$emit('updateGeogSearch')
          break
        case 'County':
          // console.log('gotoGeography(), searchType= ' + this.searchType + ', typeaheadModel= ', this.typeaheadModel)
          newURL = 'area-summary?type=county&geoid=' + this.typeaheadModel.geoid + '&bbox=' + this.typeaheadModel.bbox_arr
          this.$router.push(newURL)
          EventHub.$emit('updateGeogSearch')
          break
        case 'Congressional District':
          // console.log('gotoGeography(), searchType= ' + this.searchType + ', typeaheadModel= ', this.typeaheadModel)
          newURL = 'area-summary?type=cdist&geoid=' + this.typeaheadModel.geoid + '&bbox=' + this.typeaheadModel.bbox_arr
          this.$router.push(newURL)
          EventHub.$emit('updateGeogSearch')
          break
        case 'Tribal Area':
          // console.log('gotoGeography(), searchType= ' + this.searchType + ', typeaheadModel= ', this.typeaheadModel)
          newURL = 'area-summary?type=tribal&geoid=' + this.typeaheadModel.geoid + '&bbox=' + this.typeaheadModel.bbox_arr
          this.$router.push(newURL)
          EventHub.$emit('updateGeogSearch')
          break
        case 'Census Place':
          // console.log('gotoGeography(), searchType= ' + this.searchType + ', typeaheadModel= ', this.typeaheadModel)
          newURL = 'area-summary?type=place&geoid=' + this.typeaheadModel.geoid + '&bbox=' + this.typeaheadModel.bbox_arr
          this.$router.push(newURL)
          EventHub.$emit('updateGeogSearch')
          break
        default:
          // console.log('DEBUG: No handler in gotoGeography() for searchType = ' + this.searchType)
          break
      }
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
        this.itemKey = 'holdingcompanyname'
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
          $select: 'holdingcompanyname',
          $group: 'holdingcompanyname',
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
        // console.log('Socrata response= ', response)
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
  },
  // Check query string for initial values
  mounted () {
    this.populateTypeahead()
  }
}
