import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home/'
import LocationSummary from '@/components/LocationSummary/'
import AreaSummary from '@/components/AreaSummary/'
import ProviderDetail from '@/components/ProviderDetail/'
import AreaComparison from '@/components/AreaComparison/'
import DataDownload from '@/components/DataDownload/'
import About from '@/components/About/'
import PageNotFound from '@/components/PageNotFound/'

Vue.use(Router)

const titleText = ' | Fixed Broadband Deployment Data | Federal Communications Commission'

const router = new Router({
  linkActiveClass: 'active',
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
      path: '/area-comparison',
      name: 'AreaComparison',
      component: AreaComparison,
      meta: { title: 'Area Comparison' }
    },
    {
      path: '/provider-detail',
      name: 'ProviderDetail',
      component: ProviderDetail,
      meta: { title: 'Provider Detail' }
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
    },
    {
      path: '/PageNotFound',
      name: 'Page Not Found',
      component: PageNotFound
    },
    {
      path: '*',
      redirect: 'PageNotFound'
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    // Make the page scroll to top when route changes
    if (to.name !== from.name) {
      return { x: 0, y: 0 }
    }

    // Handle anchor links
    if (to.hash) {
      return {
        selector: to.hash
      }
    }
  }
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title + titleText
  next()
})

router.afterEach(function (transition) {
  window.ga('set', 'page', transition.fullPath)
  window.ga('set', 'title', transition.meta.title)
  window.ga('send', 'pageview')
})

export default router
