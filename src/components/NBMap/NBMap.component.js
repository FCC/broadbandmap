import mapboxgl from 'mapboxgl'
import { Dropdown, Tooltip } from 'uiv'
import nbMapSearch from './NBMapSearch/'
import EventHub from '../../_mixins/EventHub.js'
import layers from './layers-location.js'

export default {
  name: 'nbMap',
  components: { 'Dropdown': Dropdown, 'Tooltip': Tooltip, 'nbMapSearch': nbMapSearch },
  props: ['defaultSearch', 'type'],
  mounted () {
    this.$nextTick(this.init)
  },
  data () {
    return {
      Map: {},
      toggleWidth: false,
      baseLayerNames: [],
      defaultBaseLayer: 'dark'
    }
  },
  methods: {
    init: function () {
      mapboxgl.accessToken = 'pk.eyJ1IjoiY29tcHV0ZWNoIiwiYSI6InMyblMya3cifQ.P8yppesHki5qMyxTc2CNLg'

      let map = new mapboxgl.Map({
        attributionControl: false,
        container: 'map-location',
        style: layers,
        center: [-94.96, 38.82],
        logoPosition: 'bottom-left',
        zoom: 3,
        maxZoom: 10,
        minZoom: 3
      })

      // define navigation and geolocation controls
      const navControl = new mapboxgl.NavigationControl()
      const geoLocControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      })

      // define Attribution Control
      const attrControl = new mapboxgl.AttributionControl({
        compact: true
      })

      // define custom Nationwide control
      class NationwideBtnControl {
        onAdd (map) {
          this.map = map
          this.container = document.getElementById('btn-custom')
          return this.container
        }
        onRemove () {
          this.container.parentNode.removeChild(this.container)
          this.map = undefined
        }
      }

      const nationwideBtnControl = new NationwideBtnControl()

      // define custom layer switch control
      class LayerSwitchControl {
        onAdd (map) {
          this.map = map
          this.container = document.getElementById('btn-layerSwitch')
          return this.container
        }
        onRemove () {
          this.container.parentNode.removeChild(this.container)
          this.map = undefined
        }
      }

      const layerSwitchControl = new LayerSwitchControl()

      // define listener to resize map full width
      EventHub.$on('toggleSidebar', data => {
        let element = document.querySelector('.map-sidebar')

        this.toggleWidth = data

        element.addEventListener('transitionend', function (event) {
          map.resize()
        }, false)
      })

      // add controls to map
      map.addControl(attrControl, 'bottom-right')
      map.addControl(navControl, 'top-left')
      map.addControl(geoLocControl, 'top-left')
      map.addControl(nationwideBtnControl, 'top-left')
      map.addControl(layerSwitchControl, 'top-left')

      // add layer names to lawer switch control
      this.getLayerNames()

      this.Map = map
    },
    getLayerNames: function () {
      this.baseLayerNames = layers.layers.slice(0, 3).map(baseLayerName => {
        return baseLayerName.id
      })
    },
    switchBaseLayer: function (layerId) {
      this.baseLayerNames.map(layerName => {
        this.Map.setLayoutProperty(layerName, 'visibility', 'none')
      })

      this.Map.setLayoutProperty(layerId, 'visibility', 'visible')
    },
    viewNationwide: function () {
      this.Map.flyTo({
        center: [-94.96, 38.82],
        zoom: 3
      })
    }
  },
  computed: {

  }
}
