import VueCharts from 'vue-chartjs'
import { Bar } from 'vue-chartjs'

export default {
  name: 'PopulationChart',
  components: { },
  props: ['data'],
  extends: Bar,
  mounted () {
    let chartData = {
      datasets: [
        {
          backgroundColor: [
            process.env.CHART_COLOR_01,
            process.env.CHART_COLOR_02,
            process.env.CHART_COLOR_03]
        }
      ]
    }

    // add the prop data to chartData labels and datasets
    chartData.labels = this.data.labels
    chartData.datasets[0].data = this.data.data

    this.renderChart(chartData, this.options)
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
            barThickness: 73,
            stacked: false,
            scaleLabel: {
              display: true,
              labelString: 'Provider'
            }
          }],
          yAxes: [{
            stacked: false,
            scaleLabel: {
              display: true,
              labelString: 'Percentage'
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
              return data.labels[tooltipItems.index] + ': ' + tooltipItems.yLabel
            }
          }
        }
      }
    }
  }
}
