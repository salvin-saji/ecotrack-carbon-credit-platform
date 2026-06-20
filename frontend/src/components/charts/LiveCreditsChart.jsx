import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import { useESP32 } from "../../hooks/useESP32"

export default function LiveCreditsChart() {
  const { creditsGraphData, isLive } = useESP32()
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
                ` Credits: ${Number(ctx.parsed.y).toFixed(2)}`
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
            ticks:{
              color:         "#3a3a45",
              font:          { size: 9 },
              maxTicksLimit: 4
            },
            grid: { color: "rgba(255,255,255,0.03)" }
          }
        }
      }
    })

    console.log("[Chart] Credits chart initialized")

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current     = null
        initializedRef.current = false
      }
    }
  }, [])

  // Update data whenever creditsGraphData changes
  useEffect(() => {
    const chart = chartRef.current
    if (!chart)                  return
    if (!creditsGraphData.length)    return

    chart.data.labels            = creditsGraphData.map(d => d.time)
    chart.data.datasets[0].data = creditsGraphData.map(d => d.value)

    chart.update("none")
    console.log(`[Chart] Credits updated — ${creditsGraphData.length} points`)
  }, [creditsGraphData])

  return (
    <div style={{ position:"relative", height:"130px" }}>
      {!isLive && creditsGraphData.length === 0 && (
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
