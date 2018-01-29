import { Modal } from 'uiv'
import EventHub from '../../../_mixins/EventHub.js'
import { urlValidation } from '../../../_mixins/urlValidation.js'
import { technologies, speeds } from '../../../_mixins/tech-speeds.js'

export default {
  name: 'MapAppearance',
  components: { Modal },
  mixins: [urlValidation],
  props: [],
  data () {
    return {
      showModal: false,
      technologies: technologies,
      selectedTechCategories: ['a', 'c', 'f', 'w', 's', 'o'],
      speeds: speeds,
      selectedSpeed: '25_3',
      selectedPropertyID: '',
      opacity: 100
    }
  },
  mounted () {
    EventHub.$on('openMapAppearance', () => {
      this.showModal = true
    })

    // Get selectedTech and selectedSpeed values from URL query params
    let tech = this.$route.query.selectedTech
    let speed = this.$route.query.selectedSpeed

    // If selectedTech is available in URL, use that value
    if (this.isValidTech(tech)) {
      this.selectedTechCategories = tech.toLowerCase().split('')
    }

    // If selectedSpeed is available in URL, use that value
    if (this.isValidSpeed(speed)) {
      this.selectedSpeed = speed
    }
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
