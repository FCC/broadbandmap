import nbMap from '../NBMap/'
import nbMapSidebar from '../NBMap/NBMapSidebar/'
import axios from 'axios'

export default {
  name: 'AreaSummary',
  components: { 'nbMap': nbMap, 'nbMapSidebar': nbMapSidebar },
  props: [],
  data () {
    return {

    }
  },
  mounted () {
    // Call Socrata API - Combined Table for charts
    axios
    .get('https://fcc-dev.data.socrata.com/resource/wnht-yxes.json', {
      params: {
        id: 51013,
        type: 'county',
        tech: 'a',
        $$app_token: process.env.SOCRATA_APP_TOKEN
      },
      headers: {
        // Dev: Authentication to Socrata using HTTP Basic Authentication
        'Authorization': 'Basic ' + process.env.SOCRATA_HTTP_BASIC_AUTHENTICATION
      }
    })
    .then(function (response) {
      console.log('Success! response= ', response)
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
  methods: {

  },
  computed: {

  }
}
