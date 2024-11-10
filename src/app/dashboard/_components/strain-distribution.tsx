'use client'

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Indica', value: 35 },
  { name: 'Sativa', value: 25 },
  { name: 'Hybrid', value: 40 },
]

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)']

export function StrainDistribution() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}