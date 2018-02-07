import { mapGetters, mapMutations } from 'vuex'
import Autocomplete from '../Autocomplete/index.vue'
import EventHub from '../../_mixins/EventHub.js'

export default {
  name: 'Home',
  components: {
    'Autocomplete': Autocomplete
  },
  mounted () {
    EventHub.$on('searchByAddr', (typeaheadModel) => this.searchByAddr(typeaheadModel))
  },
  destroyed () {
    EventHub.$off('searchByAddr')
  },
  methods: {
    ...mapGetters([
      // Mount store getters to component scope
      'getBlock',
      'getAddrSearch'
    ]),
    ...mapMutations([
      // Mount store mutation functions
      'setBlock',
      'setAddrSearch'
    ]),
    searchButtonClicked (event) {
      // Pass the event and geography type to the Autocomplete component
      this.$refs.autocomplete2.searchButtonClicked(event, 'Address')
    },
    searchByAddr (typeaheadModel) { // Send address search query to Location Summary page
      this.setAddrSearch({
        place_name: typeaheadModel.place_name
      })

      this.setBlock({
        lat: typeaheadModel.center[1].toString(),
        lon: typeaheadModel.center[0].toString()
      })

      let routeQueryParams = Object.assign({}, this.getAddrSearch(), this.getBlock())

      this.$router.push({
        name: 'LocationSummary',
        query: routeQueryParams
      })
    }
  }
}
