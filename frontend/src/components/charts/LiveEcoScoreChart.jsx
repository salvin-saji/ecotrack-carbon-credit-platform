import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import { useESP32 } from "../../hooks/useESP32"

export default function LiveEcoScoreChart() {
  const { ecoGraphData, isLive } = useESP32()
  const canvasRef    = useRef(null)
  const chartRef     = useRef(null)
  const initializedRef = useRef(false)

  // Initialize ONCE only
  useEffect(() => {
    if (initializedRef.current) return
    if (!canvasRef.current)    return

    initializedRef.current = true

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels:   [],
        datasets: [{
          data:            [],
          borderColor:     "rgba(34,197,94,0.85)",
          borderWidth:     1.5,
          fill:            true,
          backgroundColor: "rgba(34,197,94,0.06)",
          tension:         0.4,
          pointRadius:     0,
          pointHoverRadius:3,
        }]
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        animation:           false,
        plugins: {
          legend:  { display: false },
          tooltip: {
            backgroundColor: "#131316",
            borderColor:     "rgba(34,197,94,0.2)",
            borderWidth:     1,
            titleColor:      "#6b6b7a",
            bodyColor:       "#f1f1f3",
            padding:         10,
            callbacks: {
              label: ctx =>
                ` Score: ${Number(ctx.parsed.y).toFixed(0)}`
            }
          }
        },
        scales: {
          x: {
            display: true,
            ticks:   {
              color:         "#3a3a45",
              font:          { size: 9 },
              maxTicksLimit: 6,
              maxRotation:   0
            },
            grid: { color: "rgba(255,255,255,0.03)" }
          },
          y: {
            min:  0,
            max:  100,
            ticks:{
              color:         "#3a3a45",
              font:          { size: 9 },
              maxTicksLimit: 4,
              callback:      v => v + " pts"
            },
            grid: { color: "rgba(255,255,255,0.03)" }
          }
        }
      }
    })

    console.log("[Chart] Eco Score chart initialized")

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current     = null
        initializedRef.current = false
      }
    }
  }, [])

  // Update data whenever ecoGraphData changes
  useEffect(() => {
    const chart = chartRef.current
    if (!chart)                  return
    if (!ecoGraphData.length)    return

    chart.data.labels            = ecoGraphData.map(d => d.time)
    chart.data.datasets[0].data = ecoGraphData.map(d => d.value)

    chart.update("none")
    console.log(`[Chart] Eco Score updated — ${ecoGraphData.length} points`)
  }, [ecoGraphData])

  return (
    <div style={{ position:"relative", height:"130px" }}>
      {!isLive && ecoGraphData.length === 0 && (
        <div style={{
          position:"absolute", inset:0,
          display:"flex", alignItems:"center",
          justifyContent:"center",
          color:"#3a3a45", fontSize:"12px"
        }}>
          Waiting for ESP32...
        </div>
      )}
      <canvas ref={canvasRef} />
    </div>
  )
}
