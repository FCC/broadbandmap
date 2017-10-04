export default {
  version: 8,
  name: 'Basic',
  metadata: {
    'mapbox:autocomposite': true
  },
  sources: {
    mapbox: {
      url: 'mapbox://mapbox.mapbox-streets-v7',
      type: 'vector'
    },
    baseStreet: {
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
    },
    tribal: {
      type: 'raster',
      tiles: [
        'https://geo.fcc.gov/fcc/gwc/service/wms?tiled=true&service=WMS&request=GetMap&layers=bpr_tribal&styles=bpr_tribal&format=image%2Fpng&transparent=true&version=1.1.1&color=%236CBCD5&height=256&width=256&bbox={bbox-epsg-3857}&srs=EPSG%3A3857'
      ],
      tileSize: 256
    },
    urban: {
      type: 'raster',
      tiles: [
        'https://geo.fcc.gov/fcc/gwc/service/wms?tiled=true&service=WMS&request=GetMap&layers=fcc:bpr_county_layer_urban_only&styles=bpr_layer_urban&format=image%2Fpng&transparent=true&version=1.1.1&color=%236CBCD5&height=256&width=256&bbox={bbox-epsg-3857}&srs=EPSG%3A3857'
      ],
      tileSize: 256
    }
  },
  sprite: 'mapbox://sprites/mapbox/basic-v8',
  glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
  layers: [
    {
      id: 'base-street',
      type: 'raster',
      source: 'baseStreet'
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
    },
    {
      id: 'tribal',
      type: 'raster',
      source: 'tribal',
      layout: {
        visibility: 'none'
      },
      paint: {}
    },
    {
      id: 'urban',
      type: 'raster',
      source: 'urban',
      layout: {
        visibility: 'none'
      },
      paint: {}
    }
  ]
}
