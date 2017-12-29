import EventHub from '../../../_mixins/EventHub.js'
import { Modal } from 'uiv'

export default {
  name: 'TableSettings',
  components: { Modal },
  props: [],
  mounted () {

  },
  data () {
    return {
      showModal: false,
      technologies: [
        {
          name: 'ADSL',
          value: 'a'
        },
        {
          name: 'Cable',
          value: 'c'
        },
        {
          name: 'Fiber',
          value: 'f'
        },
        {
          name: 'Fixed Wireless',
          value: 'w'
        },
        {
          name: 'Satellite',
          value: 's'
        },
        {
          name: 'Other',
          value: 'o'
        }
      ],
      selectedTechCategories: ['a', 'c', 'f', 'w', 's', 'o'],
      speeds: [
        {
          name: '0.2/0.2',
          value: '200'
        },
        {
          name: '4/1',
          value: '4_1'
        },
        {
          name: '10/1',
          value: '10_1'
        },
        {
          name: '25/3',
          value: '25_3'
        },

        {
          name: '100/10',
          value: '100_10'
        },
        {
          name: '250/25',
          value: '250_25'
        },
        {
          name: '1000/100',
          value: '1000_100'
        }],
      selectedSpeed: '25_3',
      selectedPropertyID: ''
    }
  },
  created () {
    EventHub.$on('openTableSettings', function () {
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
        EventHub.$emit('removeTableData', this.selectedPropertyID, removeAll)
      } else {
        this.selectedPropertyID = propertyID
        // Send technologies & speed to LocationSummary and AreaSummary components
        EventHub.$emit('updateTableSettings', selectedTech, this.selectedSpeed)
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
      }
    }
  }
}
