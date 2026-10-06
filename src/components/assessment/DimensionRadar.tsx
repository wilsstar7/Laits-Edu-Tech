import type { DimensionResult } from '@/types/assessment'

interface DimensionRadarProps {
  dimensions: DimensionResult[]
  size?: number
}

export function DimensionRadar({ dimensions, size = 360 }: DimensionRadarProps) {
  if (!dimensions || dimensions.length < 3) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-[#676A78]">
        Membutuhkan minimal 3 dimensi untuk diagram radar.
      </div>
    )
  }

  const center = size / 2
  const radius = (size / 2) - 50
  const total = dimensions.length
  const angleStep = (Math.PI * 2) / total

  // Levels for concentric background polygons
  const levels = [0.25, 0.5, 0.75, 1.0]

  // Calculate polygon coordinates for a given radius ratio
  const getPolygonPoints = (ratio: number) => {
    return dimensions
      .map((_, i) => {
        const angle = i * angleStep - Math.PI / 2
        const x = center + radius * ratio * Math.cos(angle)
        const y = center + radius * ratio * Math.sin(angle)
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }

  // Calculate coordinates for the actual normalized scores
  const dataPoints = dimensions.map((dim, i) => {
    const angle = i * angleStep - Math.PI / 2
    const ratio = Math.max(0, Math.min(dim.normalized_score / 100, 1))
    const x = center + radius * ratio * Math.cos(angle)
    const y = center + radius * ratio * Math.sin(angle)

    // Label position slightly outside the outer radius
    const labelRadius = radius + 28
    const labelX = center + labelRadius * Math.cos(angle)
    const labelY = center + labelRadius * Math.sin(angle)

    return {
      x,
      y,
      labelX,
      labelY,
      dim,
      score: dim.normalized_score,
      name: dim.dimension?.name || 'Dimensi',
    }
  })

  const dataPolygonPoints = dataPoints
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')

  return (
    <div className="w-full flex flex-col items-center justify-center py-4">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible select-none max-w-full h-auto"
        role="img"
        aria-label="Diagram radar profil dimensi belajar"
      >
        <title>Diagram Radar Dimensi Belajar</title>

        {/* Concentric reference grid polygons */}
        {levels.map((level) => (
          <polygon
            key={level}
            points={getPolygonPoints(level)}
            fill="none"
            stroke="#EAEBF0"
            strokeWidth="1"
            strokeDasharray={level === 1.0 ? 'none' : '3,3'}
          />
        ))}

        {/* Axis lines from center to each vertex */}
        {dimensions.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2
          const x = center + radius * Math.cos(angle)
          const y = center + radius * Math.sin(angle)

          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#EAEBF0"
              strokeWidth="1"
            />
          )
        })}

        {/* Shaded data polygon */}
        <polygon
          points={dataPolygonPoints}
          fill="#6C5CE7"
          fillOpacity="0.20"
          stroke="#6C5CE7"
          strokeWidth="2.5"
          className="transition-all duration-500 ease-out"
        />

        {/* Data points & labels */}
        {dataPoints.map((pt, i) => (
          <g key={i}>
            {/* Center vertex point */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r="4.5"
              fill="#FFFFFF"
              stroke="#6C5CE7"
              strokeWidth="2"
            />

            {/* Dimension label text */}
            <text
              x={pt.labelX}
              y={pt.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[11px] font-bold fill-[#17181C]"
            >
              {pt.name}
            </text>

            {/* Score label text below name */}
            <text
              x={pt.labelX}
              y={pt.labelY + 13}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] font-mono font-extrabold fill-[#6C5CE7]"
            >
              {Math.round(pt.score)}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
