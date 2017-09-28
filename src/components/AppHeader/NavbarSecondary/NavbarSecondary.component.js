export default {
  name: 'NavbarSecondary',
  props: [],
  mounted () {

  },
  data () {
    return {

    }
  },
  methods: {

  },
  computed: {
    routes: function () {
      let routes = []
      let route = {}

      for (var i in this.$router.options.routes) {
        if (!this.$router.options.routes.hasOwnProperty(i)) {
          continue
        }

        route = this.$router.options.routes[i]

        if (route.hasOwnProperty('meta')) {
          routes.push(route)
        }
      }

      return routes
    }
  }
}
