export const appStore = {
  state: {
    mapOptions: {
      center: [-94.96, 38.82],
      maxZoom: 22,
      minZoom: 0,
      pitchWithRotate: false,
      zoom: 3
    },
    addrSearch: {
      place_name: undefined
    },
    broadband: {
      tech: 'acfosw',
      speed: '25_3'
    },
    block: {
      lat: undefined,
      lon: undefined
    },
    view: {
      vlat: undefined,
      vlon: undefined,
      vzoom: undefined
    },
    geogSearch: {
      type: 'nation',
      geoid: 0,
      bbox_arr: undefined
    }
  },
  getters: {
    getMapOptions: state => state.mapOptions,
    getMapView: state => state.view,
    getBroadband: state => state.broadband,
    getBlock: state => state.block,
    getAddrSearch: state => state.addrSearch,
    getGeogSearch: state => state.geogSearch
  },
  mutations: {
    setMapView (state, view) {
      state.view = view
    },
    setBroadband (state, broadband) {
      state.broadband = broadband
    },
    setBlock (state, block) {
      state.block = block
    },
    setAddrSearch (state, addrSearch) {
      state.addrSearch = addrSearch
    },
    setGeogSearch (state, geogSearch) {
      state.geogSearch = geogSearch
    }
  }
}
