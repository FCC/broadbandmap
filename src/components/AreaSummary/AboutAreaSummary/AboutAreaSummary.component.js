import { Modal } from 'uiv'
import { modalAccessibility } from '../../../_mixins/modal-accessibility.js'

import EventHub from '../../../_mixins/EventHub.js'

export default {
  name: 'AboutAreaSummary',
  components: { Modal },
  mixins: [modalAccessibility],
  props: [],
  mounted () {
    EventHub.$on('openAboutAreaSummary', function () {
      this.showModal = true
    }.bind(this))
  },
  destroyed () {
    EventHub.$off('openAboutAreaSummary')
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
