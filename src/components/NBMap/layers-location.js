export default {
  version: 8,
  name: 'Basic',
  metadata: {
    'mapbox:autocomposite': true
  },
  sources: {
    dark: {
      type: 'raster',
      url: 'mapbox://mapbox.dark',
      tileSize: 256
    },
    satellite: {
      type: 'raster',
      url: 'mapbox://mapbox.satellite',
      tileSize: 256
    },
    street: {
      type: 'raster',
      url: 'mapbox://fcc.k74ed5ge',
      tileSize: 256
    },
    deploymentFixed: {
      type: 'raster',
      tiles: [
        'https://geo.fcc.gov/fcc/gwc/service/wms?tiled=true&service=WMS&request=GetMap&layers=bpr_apr2017_county_layer_fixed&styles=bpr_layer_fixed_1&format=image%2Fpng&transparent=true&version=1.1.1&color=%236CBCD5&height=256&width=256&bbox={bbox-epsg-3857}&srs=EPSG%3A3857'
      ],
      tileSize: 256
    },
    deploymentNoFixed: {
      type: 'raster',
      tiles: [
        'https://geo.fcc.gov/fcc/gwc/service/wms?tiled=true&service=WMS&request=GetMap&layers=bpr_apr2017_county_layer_nonfixed&styles=bpr_layer_fixed_0&format=image%2Fpng&transparent=true&version=1.1.1&color=%236CBCD5&height=256&width=256&bbox={bbox-epsg-3857}&srs=EPSG%3A3857'
      ],
      tileSize: 256
    }
  },
  sprite: 'mapbox://sprites/mapbox/basic-v8',
  glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
  layers: [
    {
      id: 'dark',
      type: 'raster',
      source: 'dark',
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'satellite',
      type: 'raster',
      source: 'satellite',
      layout: {
        visibility: 'none'
      }
    },
    {
      id: 'street',
      type: 'raster',
      source: 'street',
      layout: {
        visibility: 'none'
      }
    },
    {
      id: 'deploymentFixed',
      type: 'raster',
      source: 'deploymentFixed',
      layout: {
        visibility: 'visible'
      },
      paint: {}
    },
    {
      id: 'deploymentNoFixed',
      type: 'raster',
      source: 'deploymentNoFixed',
      layout: {
        visibility: 'visible'
      },
      paint: {}
    }
  ]
}
