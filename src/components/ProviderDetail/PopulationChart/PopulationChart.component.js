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
            process.env.CHART_COLOR_03
          ],
          hoverBackgroundColor: [
            process.env.CHART_COLOR_01,
            process.env.CHART_COLOR_02,
            process.env.CHART_COLOR_03
          ]
        }
      ]
    }

    // Merge props 'data' with chartData labels and datasets
    chartData.labels = this.data.labels.map(label => label.slice(0, 10))
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
            },
            ticks: {
              fontStyle: 'bold'
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
              beginAtZero: true,
              fontStyle: 'bold'
            }
          }]
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItems, data) {
              let decimal2 = (tooltipItems.yLabel).toFixed(2)
              let decimal4 = (tooltipItems.yLabel).toFixed(4)
              let percentage = (parseFloat(decimal2) <= 0.00) ? decimal4 : decimal2

              return data.labels[tooltipItems.index].slice(0, 15) + ': ' + percentage + '%'
            }
          }
        }
      }
    }
  }
}
