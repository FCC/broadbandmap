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
        'Congressional District': 'cdist',
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
      areaForSearch: ''
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
        delete this.searchOptsList['CBSA (MSA)']
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
    cacheStates() {
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
    assembleRows(rawData, lookupData) {
      this.rows = []
      for (let rdi in rawData) {
        let totalPop = parseInt(rawData[rdi].sum_has_0) + parseInt(rawData[rdi].sum_has_1) + parseInt(rawData[rdi].sum_has_2) + parseInt(rawData[rdi].sum_has_3plus)
        if (!totalPop) totalPop = 1
        
        let areaName = ''
        if (this.searchType === 'Congressional District') {
          areaName = lookupData[rawData[rdi].id] + '-' + rawData[rdi].id.toString()
        } else {
          areaName = lookupData[rawData[rdi].id]
        }
        
       if (!this.$refs.autocomplete.typeaheadModel.geoid && 
            Object.keys(this.stateGeoidToName).length > 0 &&
            (this.searchType === 'County' || this.searchType === 'Census Place' || this.searchType === 'Congressional District')) {
          areaName += ', ' + this.stateGeoidToName[rawData[rdi].id.substring(0, 2)]
        }
   
        this.rows.push({
          area_name: areaName,
          zero_providers: (100.0 * parseFloat(rawData[rdi].sum_has_0) / (1.0 * totalPop)).toFixed(2),
          one_provider: (100.0 * parseFloat(rawData[rdi].sum_has_1) / (1.0 * totalPop)).toFixed(2),
          two_provider: (100.0 * parseFloat(rawData[rdi].sum_has_2) / (1.0 * totalPop)).toFixed(2),
          three_provider: (100.0 * parseFloat(rawData[rdi].sum_has_3plus) / (1.0 * totalPop)).toFixed(2),
        })
      }
    },
    compareAreas() {
      const self = this

      this.updateUrlParams()
      // all data we need for query
      //console.log('CompareAreas input : ', this.$refs.autocomplete.typeaheadModel.geoid, this.selectedTech, this.selectedSpeed, this.searchType)

      let socParams = {          
        type: this.typeDictionaryArea[this.searchType],
        tech: this.selectedTech,
        speed: this.speedDictionary[this.selectedSpeed],
        $limit: 50000,
        $$app_token: this.appToken,
        $select: 'id,sum(has_0),sum(has_1),sum(has_2),sum(has_3plus)',
        $group: 'id'
      }
      if (this.$refs.autocomplete.typeaheadModel.geoid) {
        socParams['$WHERE'] = "starts_with(id,'" + this.$refs.autocomplete.typeaheadModel.geoid + "')"
      }

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
          socLookupParams['$WHERE'] = "starts_with(geoid,'" + self.$refs.autocomplete.typeaheadModel.geoid + "')"
        }

        axios
        .get(self.socrataLookupURL, {
          params: socLookupParams,
          headers: self.httpHeaders
        })
        .then(function (response) {
          let lookupData = {}
          for (let rdi in response.data) {
            if (response.data[rdi].type === 'tribal') {
              lookupData[response.data[rdi].geoid.replace(/\D/g,'')] = response.data[rdi].name
            } else {
              lookupData[response.data[rdi].geoid] = response.data[rdi].name
            }
          }
          self.assembleRows(rawData, lookupData)
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

      if (this.areaForSearch && this.areaForSearch !== '') {
        routeQP.searcharea = this.areaForSearch.toLowerCase()
      } else {
        delete routeQP.searcharea
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
        this.toggleSearchType(this.typeReverseDictionary[routeQP.searchtype])
      }

      if (routeQP.searcharea) {
        this.searchArea(routeQP.searcharea.charAt(0).toUpperCase() + routeQP.searcharea.slice(1))
      } else {
        this.searchArea('')
      }

      if (routeQP.geoid) {
        this.$refs.autocomplete.typeaheadModel = {
                                        'geoid': routeQP.geoid, 
                                        'name': this.stateGeoidToName[routeQP.geoid],
                                        'type': 'state'}
      }
      if (routeQP.searchtype || routeQP.searcharea || routeQP.geoid) this.compareAreas()
    }   
  },
  computed: {
    getPlaceholderText: function () { // Set the geography type input placeholder text based on search type
      let srchType = this.searchTypes.comparison[this.searchType]

      return srchType.hasOwnProperty('placeholderText') ? srchType.placeholderText : 'Enter ' + srchType.label
    }
  }
}
