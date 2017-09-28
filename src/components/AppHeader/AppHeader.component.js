import NavbarSecondary from './NavbarSecondary/'

export default {
  name: 'AppHeader',
  components: { 'NavbarSecondary': NavbarSecondary },
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

    isHome: function () {
      return this.$route.path === '/'
    }
  }
}
