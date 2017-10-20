export default {
  name: 'AppHeader',
  components: { },
  props: [],
  mounted () {

  },
  data () {
    return {
      isMobileNavShown: false
    }
  },
  methods: {
    // Called when the hamburger icon is clicked
    hamburgerClicked () {
      this.isMobileNavShown = !this.isMobileNavShown
      this.$emit('setHamburger', this.isMobileNavShown)
    },
    // Called when a secondary nav button is clicked (in either desktop or mobile layout)
    secondaryNavClicked () {
      this.isMobileNavShown = false
      this.$emit('setHamburger', this.isMobileNavShown)
    }
  },
  computed: {
    isHome: function () {
      // hide secondary nav on Home page (desktop view)
      return this.$route.path === '/'
    },
    routes: function () {
      let routes = []
      let route = {}

      // create list of routes for secondary nav
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
