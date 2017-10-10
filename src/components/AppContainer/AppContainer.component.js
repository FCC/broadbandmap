import AppHeader from '@/components/AppHeader/'
import AppFooter from '@/components/AppFooter/'

export default {
  name: 'AppContainer',
  components: { AppHeader, AppFooter },
  props: [],
  mounted () {

  },
  data () {
    return {
      toggleNav: false
    }
  },
  methods: {
    toggleHamburger: function (isShown) {
      this.toggleNav = isShown
    }
  },
  computed: {

  }
}
