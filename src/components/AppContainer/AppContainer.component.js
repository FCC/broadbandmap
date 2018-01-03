import AppHeader from '@/components/AppHeader/'
import SystemAlert from '@/components/SystemAlert/'
import MapSettings from '@/components/NBMap/NBMapSettings/'
import TableSettings from '@/components/AreaComparison/TableSettings/'
import AboutLocationSummary from '@/components/LocationSummary/AboutLocationSummary/'
import AboutAreaSummary from '@/components/AreaSummary/AboutAreaSummary/'
import AboutProviderDetail from '@/components/ProviderDetail/AboutProviderDetail/'
import AboutAreaComparison from '@/components/AreaComparison/AboutAreaComparison/'
import AppFooter from '@/components/AppFooter/'

export default {
  name: 'AppContainer',
  components: { AppHeader, SystemAlert, MapSettings, TableSettings, AboutLocationSummary, AboutAreaSummary, AboutProviderDetail, AboutAreaComparison, AppFooter },
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
