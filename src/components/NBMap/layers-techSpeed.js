export const sourcesTechSpeed = [
  {
    id: '200',
    url: 'mapbox://fcc.3mn2ckcc',
    type: 'vector'
  },
  {
    id: '10_1',
    url: 'mapbox://fcc.97d0gam3',
    type: 'vector'
  },
  {
    id: '25_3',
    url: 'mapbox://fcc.4ai93o1d',
    type: 'vector'
  },
  {
    id: '50_5',
    url: 'mapbox://fcc.dcc1b9rv',
    type: 'vector'
  },
  {
    id: '100_10',
    url: 'mapbox://fcc.btj2xg09',
    type: 'vector'
  }
]

export const layersTechSpeed = {
  '200': {
    id: 'all_200',
    source: '200',
    beforeLayer: 'block'
  },
  '10': {
    id: 'all_10',
    source: '10_1',
    beforeLayer: 'block'
  },
  '25': {
    id: 'all_25',
    source: '25_3',
    beforeLayer: 'block'
  },
  '50': {
    id: 'all_50',
    source: '50_5',
    beforeLayer: 'block'
  },
  '100': {
    id: 'all_100',
    source: '100_10',
    beforeLayer: 'block'
  }
}
