import { Modal } from 'uiv'
import EventHub from '../../../_mixins/EventHub.js'

export default {
  name: 'AboutProviderDetail',
  components: { Modal },
  mixins: [],
  props: [],
  mounted () {
    EventHub.$on('openAboutProvider', function () {
      this.showModal = true
    }.bind(this))
  },
  destroyed () {
    EventHub.$off('openAboutProvider')
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
