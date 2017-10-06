import { Tooltip } from 'uiv'
import EventHub from '../../../_mixins/EventHub.js'

export default {
  name: 'nbMapSidebar',
  components: { Tooltip },
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
    }
  },
  computed: {

  }
}
