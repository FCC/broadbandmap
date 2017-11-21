import { Tooltip } from 'uiv'
import nbMap from '../NBMap/'

export default {
  name: 'ProviderDetail',
  components: { Tooltip, nbMap },
  props: [],
  mounted () {

  },
  data () {
    return {
      providers: [{
        name: '',
        id: Date.now()
      }],
      providerNames: [],
      numProviders: 1,
      showLink: true,
      showResults: false
    }
  },
  methods: {
    mapInit (map) {
      this.Map = map
    },
    mapClick () {
      console.log('map click')
    },
    addProvider () {
      let newProvider = {
        name: '',
        id: Date.now()
      }

      if (this.numProviders <= 3) {
        this.numProviders++

        // Show the 'Add Provider' link
        this.showLink = this.numProviders !== 3

        // Add a provider to the list of providers
        this.providers.push(newProvider)
      }
    },
    removeProvider (providerID) {
      if (this.numProviders >= 2) {
        this.numProviders--

        // Hide the 'Add Provider' link
        this.showLink = this.numProviders < 3

        // Remove the selected provider from the list of providers
        this.providers = this.providers.filter(provider => provider.id !== providerID)
      } else if (this.numProviders === 1) {
        // Clear the text field instead of removing it when there is only 1 provider
        this.providers[0].name = ''
      }
    },
    viewDetails () {
      // Create list of provider Names
      this.providerNames = this.providers.map(provider => provider.name).filter(providerName => providerName !== undefined && providerName !== '')

      // Display charts section
      this.showResults = true

      // Resize the map once the charts section is visible
      setTimeout(() => {
        this.Map.resize()
      }, 100)
    }
  },
  computed: {

  }
}
