import axios from 'axios'
import { Dropdown, Tooltip } from 'uiv'

import EventHub from '../../_mixins/EventHub.js'
import Autocomplete from '@/components/Autocomplete/index.vue'
import BookmarkLink from '@/components/BookmarkLink/'
import searchGeogTypes from '../../_mixins/search-geog-types.js'
import { columns } from './table-mock-columns.js'
import { rows } from './table-mock-rows.js'

export default {
  name: 'AreaComparison',
  components: { Tooltip, Dropdown, Autocomplete, BookmarkLink },
  mixins: [searchGeogTypes],
  props: [],
  mounted () {
    this.searchLabel = 'County'
    this.searchOptsList = Object.assign({}, this.searchTypes.comparison)
    // Default option is enter state, so state should not be in dropdown on the left
    delete this.searchOptsList['State']
    this.refreshingDropdown = false

    EventHub.$on('updateTableSettings', function (selectedTech, selectedSpeed) {
      console.log('On updateTableSettings')
      this.updateTechSpeed(selectedTech, selectedSpeed)
    }.bind(this))
    EventHub.$on('removeTableData', (propertyID, removeAll) => this.removeData(propertyID, removeAll))
  },
  destroyed () {
    EventHub.$off('updateTableSettings')
    EventHub.$off('removeTableData')
  },
  data () {
    return {
      columns: columns,
      rows: rows,
      searchType: 'County',
      refreshingDropdown: false
    }
  },
  methods: {
    toggleSearchType: function (selectedVal) { // Change the search (geography) type (e.g. county, state, district, etc.)
      let selectedOpt = this.searchTypes.comparison[selectedVal]

      this.searchType = selectedVal
      this.searchLabel = selectedOpt.label
      this.$refs.autocomplete1.typeaheadModel = ''
    },
    searchArea: function (areaType) { // Set the search area input value to nationwide or blank
      console.log(areaType)

      this.refreshingDropdown = true
      if (areaType === '') {
        delete this.searchOptsList['State']
      } else {
        this.searchOptsList = Object.assign({}, this.searchTypes.comparison)
      }
      this.refreshingDropdown = false

      this.$refs.autocomplete2.typeaheadModel = areaType
    },
    openTableSettings () {
      EventHub.$emit('openTableSettings')
    },
    updateTechSpeed (selectedTech, selectedSpeed) {
      console.log('inside updateTechSpeed', selectedTech, selectedSpeed)
    },
    removeData(propertyID, removeAll) {
      console.log('inside removeData', propertyID, removeAll)
    }
  },
  computed: {
    getPlaceholderText: function () { // Set the geography type input placeholder text based on search type
      let srchType = this.searchTypes.comparison[this.searchType]

      return srchType.hasOwnProperty('placeholderText') ? srchType.placeholderText : 'Enter ' + srchType.label
    }
  }
}
