import { Modal } from 'uiv'
import EventHub from '../../../_mixins/EventHub.js'

export default {
  name: 'AboutLocationSummary',
  components: { Modal },
  mixins: [],
  props: [],
  mounted () {
    EventHub.$on('openAboutLocSummary', function () {
      this.showModal = true
    }.bind(this))
  },
  destroyed () {
    EventHub.$off('openAboutLocSummary')
  },
  data () {
    return {
      showModal: false
    }
  },
  methods: {
    closeModal () {
      this.showModal = false
    }
  }
}
