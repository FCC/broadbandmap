import { Modal } from 'uiv'
import EventHub from '../../../_mixins/EventHub.js'
import { urlValidation } from '../../../_mixins/urlValidation.js'
import { technologies, speeds } from '../../../_mixins/tech-speeds.js'
import { modalAccessibility } from '../../../_mixins/modal-accessibility.js'

export default {
  name: 'MapSettings',
  components: { Modal },
  mixins: [urlValidation, modalAccessibility],
  props: [],
  mounted () {
    // Get tech and speed values from Store
    EventHub.$on('loadBroadband', (tech, speed) => {
      this.selectedTechCategories = tech.toLowerCase().split('')
      this.selectedSpeed = speed
    })

    EventHub.$on('openMapSettings', () => {
      this.showModal = true
    })
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
