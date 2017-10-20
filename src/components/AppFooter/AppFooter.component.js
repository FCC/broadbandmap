import EventHub from '../../_mixins/EventHub.js'

import { Modal } from 'uiv'
export default {
  name: 'AppFooter',
  components: {
    Modal: Modal
  },
  props: [],
  mounted () {

  },
  data () {
    return {
      modalTitle: '',
      modalBody: '',
      modalModel: false
    }
  },
  created () {
    EventHub.$on('openModal', function (title, body) {
      // Display Modal uiv component
      this.modalTitle = title
      this.modalBody = body
      this.modalModel = true
    // Make "this" available here
    }.bind(this))
  },
  methods: {

  },
  computed: {

  }
}
