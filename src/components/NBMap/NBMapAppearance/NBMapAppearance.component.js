import { Modal } from 'uiv'
import { Chrome } from 'vue-color'

import EventHub from '../../../_mixins/EventHub.js'
import { urlValidation } from '../../../_mixins/urlValidation.js'
import { mapSettings } from '../../../_mixins/map-settings.js'

export default {
  name: 'MapAppearance',
  components: { Modal, 'color-picker': Chrome },
  mixins: [urlValidation],
  props: [],
  data () {
    return {
      showModal: false,
      opacity: mapSettings.opacity,
      hlColors: mapSettings.highlightColor,
      displayPicker: false
    }
  },
  mounted () {
    EventHub.$on('openMapAppearance', () => {
      this.showModal = true
    })
  },
  destroyed () {
    EventHub.$off('openMapAppearance', () => {
      this.showModal = true
    })
  },
  methods: {
    updateOpacity (opacity) {
      EventHub.$emit('updateOpacity', opacity)
    },
    updateHighlight (useDefault) {
      if (useDefault) {
        this.hlColors = mapSettings.highlightColor
      }

      EventHub.$emit('updateHighlight', this.hlColors.hex)
    },
    showPicker () {
      this.displayPicker = true
      document.addEventListener('click', this.documentClick)
    },
    hidePicker () {
      this.displayPicker = false
      document.removeEventListener('click', this.documentClick)
    },
    documentClick (e) { // Hide color picker when clicking outside the color picker DIV
      let el = document.getElementById('colorPicker')
      let target = e.target

      if (el !== target && !el.contains(target)) {
        this.hidePicker()
      }
    },
    saveSettings () {
      console.log('saveSettings')
    },
    closeModal () {
      this.showModal = false
    }
  },
  watch: {
    '$route' (to, from) {
      // Reset modal data when page changes
      if (to.name !== from.name) {
        Object.assign(this.$data, this.$options.data.call(this))
      }
    }
  }
}
