import axios from 'axios'
import { Dropdown, Tooltip } from 'uiv'

import EventHub from '../../_mixins/EventHub.js'
import Autocomplete from '@/components/Autocomplete/index.vue'
import BookmarkLink from '@/components/BookmarkLink/'
import searchGeogTypes from '../../_mixins/search-geog-types.js'

export default {
  name: 'AreaComparison',
  components: { Tooltip, Dropdown, Autocomplete, BookmarkLink },
  mixins: [searchGeogTypes],
  props: [],
  data () {
    return {
      columns: [{
        label: 'Area',
        field: 'area_name',
        filterable: true
      },
      {
        label: '% with no providers',
        field: 'zero_providers',
        type: 'number',
        html: false,
        filterable: false
      },
      {
        label: '% with 1 or more',
        field: 'one_provider',
        type: 'number',
        html: false,
        filterable: false
      },
      {
        label: '% with 2 or more',
        field: 'two_provider',
        type: 'number',
        html: false,
        filterable: false
      },
      {
        label: '% with 3 or more',
        field: 'three_provider',
        type: 'number',
        html: false,
        filterable: false
      }],
      rows: [],
      searchType: 'County',
      refreshingDropdown: false,
      selectedTech: 'acfosw',
      selectedSpeed: '25_3',
      selectedState: undefined,
      socrataURL: '',
      socrataLookupURL: '',
      appToken: '',
      httpHeaders: {},
      typeDictionary: {
        'County': 'county',
        'State': 'state',
        'Congressional District': 'cd',
        'Census Place': 'place',
        'Tribal Area': 'tribal',
        'CBSA (MSA)': 'cbsa'
      },
      typeReverseDictionary: {
        'county': 'County',
        'state': 'State',
        'cd': 'Congressional District',
        'place': 'Census Place',
        'tribal': 'Tribal Area',
        'cbsa': 'CBSA (MSA)'
      },
      typeDictionaryArea: {
        'County': 'county',
        'State': 'state',
        'Congressional District': 'cd',
        'Census Place': 'place',
        'Tribal Area': 'tribal',
        'CBSA (MSA)': 'cbsa'
      },
      speedDictionary: {
        '200': '0.2',
        '10_1': '10',
        '25_3': '25',
        '50_5': '50',
        '100_10': '100'
      },
      stateGeoidToName: {},
      stateNameToGeoid: {},
      areaForSearch: '',
      validationError: '',
      abbreviationByGeoID: {
        '01' : 'AL',
        '02' : 'AK',
        '04' : 'AZ',
        '05' : 'AR',
        '06' : 'CA',
        '08' : 'CO',
        '09' : 'CT',
        '10' : 'DE',
        '11' : 'DC',
        '12' : 'FL',
        '13' : 'GA',
        '15' : 'HI',
        '16' : 'ID',
        '17' : 'IL',
        '18' : 'IN',
        '19' : 'IA',
        '20' : 'KS',
        '21' : 'KY',
        '22' : 'LA',
        '23' : 'ME',
        '24' : 'MD',
        '25' : 'MA',
        '26' : 'MI',
        '27' : 'MN',
        '28' : 'MS',
        '29' : 'MO',
        '30' : 'MT',
        '31' : 'NE',
        '32' : 'NV',
        '33' : 'NH',
        '34' : 'NJ',
        '35' : 'NM',
        '36' : 'NY',
        '37' : 'NC',
        '38' : 'ND',
        '39' : 'OH',
        '40' : 'OK',
        '41' : 'OR',
        '42' : 'PA',
        '44' : 'RI',
        '45' : 'SC',
        '46' : 'SD',
        '47' : 'TN',
        '48' : 'TX',
        '49' : 'UT',
        '50' : 'VT',
        '51' : 'VA',
        '53' : 'WA',
        '54' : 'WV',
        '55' : 'WI',
        '56' : 'WY',
        '60' : 'AS',
        '64' : 'FM',
        '66' : 'GU',
        '68' : 'MH',
        '69' : 'MP',
        '70' : 'PW',
        '72' : 'PR',
        '74' : 'UM',
        '78' : 'VI'
      }
    }
  },
  mounted () {
    this.setSocrata()
    this.cacheStates()

    EventHub.$on('updateTableSettings', function (selectedTech, selectedSpeed) {
      this.updateTechSpeed(selectedTech, selectedSpeed)
    }.bind(this))
    EventHub.$on('removeTableData', (propertyID, removeAll) => this.removeData())
  },
  destroyed () {
    EventHub.$off('updateTableSettings')
    EventHub.$off('removeTableData')
  },
  methods: {
    toggleSearchType (selectedVal) { // Change the search (geography) type (e.g. county, state, district, etc.)
      let selectedOpt = this.searchTypes.comparison[selectedVal]

      this.searchType = selectedVal
      this.searchLabel = selectedOpt.label
    },
    searchArea (areaType) { // Set the search area input value to nationwide or blank
      this.areaForSearch = areaType
      this.refreshingDropdown = true

      if (this.searchType) {
        this.toggleSearchType(this.searchType)
      } else {
        this.toggleSearchType('County')
      }

      if (areaType === '') {
        this.searchOptsList = Object.assign({}, this.searchTypes.comparison)
        delete this.searchOptsList['State']
        delete this.searchOptsList['Tribal Area']
      } else {
        this.searchOptsList = Object.assign({}, this.searchTypes.comparison)
      }

      this.refreshingDropdown = false
      this.$refs.autocomplete.typeaheadModel = areaType
    },
    openTableSettings () {
      EventHub.$emit('openTableSettings')
    },
    updateTechSpeed (selectedTech, selectedSpeed) {
      this.selectedTech = selectedTech
      this.selectedSpeed = selectedSpeed
      if (this.rows && this.rows.length > 0) this.compareAreas()
    },
    removeData () {
      this.rows = []
    },
    setSocrata () {
      if (process.env.SOCRATA_ENV === 'DEV') {
        this.socrataURL = process.env.SOCRATA_DEV_AREA
        this.socrataLookupURL = process.env.SOCRATA_DEV_LOOKUP
        this.httpHeaders = {
          // Dev: Authentication to Socrata using HTTP Basic Authentication
          'Authorization': 'Basic ' + process.env.SOCRATA_DEV_HTTP_BASIC_AUTHENTICATION
        }
      } else if (process.env.SOCRATA_ENV === 'PROD') {
        this.socrataURL = process.env.SOCRATA_PROD_AREA
        this.socrataLookupURL = process.env.SOCRATA_PROD_LOOKUP
        // Socrata does not currently enforce an app token, but may in the future
        this.appToken = process.env.SOCRATA_PROD_APP_TOKEN
      } else {
        console.log('ERROR: process.env.SOCRATA_ENV in .env file must be PROD or DEV, not ' + process.env.SOCRATA_ENV)
      }
    },
    cacheStates () {
      const self = this

      axios
      .get(this.socrataLookupURL, {
        params: {
          type: 'state',
          $select: 'geoid,name',
          $order: 'geoid',
          $$app_token: this.appToken
        },
        headers: this.httpHeaders
      })
      .then(function (response) {
        for (let sdi in response.data) {
          let sd = response.data[sdi]
          self.stateNameToGeoid[sd.name] = sd.geoid.toString()
          self.stateGeoidToName[sd.geoid.toString()] = sd.name

          self.loadParamsFromUrl()
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
    assembleRows (rawData, lookupData, geoid) {
      this.rows = []
      for (let rdi in rawData) {
        let totalPop = parseInt(rawData[rdi].sum_has_0) + parseInt(rawData[rdi].sum_has_1) + parseInt(rawData[rdi].sum_has_2) + parseInt(rawData[rdi].sum_has_3more)
        if (!totalPop) totalPop = 1

        let areaName = ''
        if (this.searchType === 'Congressional District') {
          areaName = lookupData[rawData[rdi].id] + '-' + rawData[rdi].id.toString()
        } else {
          areaName = lookupData[rawData[rdi].id]
        }

        if (this.searchType !== 'CBSA (MSA)' || 
           !this.$refs.autocomplete.typeaheadModel.geoid ||
           (this.$refs.autocomplete.typeaheadModel.geoid && areaName.indexOf(this.abbreviationByGeoID[this.$refs.autocomplete.typeaheadModel.geoid]) > 0)) {
          this.rows.push({
            area_name: areaName,
            zero_providers: (100.0 * parseFloat(rawData[rdi].sum_has_0) / (1.0 * totalPop)).toFixed(2),
            one_provider: (100.0 * parseFloat(rawData[rdi].sum_has_1) / (1.0 * totalPop)).toFixed(2),
            two_provider: (100.0 * parseFloat(rawData[rdi].sum_has_2) / (1.0 * totalPop)).toFixed(2),
            three_provider: (100.0 * parseFloat(rawData[rdi].sum_has_3more) / (1.0 * totalPop)).toFixed(2)
          })
        }
      }
    },
    compareAreas () {
      const self = this
      this.validationError = ''
      this.rows = []

      // all data we need for query
      // console.log('CompareAreas input : ', this.$refs.autocomplete.typeaheadModel.geoid, this.selectedTech, this.selectedSpeed, this.searchType)

      let socParams = {
        type: this.typeDictionaryArea[this.searchType],
        tech: this.selectedTech,
        speed: this.speedDictionary[this.selectedSpeed],
        $limit: 50000,
        $$app_token: this.appToken,
        $select: 'id,sum(has_0),sum(has_1),sum(has_2),sum(has_3more)',
        $group: 'id'
      }

      if (typeof this.$refs.autocomplete.typeaheadModel === 'string' && this.$refs.autocomplete.typeaheadModel !== 'Nationwide') {
        // Try to interpret as state name
        let value = this.$refs.autocomplete.typeaheadModel
        if (value in this.stateNameToGeoid) {
          this.$refs.autocomplete.typeaheadModel = {
            'geoid': this.stateNameToGeoid[value],
            'name': value,
            'type': 'state'}
        } else {
          this.validationError = 'Invalid state specified : ' + value
          return
        }
      }

      if (this.$refs.autocomplete.typeaheadModel !== 'Nationwide' && this.$refs.autocomplete.typeaheadModel.geoid) {
        if (this.searchType !== 'CBSA (MSA)') {
          socParams['$WHERE'] = "starts_with(id,'" + this.$refs.autocomplete.typeaheadModel.geoid + "')"
        }
      }

      this.updateUrlParams()

      axios
      .get(this.socrataURL, {
        params: socParams,
        headers: this.httpHeaders
      })
      .then(function (response) {
        let rawData = response.data
        // Got raw data. Now fetch geography names for join
        let socLookupParams = {
          type: self.typeDictionary[self.searchType],
          $limit: 50000,
          $$app_token: self.appToken,
          $select: 'geoid,name,type'
        }
        if (self.$refs.autocomplete.typeaheadModel.geoid) {
          if (self.searchType !== 'CBSA (MSA)') {
            socLookupParams['$WHERE'] = "starts_with(geoid,'" + self.$refs.autocomplete.typeaheadModel.geoid + "')"
          }
        }

        axios
        .get(self.socrataLookupURL, {
          params: socLookupParams,
          headers: self.httpHeaders
        })
        .then(function (response) {
          let lookupData = {}
          for (let rdi in response.data) {
            lookupData[response.data[rdi].geoid] = response.data[rdi].name
          }
          self.assembleRows(rawData, lookupData, self.$refs.autocomplete.typeaheadModel.geoid)
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
    updateUrlParams () {
      let routeQ = this.$route.query

      let routeQP = {}
      Object.keys(routeQ).map(prop => {
        routeQP[prop] = routeQ[prop]
      })

      if (this.searchType) {
        routeQP.searchtype = this.typeDictionary[this.searchType]
      } else {
        delete routeQP.searchtype
      }

      if (this.$refs.autocomplete.typeaheadModel.geoid) {
        routeQP.geoid = this.$refs.autocomplete.typeaheadModel.geoid
      } else {
        delete routeQP.geoid
      }

      this.$router.replace({
        name: 'AreaComparison',
        query: routeQP
      })
    },
    loadParamsFromUrl () {
      let routeQ = this.$route.query

      let routeQP = {}
      Object.keys(routeQ).map(prop => {
        routeQP[prop] = routeQ[prop]
      })

      if (routeQP.searchtype) {
        if (routeQP.searchtype in this.typeReverseDictionary) {
          this.toggleSearchType(this.typeReverseDictionary[routeQP.searchtype])
        } else {
          this.validationError = 'Invalid search type : ' + routeQP.searchtype + '. Defaulting to County.'
          this.toggleSearchType('County')
        }
      }

      if (routeQP.geoid) {
        if (routeQP.geoid in this.stateGeoidToName) {
          this.searchArea('')
          this.$refs.autocomplete.typeaheadModel = {
            'geoid': routeQP.geoid,
            'name': this.stateGeoidToName[routeQP.geoid],
            'type': 'state'}
        } else {
          this.validationError = 'Invalid geoid : ' + routeQP.geoid
          return
        }
      } else {
        if (routeQP.searchtype) {
          this.searchArea('Nationwide')
        } else {
          this.searchArea('')
        }
      }

      if (routeQP.searchtype || routeQP.geoid) this.compareAreas()
    },
    openAboutAreaCompare () {
      EventHub.$emit('openAboutAreaCompare')
    }
  },
  computed: {
    getPlaceholderText: function () { // Set the geography type input placeholder text based on search type
      let srchType = this.searchTypes.comparison[this.searchType]

      return srchType.hasOwnProperty('placeholderText') ? srchType.placeholderText : 'Enter ' + srchType.label
    }
  }
}
