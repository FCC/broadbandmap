import { Tooltip } from 'uiv'
import EventHub from '../../../_mixins/EventHub.js'

import BookmarkLink from '@/components/BookmarkLink'

export default {
  name: 'nbMapSidebar',
  components: { Tooltip, BookmarkLink },
  props: [],
  mounted () {

  },
  data () {
    return {
      hidePane: false,
      toggleText: 'Collapse sidebar',
      toggleTooltip: true
    }
  },
  methods: {
    toggle: function (event) {
      let thisTooltip = document.querySelectorAll('.tooltip')

      for (let i = 0; i < thisTooltip.length; i++) {
        thisTooltip[i].parentNode.removeChild(thisTooltip[i])
      }

      this.hidePane = !this.hidePane
      this.toggleText = this.hidePane ? 'Expand sidebar' : 'Collapse sidebar'

      EventHub.$emit('toggleSidebar', this.hidePane)
    },
    openAboutModal () {
      let thisTooltip = document.querySelectorAll('.tooltip')

      for (let i = 0; i < thisTooltip.length; i++) {
        thisTooltip[i].parentNode.removeChild(thisTooltip[i])
      }

      if (this.$route.name === 'LocationSummary') {
        EventHub.$emit('openAboutLocSummary')
      } else {
        EventHub.$emit('openAboutAreaSummary')
      }
    }
  },
  computed: {

  }
}
