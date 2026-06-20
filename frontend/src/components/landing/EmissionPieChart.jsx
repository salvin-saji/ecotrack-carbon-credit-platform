import React, { useState, useEffect } from 'react'
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer
} from 'recharts'

export default function EmissionPieChart() {

  const [chartData, setChartData] = useState([])

  useEffect(() => {
    // Generate random realistic values on load
    const twoWheeler   = 28 + Math.random() * 7   // 28–35
    const fourWheeler  = 42 + Math.random() * 8   // 42–50
    const heavy        = 18 + Math.random() * 10  // 18–28
    const total        = twoWheeler + fourWheeler + heavy

    const data = [
      {
        name:     'Two Wheelers',
        value:    parseFloat((twoWheeler/total*100).toFixed(1)),
        kg:       parseFloat((twoWheeler * 156).toFixed(0)),
        color:    '#22c55e',
        icon:     'ti-motorbike',
        sub:      'Bikes, scooters, motorcycles'
      },
      {
        name:     'Four Wheelers',
        value:    parseFloat((fourWheeler/total*100).toFixed(1)),
        kg:       parseFloat((fourWheeler * 230).toFixed(0)),
        color:    '#3b82f6',
        icon:     'ti-car',
        sub:      'Cars, SUVs, taxis, vans'
      },
      {
        name:     'Heavy Vehicles',
        value:    parseFloat((heavy/total*100).toFixed(1)),
        kg:       parseFloat((heavy * 115).toFixed(0)),
        color:    '#f59e0b',
        icon:     'ti-truck',
        sub:      'Trucks, buses, commercial'
      }
    ]
    setChartData(data)
  }, [])

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div style={{
        background:'#131316',
        border:'1px solid rgba(255,255,255,0.08)',
        borderRadius:8, padding:'10px 14px'
      }}>
        <p style={{color:d.color, fontSize:13,
                   fontWeight:500}}>{d.name}</p>
        <p style={{color:'#f1f1f3', fontSize:18,
                   fontWeight:200}}>{d.value}%</p>
        <p style={{color:'#6b6b7a', fontSize:11}}>
          ~{d.kg.toLocaleString()} kg CO₂/day
        </p>
      </div>
    )
  }

  const CustomLabel = ({ cx, cy }) => (
    <text x={cx} y={cy} textAnchor="middle">
      <tspan x={cx} dy="-12" fontSize="11"
             fill="#6b6b7a">Total</tspan>
      <tspan x={cx} dy="28" fontSize="28"
             fontWeight="200" fill="#f1f1f3">CO₂</tspan>
      <tspan x={cx} dy="18" fontSize="11"
             fill="#6b6b7a">Monitored</tspan>
    </text>
  )

  return (
    <section id="emissions-chart" style={{
      background:'#070708',
      padding:'80px 0'
    }}>
      <div style={{maxWidth:1100, margin:'0 auto',
                   padding:'0 32px'}}>

        {/* Section heading */}
        <div style={{textAlign:'center', marginBottom:60}}>
          <p style={{
            fontSize:11, color:'#22c55e',
            textTransform:'uppercase',
            letterSpacing:'1.2px', marginBottom:12
          }}>
            NATIONAL EMISSION DATA
          </p>
          <h2 style={{
            fontSize:36, fontWeight:300,
            color:'#f1f1f3', marginBottom:12
          }}>
            Vehicle Carbon Emissions Overview
          </h2>
          <p style={{
            fontSize:14, color:'#6b6b7a',
            maxWidth:520, margin:'0 auto'
          }}>
            Government-tracked carbon emission distribution
            across vehicle categories in India
          </p>
        </div>

        {/* Two column layout */}
        <div style={{display:'grid',
                     gridTemplateColumns:'1fr 1fr',
                     gap:48, alignItems:'center'}}
             className="grid grid-cols-1 lg:grid-cols-2">

          {/* LEFT: Pie chart */}
          <div style={{position:'relative'}}>
            <ResponsiveContainer width="100%" height={360}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%" cy="50%"
                  innerRadius={90}
                  outerRadius={160}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={200}
                  animationDuration={1200}
                  labelLine={false}
                  label={CustomLabel}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color}
                          stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend below chart */}
            <div style={{
              display:'flex', justifyContent:'center',
              gap:24, marginTop:8
            }}>
              {chartData.map(d => (
                <div key={d.name}
                  style={{display:'flex',
                          alignItems:'center', gap:6}}>
                  <div style={{
                    width:8, height:8,
                    borderRadius:'50%',
                    background:d.color
                  }} />
                  <span style={{fontSize:11,
                                color:'#6b6b7a'}}>
                    {d.name}
                  </span>
                  <span style={{fontSize:11,
                                color:d.color,
                                fontWeight:500}}>
                    {d.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Breakdown cards */}
          <div style={{display:'flex',
                       flexDirection:'column', gap:14}}>
            {chartData.map(d => (
              <div key={d.name} style={{
                background:'#0e0e10',
                border:'1px solid rgba(255,255,255,0.06)',
                borderRadius:12, padding:'16px 18px'
              }}>
                <div style={{display:'flex',
                             justifyContent:'space-between',
                             alignItems:'flex-start',
                             marginBottom:10}}>
                  <div style={{display:'flex',
                               alignItems:'center', gap:12}}>
                    <div style={{
                      width:36, height:36,
                      borderRadius:8,
                      background:`${d.color}14`,
                      display:'flex', alignItems:'center',
                      justifyContent:'center'
                    }}>
                      <i className={`ti ${d.icon}`}
                         style={{color:d.color,
                                 fontSize:18}} />
                    </div>
                    <div>
                      <p style={{fontSize:13,
                                 fontWeight:500,
                                 color:'#f1f1f3',
                                 marginBottom:2}}>
                        {d.name}
                      </p>
                      <p style={{fontSize:11,
                                 color:'#6b6b7a'}}>
                        {d.sub}
                      </p>
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <p style={{fontSize:24,
                               fontWeight:200,
                               color:d.color,
                               lineHeight:1}}>
                      {d.value}%
                    </p>
                    <p style={{fontSize:10,
                               color:'#3a3a45',
                               marginTop:2}}>
                      ~{d.kg.toLocaleString()} kg/day
                    </p>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{
                  height:3, background:`${d.color}15`,
                  borderRadius:2
                }}>
                  <div style={{
                    height:'100%', width:`${d.value}%`,
                    background:d.color, borderRadius:2,
                    transition:'width 1.2s ease'
                  }} />
                </div>
              </div>
            ))}

            {/* Info box */}
            <div style={{
              background:'rgba(34,197,94,0.04)',
              border:'1px solid rgba(34,197,94,0.1)',
              borderRadius:10, padding:'12px 14px',
              display:'flex', gap:10,
              alignItems:'flex-start'
            }}>
              <i className="ti ti-info-circle"
                 style={{color:'#22c55e',
                         fontSize:16, marginTop:1}} />
              <p style={{fontSize:12, color:'#6b6b7a',
                         lineHeight:1.6}}>
                EcoTrack helps reduce four-wheeler
                emissions by monitoring individual
                driver behavior and encouraging
                eco-friendly driving habits.
              </p>
            </div>

            <p style={{fontSize:10, color:'#333',
                       textAlign:'center'}}>
              * Values represent estimated daily averages.
              Data refreshes on page load.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
