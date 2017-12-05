import { Tooltip } from 'uiv'
import nbMap from '../NBMap/'

import PopulationChart from './PopulationChart'
import SpeedChart from './SpeedChart'

export default {
  name: 'ProviderDetail',
  components: { Tooltip, nbMap, PopulationChart, SpeedChart },
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
      showResults: false,
      popChartData: {
        labels: ['AT&T', 'Comcast', 'Verizon'],
        data: [0.7, 0.35, 0.25]
      },
      anyTechChartData: [{
        label: 'AT&T',
        data: [0.10, 0.20, 0.30, 0.40, 0.50, 1, 0.10]
      }, {
        label: 'Comcast',
        data: [0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1]
      }, {
        label: 'Verizon',
        data: [0.70, 0.80, 0.90, 1, 0.10, 0.20, 0.30]
      }]
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
