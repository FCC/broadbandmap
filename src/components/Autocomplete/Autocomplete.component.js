// Include the needed "uiv" library components
import { Typeahead } from 'uiv'
// JSON data for static geographies
import states from './states.json'
import { urlValidation } from '../../_mixins/urlValidation.js'

export default {
  components: {
    Typeahead: Typeahead
  },
  mixins: [urlValidation],
  // Bind vars passed in via the <Autocomplete> tag
  props: ['placeholderText', 'searchType'],
  // Initialize vars
  data () {
    let configObj = this.getConfig()
    return configObj
  },
  methods: {
    searchButtonClicked (event) {
      if (typeof this.typeaheadModel === 'object') {
        this.gotoGeography(event)
      } else {
        alert('Please enter and select a valid U.S. address.')
      }
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
          // Create the URL
          var newURL = 'location-summary?lat=' + this.typeaheadModel.center[1] + '&lon=' + this.typeaheadModel.center[0] + '&place_name=' + encodeURIComponent(this.typeaheadModel.place_name)
          break
        case 'Coordinates':
          let coordinatesArray = this.typeaheadModel.split(',')
          if (coordinatesArray.length === 2 && !isNaN(coordinatesArray[0]) && !isNaN(coordinatesArray[0])) {
            newURL = 'location-summary?lat=' + coordinatesArray[0] + '&lon=' + coordinatesArray[1]
          } else {
            alert('Please enter valid coordinates in latitude, longitude format')
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
    getConfig () {
      if (this.searchType === 'Address') {
        return {
          dataSource: null,
          itemKey: 'place_name',
          asyncKey: 'features',
          asyncSrc: '',
          typeaheadModel: {
            place_name: this.isValidAddress() ? this.$route.query.place_name : ''
          }
        }
      } else if (this.searchType === 'Coordinates') {
        return {
          dataSource: null,
          asyncSrc: null,
          asyncKey: '',
          /* Clearing this throws error, but may need to come back to this later
          // itemKey: ''
          */
          typeaheadModel: this.isValidLatLon() ? this.$route.query.lat + ', ' + this.$route.query.lon : ''
        }
      } else {
        return {
          dataSource: states.data,
          itemKey: 'name',
          asyncKey: null
        }
      }
    }
  },
  watch: {
    // When user selects different geography, reconfigure Typeahead component
    searchType () {
      let configObj = this.getConfig()
      // Copy config to the component
      for (var oneVar in configObj) {
        this[oneVar] = configObj[oneVar]
      }
    },
    typeaheadModel () {
      if (this.searchType === 'Address') {
        this.asyncSrc = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(this.typeaheadModel) + '.json?country=us&limit=10&access_token=pk.eyJ1IjoiY29tcHV0ZWNoIiwiYSI6InMyblMya3cifQ.P8yppesHki5qMyxTc2CNLg&'
      }
    }
  },
  // Check query string for initial values
  mounted () {
    let configObj = this.getConfig()
    // Copy config to the component
    for (var oneVar in configObj) {
      this[oneVar] = configObj[oneVar]
    }
  }
}
