// Include custom Vue components
import Autocomplete from '../Autocomplete/index.vue'

export default {
  name: 'Home',
  // Define custom Vue components
  components: {
    'Autocomplete': Autocomplete
  },
  props: [],
  mounted () {

  },
  data () {
    return {

    }
  },
  methods: {
    searchButtonClicked (event) {
      // Pass the event to the Autocomplete component
      this.$refs.autocomplete2.searchButtonClicked(event);
    }
  },
  computed: {

  }
}
