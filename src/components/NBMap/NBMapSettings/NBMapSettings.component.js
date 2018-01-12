import { Modal } from 'uiv'
import EventHub from '../../../_mixins/EventHub.js'
import { urlValidation } from '../../../_mixins/urlValidation.js'
import { technologies, speeds } from '../../../_mixins/tech-speeds.js'

export default {
  name: 'MapSettings',
  components: { Modal },
  mixins: [urlValidation],
  props: [],
  mounted () {
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
  data () {
    return {
      showModal: false,
      technologies: technologies,
      selectedTechCategories: ['a', 'c', 'f', 'w', 's', 'o'],
      speeds: speeds,
      selectedSpeed: '25_3',
      selectedPropertyID: ''
    }
  },
  created () {
    EventHub.$on('openMapSettings', function () {
      this.showModal = true
    }.bind(this))
  },
  methods: {
    saveSettings () {
      // Corresponds to first letter of all selected layer names (e.g. acfosw)
      let selectedTech = this.selectedTechCategories.sort().join('')

      // propertyID (eg. acfosw_25_3) corresponds to tileset property (field) ID
      let propertyID = ''

      // set default speed when no technology selected
      if (this.selectedSpeed === '') {
        this.selectedSpeed = '25_3'
      }

      // when no technology is selected, set selected speed to empty string
      if (selectedTech === '') {
        this.selectedSpeed = ''
        propertyID = ''
      } else {
        // set property ID = layer ID + selected speed
        propertyID = [selectedTech, this.selectedSpeed].join('_')
      }
      // if no tech or speed selected, remove all tech and speed map layers
      if (propertyID === '') {
        const removeAll = true
        EventHub.$emit('removeLayers', this.selectedPropertyID, removeAll)
      } else {
        this.selectedPropertyID = propertyID
        // Send technologies & speed to LocationSummary and AreaSummary components
        EventHub.$emit('updateMapSettings', selectedTech, this.selectedSpeed)
      }
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
      } else {
        // When route params change, update selected tech and speed in Settings modal
        let tech = this.$route.query.selectedTech
        let speed = this.$route.query.selectedSpeed

        if (this.isValidTech(tech) && this.isValidSpeed(speed)) {
          this.selectedTechCategories = this.$route.query.selectedTech.split('')
          this.selectedSpeed = this.$route.query.selectedSpeed
        }
      }
    }
  }
}
