import EventHub from '../../../_mixins/EventHub.js'

export default {
  name: 'nbMapSidebar',
  props: [],
  mounted () {

  },
  data () {
    return {
      hidePane: false
    }
  },
  methods: {
    toggle: function () {
      this.hidePane = !this.hidePane

      EventHub.$emit('toggleSidebar', this.hidePane)
    }
  },
  computed: {

  }
}
