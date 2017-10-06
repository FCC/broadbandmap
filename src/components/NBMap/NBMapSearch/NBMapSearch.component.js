import { Dropdown, Tooltip } from 'uiv'

export default {
  name: 'nbMapSearch',
  components: { Dropdown, Tooltip },
  props: ['defaultSearch', 'type'],
  mounted () {
    let srchType = this.searchTypes[this.type]

    this.searchLabel = srchType[this.defaultSearch].label
    this.searchOptsList = srchType
  },
  data () {
    return {
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
  }
}
