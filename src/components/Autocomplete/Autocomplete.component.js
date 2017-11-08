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
      switch (this.searchType) {
        case 'Address':
          if (typeof this.typeaheadModel === 'object' && typeof this.typeaheadModel.id === 'string') {
            // Create the URL
            let newURL = 'location-summary?lat=' + this.typeaheadModel.center[1] + '&lon=' + this.typeaheadModel.center[0] + '&place_name=' + encodeURIComponent(this.typeaheadModel.place_name)
            this.$router.push(newURL)
          } else {
            // Call Modal component in app footer
            EventHub.$emit('openModal', 'No results found', 'Please enter and then select a valid U.S. address.')
          }
          break
        case 'Coordinates':
          let coordinatesArray = this.typeaheadModel.split(',')
          if (coordinatesArray.length === 2 && this.isValidLatLon(coordinatesArray[0], coordinatesArray[1])) {
            let newURL = 'location-summary?lat=' + coordinatesArray[0].trim() + '&lon=' + coordinatesArray[1].trim()
            this.$router.push(newURL)
          } else {
            // Call Modal component in app footer
            EventHub.$emit('openModal', 'No results found', 'Please enter valid coordinates in "latitude, longitude" format.')
          }
          break
        default:
          console.log('DEBUG: No handler for searchType = ' + this.searchType)
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
        this.dataSource = null
        this.asyncSrc = null
        this.asyncKey = ''
        /* Clearing this throws error, but may need to come back to this later
        this.itemKey = ''
        */
        this.typeaheadModel = this.isValidLatLon(this.$route.query.lat, this.$route.query.lon) ? this.$route.query.lat + ', ' + this.$route.query.lon : ''
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
