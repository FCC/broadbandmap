import { Modal } from 'uiv'
import EventHub from '../../../_mixins/EventHub.js'

export default {
  name: 'AboutAreaComparison',
  components: { Modal },
  mixins: [],
  props: [],
  mounted () {
    EventHub.$on('openAboutAreaCompare', function () {
      this.showModal = true
    }.bind(this))
  },
  destroyed () {
    EventHub.$off('openAboutAreaCompare')
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
