import { Modal } from 'uiv'
import { modalAccessibility } from '../../../_mixins/modal-accessibility.js'

import EventHub from '../../../_mixins/EventHub.js'

export default {
  name: 'AboutLocationSummary',
  components: { Modal },
  mixins: [modalAccessibility],
  props: [],
  mounted () {
    EventHub.$on('openAboutLocSummary', () => {
      this.showModal = true
    })
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
