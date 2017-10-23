export const urlValidation = {
  data () {
    return {
    }
  },
  methods: {
    isValidLatLon (lat, lon) {
      return (typeof lat === 'string' && typeof lon === 'string' && lat.length && lon.length && !isNaN(lat) && !isNaN(lon))
    },
    isValidAddress (address) {
      return (typeof address === 'string' && address.length)
    }
  }
}
