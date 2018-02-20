import { Modal } from 'uiv'
import { modalAccessibility } from '../../../_mixins/modal-accessibility.js'

import EventHub from '../../../_mixins/EventHub.js'

export default {
  name: 'AboutProviderDetail',
  components: { Modal },
  mixins: [modalAccessibility],
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
