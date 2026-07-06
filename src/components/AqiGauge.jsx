/**
 * AqiGauge — semicircular speedometer gauge for AQI display.
 *
 * Renders a thick colored arc from green (good) → deep red (severe) with a
 * needle pointing at the current AQI value. A centred air-quality
 * icon sits inside the gauge.
 */
export default function AqiGauge({ aqi = 0, maxAqi = 500 }) {
  // Gauge arc geometry
  const cx = 150
  const cy = 135
  const r = 100
  const strokeW = 26

  // Clamp the value
  const clampedAqi = Math.min(Math.max(aqi, 0), maxAqi)

  // Map AQI → angle (π = 0 AQI on left, 0 = maxAqi on right)
  const needleAngle = Math.PI - (clampedAqi / maxAqi) * Math.PI

  // Needle tip
  const needleLen = r - strokeW / 2 - 4
  const nx = cx + needleLen * Math.cos(needleAngle)
  const ny = cy - needleLen * Math.sin(needleAngle)

  // Arc segment definitions — each maps an AQI range to a color
  const segments = [
    { from: 0, to: 50, color: '#00b050' },
    { from: 50, to: 100, color: '#92d050' },
    { from: 100, to: 200, color: '#f0e600' },
    { from: 200, to: 300, color: '#ff9900' },
    { from: 300, to: 400, color: '#ff0000' },
    { from: 400, to: 500, color: '#7e0023' },
  ]

  function aqiToAngleRad(val) {
    return Math.PI - (val / maxAqi) * Math.PI
  }

  function arcPath(startVal, endVal) {
    const a1 = aqiToAngleRad(startVal)
    const a2 = aqiToAngleRad(endVal)
    const x1 = cx + r * Math.cos(a1)
    const y1 = cy - r * Math.sin(a1)
    const x2 = cx + r * Math.cos(a2)
    const y2 = cy - r * Math.sin(a2)
    const largeArc = Math.abs(a1 - a2) > Math.PI ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
  }

  // Tick labels
  const ticks = [0, 50, 100, 200, 300, 500]

  return (
    <svg className="aqi-gauge" viewBox="0 0 300 210" fill="none">
      {/* Colored arc segments */}
      {segments.map((seg) => (
        <path
          key={seg.from}
          d={arcPath(seg.from, seg.to)}
          stroke={seg.color}
          strokeWidth={strokeW}
          strokeLinecap="butt"
          fill="none"
        />
      ))}

      {/* Tick labels */}
      {ticks.map((tick) => {
        const a = aqiToAngleRad(tick)
        const labelR = r + strokeW / 2 + 14
        const lx = cx + labelR * Math.cos(a)
        const ly = cy - labelR * Math.sin(a)
        return (
          <text
            key={tick}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            className="aqi-gauge__tick"
          >
            {tick}
          </text>
        )
      })}

      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke="#141842"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Needle pivot */}
      <circle cx={cx} cy={cy} r="6" fill="#202452" />
      <circle cx={cx} cy={cy} r="2.8" fill="#fff" />

      <text
        x={cx}
        y={cy + 56}
        textAnchor="middle"
        className="aqi-gauge__label-sub"
      >
        0 - 500 Scale
      </text>
    </svg>
  )
}
