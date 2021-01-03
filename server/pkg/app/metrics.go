package app

import "github.com/prometheus/client_golang/prometheus"

const Namespace = "bfon"
const Subsystem = "backend"

var metricTotalConns = prometheus.NewCounter(
	prometheus.CounterOpts{
		Namespace: Namespace,
		Subsystem: Subsystem,
		Name:      "connections_total",
		Help:      "Cumulative number of connections",
	})

var metricTotalCommands = prometheus.NewCounterVec(
	prometheus.CounterOpts{
		Namespace: Namespace,
		Subsystem: Subsystem,
		Name:      "commands_total",
		Help:      "Cumulative number of commands processed",
	}, []string{"command_kind"})

func (a *App) RegisterMetrics() {
	prometheus.MustRegister(metricTotalConns)
	prometheus.MustRegister(metricTotalCommands)

	prometheus.MustRegister(
		prometheus.NewGaugeFunc(prometheus.GaugeOpts{
			Namespace: Namespace,
			Subsystem: Subsystem,
			Name:      "command_queue_len",
			Help:      "Length of the command queue",
		}, func() float64 {
			return float64(len(a.cmds))
		}))

	prometheus.MustRegister(
		prometheus.NewGaugeFunc(prometheus.GaugeOpts{
			Namespace: Namespace,
			Subsystem: Subsystem,
			Name:      "num_connections",
			Help:      "Number of open websocket connections",
		}, func() float64 {
			return float64(len(a.conns))
		}))

}
