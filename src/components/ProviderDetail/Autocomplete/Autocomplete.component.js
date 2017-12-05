import axios from 'axios'
// Include the needed "uiv" library components
import { Typeahead } from 'uiv'
import { urlValidation } from '../../../_mixins/urlValidation.js'
import EventHub from '../../../_mixins/EventHub.js'
export default {
  components: {
    Typeahead: Typeahead
  },
  mixins: [urlValidation],
  // Bind vars passed in via the <Autocomplete> tag
  props: ['placeholderText'],
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
    },
    enterClicked (event) {
    },
    // Called by data() on init, and when searchType changes
    populateTypeahead () {
      this.asyncKey = ''
      this.itemKey = 'holdingcompanyname'
      this.fetchLookupTable()
    },
    // Call Socrata API - Lookup Table for geographies
    fetchLookupTable () {
      const self = this
      // Call Socrata API - Combined Table for charts
      let socrataURL = process.env.SOCRATA_PROD_FULL
      let appToken = process.env.SOCRATA_PROD_APP_TOKEN
      let httpHeaders = {}

      axios
      .get(socrataURL, {
        params: {
          $select: 'holdingcompanyname',
          $group: 'holdingcompanyname',
          $limit: 5000,
          $$app_token: appToken
        },
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
    }
  },
  // Check query string for initial values
  mounted () {
    this.populateTypeahead()
  }
}
