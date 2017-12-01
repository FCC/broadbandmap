import axios from 'axios'
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
      providerData: [],
      providerNames: [],
      providerHoconums: [],
      numProviders: 1,
      showLink: true,
      showResults: false,
      popChartData: {},
      techChartData: {}
/*
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
*/
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
      this.providerHoconums = [];
      for (var pni in this.providerNames) {
        this.providerHoconums.push(this.getHoconumByName(this.providerNames[pni]))
      }

      // Fetch provider data
      this.fetchProviderData()

    },
    // Call Socrata API - Lookup Table for geographies
    fetchProviderData () {
      const self = this
      // Call Socrata API - Combined Table for charts
      let socrataURL = ''
      let appToken = ''
      let httpHeaders = {}
      if (process.env.SOCRATA_ENV === 'DEV') {
        socrataURL = process.env.SOCRATA_DEV_PROVIDER
        httpHeaders = {
          // Dev: Authentication to Socrata using HTTP Basic Authentication
          'Authorization': 'Basic ' + process.env.SOCRATA_DEV_HTTP_BASIC_AUTHENTICATION
        }
      } else if (process.env.SOCRATA_ENV === 'PROD') {
        socrataURL = process.env.SOCRATA_PROD_PROVIDER
        // Socrata does not currently enforce an app token, but may in the future
        appToken = process.env.SOCRATA_PROD_APP_TOKEN
      } else {
        console.log('ERROR: process.env.SOCRATA_ENV in .env file must be PROD or DEV, not ' + process.env.SOCRATA_ENV)
      }

      var hoconumClause = ''
      for (var hci in this.providerHoconums) {
        hoconumClause += "'" + this.providerHoconums[hci] + "',"
      }
      hoconumClause = hoconumClause.replace(/,\s*$/, "")

      axios
      .get(socrataURL, {
        params: {
          $select: '',
          $WHERE: 'hoconum in (' + hoconumClause + ')',
          $order: 'hoconum',
          $$app_token: appToken
        },
        headers: httpHeaders
      })
      .then(function (response) {
        console.log('Socrata response= ', response)
        self.providerData = response.data

        self.calculateChartData()

        // Display charts section
        self.showResults = true

        // Resize the map once the charts section is visible
        setTimeout(() => {
          self.Map.resize()
        }, 100)

      })
      .catch(function (error) {
        if (error.response) {
          // Server responded with a status code that falls out of the range of 2xx
          console.log(error.response.data)
          console.log(error.response.status)
          console.log(error.response.headers)
        } else if (error.request) {
          // Request was made but no response was received
          console.log(error.request)
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message)
        }
        console.log(error)
      })
    },
    calculateChartData () {

      let usPopulation = process.env.US_POPULATION

      this.popChartData['labels'] = []
      this.popChartData['data'] = []

      for (var phi in this.providerHoconums) {
        let ph = this.providerHoconums[phi]
        for (var pdi in this.providerData) {
          let pd = this.providerData[pdi]
          if (pd.hoconum === ph && pd.tech === 'all') {
            this.popChartData['labels'].push(this.getNameByHoconum(pd.hoconum))
            this.popChartData['data'].push(pd.d_1 * 100 / usPopulation)
          }                   
        }
      }
      /*
      this.popChartData = {
        labels: ['AT&T', 'Comcast', 'Verizon'],
        data: [0.7, 0.35, 0.25]
      }
      */

      this.techChartData['any'] = [{
        label: 'AT&T',
        data: [0.10, 0.20, 0.30, 0.40, 0.50, 1, 0.10]
      }, {
        label: 'Comcast',
        data: [0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1]
      }, {
        label: 'Verizon',
        data: [0.70, 0.80, 0.90, 1, 0.10, 0.20, 0.30]
      }]

      this.techChartData['adsl'] = [{
        label: 'AT&T',
        data: [0.10, 0.20, 0.30, 0.40, 0.50, 1, 0.10]
      }, {
        label: 'Comcast',
        data: [0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1]
      }, {
        label: 'Verizon',
        data: [0.70, 0.80, 0.90, 1, 0.10, 0.20, 0.30]
      }]

      this.anyTechChartData = [{
        label: 'AT&T',
        data: [0.10, 0.20, 0.30, 0.40, 0.50, 1, 0.10]
      }, {
        label: 'Comcast',
        data: [0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1]
      }, {
        label: 'Verizon',
        data: [0.70, 0.80, 0.90, 1, 0.10, 0.20, 0.30]
      }]

    },
    // Hoconum lookup by provider name
    getHoconumByName (name) {
      // To be implemented later properly. Currently a stub that assumes hoconum is passed in
      return name
    },
    // Provider name lookup by hoconum
    getNameByHoconum (hoconum) {
      // To be implemented later properly. Currently a stub that assumes name is passed in
      return hoconum
    },
    // Tech name by code 
    getTechNameByCode (code) {
      if (code >= 10 && code <= 13) return 'adsl'
      if (code >= 40 && code <= 43) return 'cable'
      if (code === 50) return 'fiber'
      if (code === 60) return 'satellite'
      if (code === 70) return 'fixedWireless'
      return 'other'
    }
  },
  computed: {

  }
}
