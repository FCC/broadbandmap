export const sourcesTechSpeed = [{
  id: 'county-techSpeed',
  url: 'mapbox://fcc.9nsww14b',
  type: 'vector'
},
{
  id: 'block-techSpeed',
  url: 'mapbox://fcc.2aq1sqrg',
  type: 'vector'
},
{
  id: 'tract-block-combo',
  url: 'mapbox://fcc.7cg8a56e',
  type: 'vector'
},
{
  id: 'tract-speed-200',
  url: 'mapbox://fcc.bi1dbc0r',
  type: 'vector'
},
{
  id: 'tract-speed-10',
  url: 'mapbox://fcc.a6x4nf2x',
  type: 'vector'
},
{
  id: 'tract-speed-25',
  url: 'mapbox://fcc.4vacyilq',
  type: 'vector'
},
{
  id: 'tract-speed-50',
  url: 'mapbox://fcc.6tutbhh2',
  type: 'vector'
},
{
  id: 'tract-speed-100',
  url: 'mapbox://fcc.2ek9cchf',
  type: 'vector'
}
]

export const layersTechSpeed = [{
  id: 'county_round_z0_z2',
  source: 'county-techSpeed',
  maxzoom: 3,
  beforeLayer: 'county'
},
{
  id: 'county_round_z3_z6',
  source: 'county-techSpeed',
  maxzoom: 7,
  beforeLayer: 'county'
},
{
  id: 'block_null_z10',
  source: 'block-techSpeed',
  maxzoom: 11,
  beforeLayer: 'block'
},
{
  id: 'block_null_z11',
  source: 'block-techSpeed',
  maxzoom: 15,
  beforeLayer: 'block'
},
{
  id: 'big_tract_blocks_z9',
  source: 'tract-block-combo',
  maxzoom: 10,
  beforeLayer: ''
},
{
  id: 'tract_round_all_z9',
  source: 'tract-block-combo',
  maxzoom: 10,
  beforeLayer: ''
}
]

export const layersSpeed = {
  200: [{
    id: 'tract_round_200_z4_z5',
    source: 'tract-speed-200',
    maxzoom: 6,
    beforeLayer: 'tract'
  },
  {
    id: 'tract_round_200_z6_z9',
    source: 'tract-speed-200',
    maxzoom: 10,
    beforeLayer: 'tract'
  }],
  10: [{
    id: 'tract_round_10_1_z4_z5',
    source: 'tract-speed-10',
    maxzoom: 6,
    beforeLayer: 'tract'
  },
  {
    id: 'tract_round_10_1_z6_z9',
    source: 'tract-speed-10',
    maxzoom: 10,
    beforeLayer: 'tract'
  }],
  25: [{
    id: 'tract_round_25_3_z4_z5',
    source: 'tract-speed-25',
    maxzoom: 6,
    beforeLayer: 'tract'
  },
  {
    id: 'tract_round_25_3_z6_z9',
    source: 'tract-speed-25',
    maxzoom: 10,
    beforeLayer: 'tract'
  }],
  50: [{
    id: 'tract_round_50_5_z4_z5',
    source: 'tract-speed-50',
    maxzoom: 6,
    beforeLayer: 'tract'
  },
  {
    id: 'tract_round_50_5_z6_z9',
    source: 'tract-speed-50',
    maxzoom: 10,
    beforeLayer: 'tract'
  }],
  100: [{
    id: 'tract_round_100_10_z4_z5',
    source: 'tract-speed-100',
    maxzoom: 6,
    beforeLayer: 'tract'
  },
  {
    id: 'tract_round_100_10_z6_z9',
    source: 'tract-speed-100',
    maxzoom: 10,
    beforeLayer: 'tract'
  }]
}
