// Include Uiv components
import { Dropdown, Tooltip } from 'uiv'
// Include custom Vue components
import Autocomplete from '../../Autocomplete/index.vue'
import { urlValidation } from '../../../_mixins/urlValidation.js'

export default {
  name: 'nbMapSearch',
  components: { Dropdown, Tooltip, Autocomplete },
  mixins: [urlValidation],
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
      searchLabel: '',
      placeholderText: '',
      searchOptsList: {},
      searchType: this.defaultSearch,
      searchTypes: {
        location: {
          'Address': {
            'label': 'Address',
            'placeholderText': 'Enter address'
          },
          'Coordinates': {
            'label': 'Coordinates',
            'tooltipText': 'Enter latitude, longitude (in degrees decimal format)',
            'placeholderText': 'Enter coordinates'
          }
        },
        comparison: {
          'State': {
            'label': 'State',
            'placeholderText': 'Enter state'
          },
          'County': {
            'label': 'County',
            'placeholderText': 'Enter county'
          },
          'Congressional District': {
            'label': 'District',
            'placeholderText': 'Enter congressional district'
          },
          'Census Place': {
            'label': 'Census Place',
            'placeholderText': 'Enter town or city'
          },
          'Tribal Area': {
            'label': 'Tribal Area',
            'placeholderText': 'Enter tribal area'
          },
          'CBSA (MSA)': {
            'label': 'CBSA',
            'placeholderText': 'Enter CBSA (MSA)'
          }
        }
      }
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
      if (this.isValidLatLon()) {
        if (this.isValidAddress()) {
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
    }
  }
}
