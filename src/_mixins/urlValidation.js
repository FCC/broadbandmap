export const urlValidation = {
  data () {
    return {
    }
  },
  methods: {
    isValidLatLon () {
      return (typeof this.$route.query.lat === 'string' && typeof this.$route.query.lon === 'string' && this.$route.query.lat.length && this.$route.query.lon.length && !isNaN(this.$route.query.lat) && !isNaN(this.$route.query.lon))
    },
    isValidAddress () {
      return (typeof this.$route.query.place_name === 'string' && this.$route.query.place_name.length)
    }
  }
}
