import mapboxgl from 'mapboxgl'
import { Tooltip } from 'uiv'
import nbMapSearch from './NBMapSearch/'
import EventHub from '../../_mixins/EventHub.js'
import layers from './layers-location.js'

export default {
  name: 'nbMap',
  components: { Tooltip, 'nbMapSearch': nbMapSearch },
  props: ['defaultSearch', 'type'],
  mounted() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiY29tcHV0ZWNoIiwiYSI6InMyblMya3cifQ.P8yppesHki5qMyxTc2CNLg'

    let map = new mapboxgl.Map({
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

    // define custom Nationwide control
    class MyCustomControl {
      onAdd(map) {
        this.map = map;
        this.container = document.getElementById('btn-custom');        
        return this.container;
      }
      onRemove() {
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
      }
    }

    const myCustomControl = new MyCustomControl();

    // add map controls
    map.addControl(navControl, 'top-left')
    map.addControl(geoLocControl, 'top-left')
    map.addControl(myCustomControl, 'top-left');    

    // toggle map full width
    EventHub.$on('toggleSidebar', data => {
      let element = document.querySelector('.map-sidebar')

      this.toggleWidth = data

      element.addEventListener('transitionend', function(event) {
        map.resize()
      }, false)
    })

    this.Map = map
  },
  data() {
    return {
      toggleWidth: false,
      Map: {}
    }
  },
  methods: {
    viewNationwide: function() {      
      this.Map.flyTo({
        center: [-94.96, 38.82],
        zoom: 3
      });
    }
  },
  computed: {

  }
}
