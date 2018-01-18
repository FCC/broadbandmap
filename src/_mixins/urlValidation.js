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
      return (typeof this.$route.query[param] === 'string' && this.$route.query[param].length)
    },
    isValidTech (selectedTech) {
      let hasNumbers = /\d/.test(selectedTech)

      if (selectedTech && selectedTech.length < 7 && !hasNumbers) {
        let invalidChars = selectedTech.toLowerCase().match(/[^acfosw]/g)

        return invalidChars === null
      } else {
        return false
      }
    },
    isValidSpeed (selectedSpeed) {
      const speeds = ['200', '4_1', '10_1', '25_3', '100_10', '250_25', '1000_100']

      return speeds.indexOf(selectedSpeed) > -1
    }
  }
}
