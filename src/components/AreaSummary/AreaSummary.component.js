import nbMap from '../NBMap/'
import nbMapSidebar from '../NBMap/NBMapSidebar/'
import axios from 'axios'
const d3 = require('d3')

export default {
  name: 'AreaSummary',
  components: { 'nbMap': nbMap, 'nbMapSidebar': nbMapSidebar },
  props: [],
  data () {
    return {

    }
  },
  mounted () {
    this.fetchCombinedData()
  },
  methods: {
    fetchCombinedData () {
      const self = this
      let type = ''
      let id = 0
      // If the geoid and geography type are in the query string, use those
      if (typeof this.$route.query.type !== 'undefined' && ['state', 'county', 'place', 'cbsa', 'cd', 'tribal'].indexOf(this.$route.query.type) && typeof this.$route.query.geoid !== 'undefined') {
        type = this.$route.query.type
        id = this.$route.query.geoid
      // Set defaults
      } else {
        type = 'nation'
        id = 0
      }

      // Call Socrata API - Combined Table for charts
      axios
      .get('https://fcc-dev.data.socrata.com/resource/wnht-yxes.json', {
        params: {
          id: id,
          type: type,
          tech: 'a',
          $order: 'speed',
          $$app_token: process.env.SOCRATA_APP_TOKEN
        },
        headers: {
          // Dev: Authentication to Socrata using HTTP Basic Authentication
          'Authorization': 'Basic ' + process.env.SOCRATA_HTTP_BASIC_AUTHENTICATION
        }
      })
      .then(function (response) {
        console.log('Socrata response= ', response)
        self.drawCombinedCharts(response)
      })
      .catch(function (error) {
        if (error.response) {
          // Server responded with a status code that falls out of the range of 2xx
          console.log(error.response.data)
          console.log(error.response.status)
          console.log(error.response.headers)
        } else if (error.request) {
          // Request was made but no response was received
          console.log(error.request)
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message)
        }
        console.log(error)
      })
    },
    drawCombinedCharts (response) {
      var data = response.data
      let totalPop = 0
      for (var index in data) {
        // Convert populations from strings to numbers
        data[index].has_0 = parseInt(data[index].has_0)
        data[index].has_1 = parseInt(data[index].has_1)
        data[index].has_2 = parseInt(data[index].has_2)
        data[index].has_3plus = parseInt(data[index].has_3plus)
        // Convert to percentages
        totalPop = data[index].has_0 + data[index].has_1 + data[index].has_2 + data[index].has_3plus
        data[index].has_0 = data[index].has_0 / totalPop * 100
        data[index].has_1 = data[index].has_1 / totalPop * 100
        data[index].has_2 = data[index].has_2 / totalPop * 100
        data[index].has_3plus = data[index].has_3plus / totalPop * 100
      }

      // Draw charts using the D3 library
      var svg = d3.select('svg')
      var margin = {top: 20, right: 20, bottom: 30, left: 40}
      var width = +svg.attr('width') - margin.left - margin.right
      var height = +svg.attr('height') - margin.top - margin.bottom
      var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

      var x = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.05)
        .align(0.1)

      var y = d3.scaleLinear()
        .rangeRound([height, 0])

      var z = d3.scaleOrdinal()
        .range(['#e6eecf', '#9bc4c1', '#68a8b7', '#2e557a'])

      var keys = ['has_0', 'has_1', 'has_2', 'has_3plus']
      /* Do not sort
      data.sort(function(a, b) { return b.total - a.total; })
      */
      // X-domain
      x.domain(data.map(function (d) {
        return d.speed
      }))
      /* Use 100% instead
      y.domain([0, d3.max(data, function(d) { return d.total; })]).nice()
      */
      // Y-domain - Set range from 0% to 100%
      y.domain([0, 100]).nice()
      // Z-domain (Is this used?)
      z.domain(keys)

      // Bars
      g.append('g')
        .selectAll('g')
        .data(d3.stack().keys(keys)(data))
        .enter().append('g')
        .attr('fill', function (d) { return z(d.key) })
        .selectAll('rect')
        .data(function (d) { return d })
        .enter().append('rect')
        // .attr('x', function (d) { return x(d.data.speed) })
        .attr('x', function (d) {
          // console.log('d=', d)
          // console.log('x(d)=', x(d))
          return x(d.data.speed)
        })
        .attr('y', function (d) { return y(d[1]) })
        .attr('height', function (d) { return y(d[0]) - y(d[1]) })
        .attr('width', x.bandwidth())
        // .attr('width', 20)

      // X-axis
      g.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x))

      // Y-axis
      g.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y).ticks(null, 's'))
        .append('text')
        .attr('x', 2)
        .attr('y', y(y.ticks().pop()) + 0.5 - 10)
        .attr('dy', '0.32em')
        .attr('fill', '#000')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'start')
        .text('% of population')

      /* Legend:
      var legend = g.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'end')
        .selectAll('g')
        .data(keys.slice().reverse())
        .enter().append('g')
        .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });
      legend.append('rect')
        .attr('x', width - 19)
        .attr('width', 19)
        .attr('height', 19)
        .attr('fill', z);
      legend.append('text')
        .attr('x', width - 24)
        .attr('y', 9.5)
        .attr('dy', '0.32em')
        .text(function(d) { return d; });
      */
    }
  },
  computed: {

  },
  watch: {
    // When query params change for the same route (URL slug)
    '$route' (to, from) {
      this.fetchCombinedData()
    }
  }
}
