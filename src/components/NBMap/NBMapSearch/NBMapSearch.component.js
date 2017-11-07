// Include Uiv components
import { Dropdown, Tooltip } from 'uiv'
// Include custom Vue components
import Autocomplete from '../../Autocomplete/index.vue'
import searchGeogTypes from '../../../_mixins/search-geog-types.js'
import { urlValidation } from '../../../_mixins/urlValidation.js'

export default {
  name: 'nbMapSearch',
  components: { Dropdown, Tooltip, Autocomplete },
  mixins: [urlValidation, searchGeogTypes],
  props: {
    defaultSearch: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  },
  mounted () {
    let srchType = this.searchTypes[this.type]

    this.receiveSearchType()
    this.searchLabel = srchType[this.searchType].label
    this.searchOptsList = srchType
  },
  data () {
    return {
      // Tooltip component needs access to document.querySelector() inside Autocomplete
      document,
      enableTooltip: false,
      searchType: this.defaultSearch
    }
  },
  methods: {
    toggleSearchType: function (selectedVal) {
      let selectedOpt = this.searchTypes[this.type][selectedVal]

      this.searchType = selectedVal
      this.searchLabel = selectedOpt.label
    },
    searchButtonClicked (event) {
      // Pass the event and geography type to the Autocomplete component
      this.$refs.autocomplete2.searchButtonClicked(event, this.searchType)
    },
    // Check query string and override or use default search type
    receiveSearchType () {
      if (this.isValidLatLon(this.$route.query.lat, this.$route.query.lon)) {
        if (this.isValidAddress(this.$route.query.place_name)) {
          this.searchType = 'Address'
        } else {
          this.searchType = 'Coordinates'
        }
      } else {
        this.searchType = this.defaultSearch
      }
      this.toggleSearchType(this.searchType)
    }
  },
  computed: {
    getPlaceholderText: function () {
      let srchType = this.searchTypes[this.type][this.searchType]

      return srchType.hasOwnProperty('placeholderText') ? srchType.placeholderText : 'Enter ' + srchType.label
    },
    getTooltipText: function () {
      let srchType = this.searchTypes[this.type][this.searchType]
      let hasTooltip = srchType.hasOwnProperty('tooltipText')

      this.enableTooltip = hasTooltip

      if (hasTooltip) {
        return srchType.tooltipText
      }
    }
  },
  watch: {
    // When query params change for the same route (URL slug)
    '$route' (to, from) {
      this.receiveSearchType()

      if (to.query.place_name !== undefined) {
        this.$refs.autocomplete2.typeaheadModel = to.query.place_name
      }
    }
  }
}
