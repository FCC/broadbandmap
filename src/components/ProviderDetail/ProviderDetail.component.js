import axios from 'axios'
import { Tooltip } from 'uiv'
import nbMap from '../NBMap/'

import PopulationChart from './PopulationChart'
import SpeedChart from './SpeedChart'
import UpSpeedChart from './UpSpeedChart'
import Autocomplete from './Autocomplete/index.vue'

export default {
  name: 'ProviderDetail',
  components: { Tooltip, nbMap, PopulationChart, SpeedChart, UpSpeedChart, Autocomplete },
  props: [],
  mounted () {
    this.loadProviderLookup()
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
      direction: 'd',
      popChartData: {},
      techChartData: {},
      hoconum2Name: {},
      name2Hoconum: {}
    }
  },
  methods: {
    mapInit (map) {
      this.Map = map
    },
    mapClick () {
      console.log('map click')
    },
    loadProviderLookup () {
      const self = this

      let httpHeaders = {}
      let socrataURL = process.env.SOCRATA_PROD_FULL
      let appToken = process.env.SOCRATA_PROD_APP_TOKEN

      axios
      .get(socrataURL, {
        params: {
          $select: 'holdingcompanyname,hoconum',
          $group: 'holdingcompanyname,hoconum',
          $limit: 5000,
          $$app_token: appToken
        },
        headers: httpHeaders
      })
      .then(function (response) {
        self.hoconum2Name = {}
        self.name2Hoconum = {}
        for (let rdi in response.data) {
          self.hoconum2Name[response.data[rdi].hoconum] = response.data[rdi].holdingcompanyname
          self.name2Hoconum[response.data[rdi].holdingcompanyname] = response.data[rdi].hoconum
        }
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
      for (let pni in this.providerNames) {
        this.providerHoconums.push(this.getHoconumByName(this.providerNames[pni]))
      }

      // Display charts section
      this.showResults = false

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

      let hoconumClause = ''
      for (let hci in this.providerHoconums) {
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

      let directions = ['u', 'd']

      for (let di in ['u', 'd']) {

        let drct = directions[di]
  
        this.popChartData[drct] = {}
        this.popChartData[drct]['labels'] = []
        this.popChartData[drct]['data'] = []

        for (let phi in this.providerHoconums) {
          let ph = this.providerHoconums[phi]
          for (let pdi in this.providerData) {
            let pd = this.providerData[pdi]
            if (pd.hoconum === ph && pd.tech === 'all') {
              this.popChartData[drct]['labels'].push(this.getNameByHoconum(pd.hoconum))
              this.popChartData[drct]['data'].push(pd[drct + '_1'] * 100 / usPopulation)
            }                   
          }
        }

        let collapsed = this.collapseTech(this.providerData)

        this.techChartData[drct] = {}

        for (let ci in collapsed) {
          let count = 8
          if (drct === 'u') {
            count = 10
          }
       
          let cData = []
          cData[0] = 1
          for (let i = 1; i < count; i++) {
            cData[i] = parseFloat(collapsed[ci][drct + '_' + i.toString()]) / parseFloat(collapsed[ci][drct + '_1'])
          }

          let series = { 
            label: this.getNameByHoconum(collapsed[ci].hoconum),
            data: cData
          }

          if (!this.techChartData[drct][collapsed[ci].tech]) {
            this.techChartData[drct][collapsed[ci].tech] = []
          } 
          this.techChartData[drct][collapsed[ci].tech].push(series)
        }
      }
    },
    collapseTech (data) {
      let outData = []
      for (let di in data) {
        let found = false
        for (let odi in outData) {
          if (outData[odi].hoconum === data[di].hoconum &&
              outData[odi].tech    === this.getTechNameByCode(data[di].tech)) {
            for (let i = 1; i < 9; i++) {
              outData[odi]['d_'+i.toString()] = (parseInt(outData[odi]['d_'+i.toString()]) + parseInt(data[di]['d_'+i.toString()])).toString()
            }
            for (let i = 1; i < 11; i++) {
              outData[odi]['u_'+i.toString()] = (parseInt(outData[odi]['u_'+i.toString()]) + parseInt(data[di]['u_'+i.toString()])).toString()
            }
            found = true
          }
        }

        if (!found) {
          let od = data[di]
          od.tech = this.getTechNameByCode(od.tech)
          outData.push(od)
        }
      }
      return outData
    },
    setU () {
      this.direction = 'u'
    },
    setD () {
      this.direction = 'd'
    },
    // Hoconum lookup by provider name
    getHoconumByName (name) {
      // To be implemented later properly. Currently a stub that assumes hoconum is passed in
      return this.name2Hoconum[name]
    },
    // Provider name lookup by hoconum
    getNameByHoconum (hoconum) {
      // To be implemented later properly. Currently a stub that assumes name is passed in
      return this.hoconum2Name[hoconum]
    },
    // Tech name by code 
    getTechNameByCode (code) {
      if (code === 'all') return code;
      if (parseInt(code) >= 10 && parseInt(code) <= 13) return 'adsl'
      if (parseInt(code) >= 40 && parseInt(code) <= 43) return 'cable'
      if (code === '50') return 'fiber'
      if (code === '60') return 'satellite'
      if (code === '70') return 'fixedWireless'
      return 'other'
    }
  },
  computed: {
    getPlaceholderText: function () {
      return 'Enter Provider Name'
    }
  }
}
