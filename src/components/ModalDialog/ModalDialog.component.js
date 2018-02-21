// Used for displaying error and informational dialogs

import EventHub from '../../_mixins/EventHub.js'

import { Modal } from 'uiv'
import { modalAccessibility } from '../../_mixins/modal-accessibility.js'

export default {
  name: 'ModalDialog',
  components: { Modal },
  props: [],
  mixins: [modalAccessibility],
  mounted () {
    // Display modal for error messages
    EventHub.$on('openModal', (title, body) => {
      this.modalTitle = title
      this.modalBody = body
      this.modalModel = true
    })
  },
  data () {
    return {
      isMobileNavShown: false,
      modalTitle: '',
      modalBody: '',
      modalModel: false
    }
  },
  methods: {

  },
  computed: {

  }
}
