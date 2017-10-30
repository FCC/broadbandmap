import axios from 'axios'
import { Dropdown, Tooltip } from 'uiv'

import Autocomplete from '@/components/Autocomplete/index.vue'
import searchGeogTypes from '../../_mixins/search-geog-types.js'
import { columns } from './table-mock-columns.js'
import { rows } from './table-mock-rows.js'

export default {
  name: 'AreaComparison',
  components: { Tooltip, Dropdown, Autocomplete },
  mixins: [searchGeogTypes],
  props: [],
  mounted () {
    this.searchLabel = 'County'
    this.searchOptsList = this.searchTypes.comparison
  },
  data () {
    return {
      columns: columns,
      rows: rows,
      searchType: 'County'
    }
  },
  methods: {
    toggleSearchType: function (selectedVal) { // Change the search (geography) type (e.g. county, state, district, etc.)
      let selectedOpt = this.searchTypes.comparison[selectedVal]

      this.searchType = selectedVal
      this.searchLabel = selectedOpt.label
    },
    searchArea: function (areaType) { // Set the search area input value to nationwide or blank
      this.$refs.autocomplete2.typeaheadModel = areaType
    }
  },
  computed: {
    getPlaceholderText: function () { // Set the geography type input placeholder text based on search type
      let srchType = this.searchTypes.comparison[this.searchType]

      return srchType.hasOwnProperty('placeholderText') ? srchType.placeholderText : 'Enter ' + srchType.label
    }
  }
}
