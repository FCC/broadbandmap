import EventHub from '../../../_mixins/EventHub.js'
import { Modal } from 'uiv'

export default {
  name: 'MapSettings',
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
      selectedTech: ['a', 'c', 'f', 'w', 's', 'o'],
      speeds: [
        {
          name: '0.2',
          value: '200'
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
          name: '50/5',
          value: '50_5'
        },
        {
          name: '100/10',
          value: '100_10'
        }],
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
    closeModal () {
      this.showModal = false
    },
    saveSettings () {
      // layerID corresponds to first letter of all selected layer names (e.g. acfosw)
      let layerID = this.selectedTech.sort().join('')

      // propertyID (eg. acfosw_25_3) corresponds to tileset property (field) ID
      let propertyID = ''

      // set default speed when no technology selected
      if (this.selectedSpeed === '') {
        this.selectedSpeed = '25_3'
      }

      // when no technology is selected, set selected speed to empty string
      if (layerID === '') {
        this.selectedSpeed = ''
        propertyID = ''
      } else {
        // set property ID = layer ID + selected speed
        propertyID = [layerID, this.selectedSpeed].join('_')
      }

      // if no tech or speed selected, remove all tech and speed map layers
      if (propertyID === '') {
        EventHub.$emit('removeLayers', this.selectedPropertyID)
      } else {
        this.selectedPropertyID = propertyID
        EventHub.$emit('updateMapSettings', propertyID)
      }
    }
  }
}
