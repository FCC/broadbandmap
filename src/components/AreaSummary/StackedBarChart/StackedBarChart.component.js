import VueCharts from 'vue-chartjs'
import { Bar } from 'vue-chartjs'

export default {
  name: 'StackedBarChart',
  components: { },
  props: ['data'],
  extends: Bar,
  mounted () {
    this.renderChart(this.data, this.options)
  },
  data () {
    return {
      options: {
        legend: {
          display: false
        },
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          xAxes: [{
            barThickness: 50,
            stacked: true,
            scaleLabel: {
              display: true,
              labelString: 'Speed (Mbps downstream\\upstream)'
            }
          }],
          yAxes: [{
            stacked: true,
            scaleLabel: {
              display: true,
              labelString: 'Population Percentage'
            },
            gridLines: {
              display: true
            },
            ticks: {
              beginAtZero: true
            }
          }]
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItems, data) {
              return data.datasets[tooltipItems.datasetIndex].label + ': ' + tooltipItems.yLabel + '%'
            }
          }
        }
      }
    }
  }
}
