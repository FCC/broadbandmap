import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home/'
import LocationSummary from '@/components/LocationSummary/'
import AreaSummary from '@/components/AreaSummary/'
import ProviderDetail from '@/components/ProviderDetail/'
import AreaComparison from '@/components/AreaComparison/'
import DataDownload from '@/components/DataDownload/'
import About from '@/components/About/'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: '/nbm2/DEV/',
  linkExactActiveClass: 'active',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { title: 'Home' }
    },
    {
      path: '/location-summary',
      name: 'LocationSummary',
      component: LocationSummary,
      meta: { title: 'Location Summary' }
    },
    {
      path: '/area-summary',
      name: 'AreaSummary',
      component: AreaSummary,
      meta: { title: 'Area Summary' }
    },
    {
      path: '/provider-detail',
      name: 'ProviderDetail',
      component: ProviderDetail,
      meta: { title: 'Provider Detail' }
    },
    {
      path: '/area-comparison',
      name: 'AreaComparison',
      component: AreaComparison,
      meta: { title: 'Area Comparison' }
    },
    {
      path: '/data-download',
      name: 'DataDownload',
      component: DataDownload,
      meta: { title: 'Data Download' }
    },
    {
      path: '/about',
      name: 'About',
      component: About,
      meta: { title: 'About' }
    }
  ]
})
