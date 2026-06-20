import React, { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { api } from '../../services/api'

export default function EmissionHistoryGraph({ days = 30 }) {

  const [data, setData]     = useState([])
  const [loading, setLoading] = useState(true)
  const [range, setRange]   = useState(days)

  useEffect(() => {
    setLoading(true)
    api.getEmissionGraph(range).then(d => {
      // Format for chart
      const formatted = d.map(point => ({
        date:    point.date.slice(5),   // "MM-DD"
        co2_kg:  parseFloat(
          (point.total_co2_g / 1000).toFixed(2)),  // g → kg
        avg:     parseFloat(
          (point.avg_co2_per_trip || 0).toFixed(3)),
        trips:   point.point_count
      }))
      setData(formatted)
      setLoading(false)
    })
  }, [range])

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{
        background: '#131316',
        border: '1px solid rgba(34,197,94,0.2)',
        borderRadius: 8, padding: '10px 14px'
      }}>
        <p style={{color:'#6b6b7a', fontSize:11,
                   marginBottom:6}}>{label}</p>
        <p style={{color:'#ef4444', fontSize:13,
                   fontWeight:500}}>
          {payload[0]?.value} kg CO₂
        </p>
        <p style={{color:'#6b6b7a', fontSize:11}}>
          {payload[0]?.payload?.trips} readings
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: '#0e0e10',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14, padding: '20px 22px'
    }}>
      {/* Header */}
      <div style={{display:'flex',
                   justifyContent:'space-between',
                   alignItems:'center',
                   marginBottom:20}}>
        <div>
          <p style={{fontSize:11, color:'#6b6b7a',
                     textTransform:'uppercase',
                     letterSpacing:'0.8px',
                     marginBottom:4}}>
            CARBON EMISSION HISTORY
          </p>
          <p style={{fontSize:16, fontWeight:500,
                     color:'#f1f1f3'}}>
            CO₂ Emitted Over Time
          </p>
        </div>
        {/* Range selector */}
        <div style={{display:'flex', gap:6}}>
          {[7, 14, 30].map(d => (
            <button key={d} onClick={() => setRange(d)}
              style={{
                padding: '5px 12px',
                borderRadius: 6, fontSize: 11,
                border: range === d
                  ? '1px solid rgba(34,197,94,0.4)'
                  : '1px solid rgba(255,255,255,0.06)',
                background: range === d
                  ? 'rgba(34,197,94,0.08)' : '#131316',
                color: range === d ? '#22c55e' : '#6b6b7a',
                cursor: 'pointer'
              }}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div style={{height:200, display:'flex',
                     alignItems:'center',
                     justifyContent:'center',
                     color:'#333', fontSize:13}}>
          Loading emission data...
        </div>
      ) : data.every(d => d.co2_kg === 0) ? (
        <div style={{height:200, display:'flex',
                     alignItems:'center',
                     justifyContent:'center',
                     color:'#333', fontSize:13}}>
          No emission data yet.
          Connect ESP32 to start recording.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}
            margin={{top:5, right:10, left:0, bottom:0}}>
            <defs>
              <linearGradient id="co2Gradient"
                x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"
                  stopColor="#ef4444" stopOpacity={0.2}/>
                <stop offset="95%"
                  stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="date"
              tick={{fill:'#3a3a45', fontSize:10}}
              axisLine={false} tickLine={false}
              interval="preserveStartEnd" />
            <YAxis
              tick={{fill:'#3a3a45', fontSize:10}}
              axisLine={false} tickLine={false}
              tickFormatter={v => `${v}kg`} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={5} stroke="rgba(245,158,11,0.3)"
              strokeDasharray="4 4"
              label={{value:'Avg', fill:'#f59e0b',
                      fontSize:10}} />
            <Area
              type="monotone" dataKey="co2_kg"
              stroke="rgba(239,68,68,0.8)"
              strokeWidth={1.5}
              fill="url(#co2Gradient)"
              animationDuration={600} />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Summary row below chart */}
      <div style={{
        display:'grid', gridTemplateColumns:'1fr 1fr 1fr',
        gap:12, marginTop:16
      }}>
        {[
          {
            label: 'Total CO₂ (period)',
            value: data.reduce((s,d)=>s+d.co2_kg,0)
                       .toFixed(2) + ' kg',
            color: '#ef4444'
          },
          {
            label: 'Peak Day',
            value: data.length
              ? data.reduce((a,b)=>
                  a.co2_kg>b.co2_kg?a:b).date
              : '—',
            color: '#f59e0b'
          },
          {
            label: 'Days Recorded',
            value: data.filter(d=>d.co2_kg>0).length
                       + ' / ' + range,
            color: '#22c55e'
          }
        ].map(item => (
          <div key={item.label} style={{
            background:'#131316',
            border:'1px solid rgba(255,255,255,0.04)',
            borderRadius:8, padding:'10px 12px'
          }}>
            <p style={{fontSize:10, color:'#3a3a45',
                       textTransform:'uppercase',
                       letterSpacing:'0.8px',
                       marginBottom:4}}>
              {item.label}
            </p>
            <p style={{fontSize:15, fontWeight:500,
                       color:item.color}}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
