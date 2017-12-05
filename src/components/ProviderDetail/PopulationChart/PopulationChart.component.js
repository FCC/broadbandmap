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
            'rgb(255,132,139)',
            'rgb(131,142,255)',
            'rgb(255,255,149)']
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
