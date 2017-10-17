// Include the needed "uiv" library components
import { Typeahead } from 'uiv'
// JSON data for static geographies
import states from './states.json'

export default {
  components: {
    Typeahead: Typeahead
  },
  // Bind vars passed in via the <Autocomplete> tag
  props: ['placeholderText', 'searchType'],
  // Initialize vars
  data () {
    let configObj = this.getConfig()
    configObj.typeaheadModel = ''
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
      if (typeof this.typeaheadModel === 'object') {
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
      }
      // Push the URL to the Vue router
      if (typeof newURL !== 'undefined') {
        this.$router.push(newURL)
      } else {
        alert('DEBUG: Still need lat/lon for this geography')
      }
    },
    // Called by data() on init, and when searchType changes
    getConfig () {
      if (this.searchType === 'Address') {
        return {
          dataSource: null,
          itemKey: 'place_name',
          asyncKey: 'features'
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
    }
  },
  computed: {
    // When Typeahead model changes, generate dynamic URL for Ajax call to API
    apiURL: function () {
      if (this.searchType === 'Address') {
        return 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(this.typeaheadModel) + '.json?country=us&limit=10&access_token=pk.eyJ1IjoiY29tcHV0ZWNoIiwiYSI6InMyblMya3cifQ.P8yppesHki5qMyxTc2CNLg&'
      } else {
        return null
      }
    }
  }
}
