export const urlValidation = {
  data () {
    return {
    }
  },
  methods: {
    isValidLatLon (lat, lon) {
      // NOTE: Mapbox intermittently rejects a latitude of exactly -90
      return (typeof lat === 'string' && typeof lon === 'string' && lat.length && lon.length && !isNaN(lat) && !isNaN(lon) && lat > -90 && lat <= 90 && lon >= -180 && lon <= 180)
    },
    isValidAddress (address) {
      return (typeof address === 'string' && address.length)
    },
    isValidQueryParam (param) {
      console.log()
      return (typeof this.$route.query[param] === 'string' && this.$route.query[param].length)
    }
  }
}
