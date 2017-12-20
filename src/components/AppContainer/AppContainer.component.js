import AppHeader from '@/components/AppHeader/'
import SystemAlert from '@/components/SystemAlert/'
import MapSettings from '@/components/NBMap/NBMapSettings/'
import TableSettings from '@/components/AreaComparison/TableSettings/'
import AppFooter from '@/components/AppFooter/'

export default {
  name: 'AppContainer',
  components: { AppHeader, SystemAlert, MapSettings, TableSettings, AppFooter },
  props: [],
  mounted () {

  },
  data () {
    return {
      isMobileNavShown: false
    }
  },
  methods: {
    // Called any time the hambuger icon is clicked, to open or close the secondary nav
    setHamburger: function (isMobileNavShown) {
      this.isMobileNavShown = isMobileNavShown
    }
  },
  computed: {

  }
}
