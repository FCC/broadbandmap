export default {
  name: 'PageNotFound',
  computed: {
    requestPage () {
      return this.$router.history.current.redirectedFrom.split('?')[0]
    }
  }
}
