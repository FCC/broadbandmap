export default {
  name: 'PageNotFound',
  mounted () {
    document.title = 'Page not found | Fixed Broadband Deployment Data | Federal Communications Commission'
  },
  computed: {
    requestPage () {
      if (this.$router.history.current.redirectedFrom !== undefined) {
        return this.$router.history.current.redirectedFrom.split('?')[0]
      }
    }
  }
}
