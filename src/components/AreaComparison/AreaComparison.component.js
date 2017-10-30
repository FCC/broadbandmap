import { Dropdown, Tooltip } from 'uiv'

import Autocomplete from '@/components/Autocomplete/index.vue'
import { columns } from './table-mock-columns.js'
import { rows } from './table-mock-rows.js'

export default {
  name: 'AreaComparison',
  components: { Dropdown, Autocomplete },
  props: [],
  mounted () {
    this.searchLabel = 'County'
    this.searchOptsList = this.searchTypes.comparison
  },
  data () {
    return {
      columns: columns,
      rows: rows,
      searchLabel: '',
      placeholderText: '',
      searchOptsList: {},
      searchType: 'County',
      searchTypes: {
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
      let selectedOpt = this.searchTypes.comparison[selectedVal]

      this.searchType = selectedVal
      this.searchLabel = selectedOpt.label
    },
    setNationwide: function (isNW) {
      this.$refs.autocomplete2.typeaheadModel = 'Nationwide'
    }
  },
  computed: {
    getPlaceholderText: function () {
      let srchType = this.searchTypes.comparison[this.searchType]

      return srchType.hasOwnProperty('placeholderText') ? srchType.placeholderText : 'Enter ' + srchType.label
    }
  }
}
