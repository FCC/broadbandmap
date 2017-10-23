// Include the needed "uiv" library components
import { Typeahead } from 'uiv'
// JSON data for static geographies
import states from './states.json'
import { urlValidation } from '../../_mixins/urlValidation.js'
import EventHub from '../../_mixins/EventHub.js'

export default {
  components: {
    Typeahead: Typeahead
  },
  mixins: [urlValidation],
  // Bind vars passed in via the <Autocomplete> tag
  props: ['placeholderText', 'searchType'],
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
    searchButtonClicked (event) {
      this.gotoGeography(event)
    },
    enterClicked (event) {
      if ((typeof this.typeaheadModel === 'object') || (this.searchType !== 'Address')) {
        this.gotoGeography(event)
      }
    },
    // Called when user pressed enter or clicked search
    gotoGeography (event) {
      var newURL = ''
      switch (this.searchType) {
        case 'Address':
          if (typeof this.typeaheadModel === 'object' && typeof this.typeaheadModel.id === 'string') {
            // Create the URL
            newURL = 'location-summary?lat=' + this.typeaheadModel.center[1] + '&lon=' + this.typeaheadModel.center[0] + '&place_name=' + encodeURIComponent(this.typeaheadModel.place_name)
          } else {
            // Call Modal component in app footer
            EventHub.$emit('openModal', 'No results found', 'Please enter and then select a valid U.S. address.')
          }
          break
        case 'Coordinates':
          let coordinatesArray = this.typeaheadModel.split(',')
          if (coordinatesArray.length === 2 && !isNaN(coordinatesArray[0]) && !isNaN(coordinatesArray[1])) {
            newURL = 'location-summary?lat=' + coordinatesArray[0].trim() + '&lon=' + coordinatesArray[1].trim()
          } else {
            // Call Modal component in app footer
            EventHub.$emit('openModal', 'No results found', 'Please enter valid coordinates in "latitude, longitude" format.')
          }
          break
        default:
          console.log('DEBUG: No handler for searchType = ' + this.searchType)
      }
      // Push the URL to the Vue router
      if (typeof newURL !== 'undefined') {
        this.$router.push(newURL)
      } else {
        console.log('DEBUG: Still need lat/lon for this geography')
      }
    },
    // Called by data() on init, and when searchType changes
    populateTypeahead () {
      if (this.searchType === 'Address') {
        this.dataSource = null
        this.asyncKey = 'features'
        this.itemKey = 'place_name'
        this.typeaheadModel = {
          place_name: this.isValidAddress() ? this.$route.query.place_name : ''
        }
      } else if (this.searchType === 'Coordinates') {
        this.dataSource = null
        this.asyncSrc = null
        this.asyncKey = ''
        /* Clearing this throws error, but may need to come back to this later
        this.itemKey = ''
        */
        this.typeaheadModel = this.isValidLatLon() ? this.$route.query.lat + ', ' + this.$route.query.lon : ''
      } else {
        this.dataSource = states.data
        this.itemKey = 'name'
        this.asyncKey = ''
      }
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
