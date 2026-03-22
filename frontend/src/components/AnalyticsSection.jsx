// src/components/AnalyticsSection.jsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'
import { TrendingUp, ShoppingBag, IndianRupee, Package } from 'lucide-react'

const COLORS = ['#F5C518', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#F97316']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl p-3 shadow-xl text-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {p.name === 'revenue' ? `₹${parseFloat(p.value).toFixed(0)}` : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsSection({ data }) {
  if (!data) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const statusColors = {
    PENDING: '#F5C518', ACCEPTED: '#3B82F6', PACKED: '#8B5CF6',
    SHIPPED: '#F97316', DELIVERED: '#10B981', CANCELLED: '#EF4444',
    RETURN_REQUESTED: '#F59E0B', RETURNED: '#DC2626',
  }

  const pieData = data.status_distribution.map(s => ({
    name: s.status,
    value: s.count,
    color: statusColors[s.status] || '#6B7280',
  }))

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="bg-blue-500/10 p-3 rounded-xl"><ShoppingBag size={22} className="text-blue-500" /></div>
          <div>
            <p className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{data.total_orders}</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Orders</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="bg-emerald-500/10 p-3 rounded-xl"><IndianRupee size={22} className="text-emerald-500" /></div>
          <div>
            <p className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>₹{parseFloat(data.total_spent || 0).toFixed(0)}</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Spent</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders per Month */}
        <div className="card p-5">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-yellow" /> Orders Per Month
          </h3>
          {data.monthly_data.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.monthly_data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" name="orders" fill="#F5C518" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Spending Trend */}
        <div className="card p-5">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <IndianRupee size={18} className="text-emerald-500" /> Revenue Trend
          </h3>
          {data.monthly_data.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.monthly_data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" name="revenue" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Order Status Pie */}
        <div className="card p-5">
          <h3 className="section-title mb-4">📊 Order Status Distribution</h3>
          {pieData.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  paddingAngle={3} dataKey="value" nameKey="name">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [val, name]} />
                <Legend formatter={(val) => <span style={{ color: 'var(--text-primary)', fontSize: 12 }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Products */}
        <div className="card p-5">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <Package size={18} className="text-purple-500" /> Top Products
          </h3>
          {data.top_products.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>No data yet</p>
          ) : (
            <div className="space-y-3">
              {data.top_products.map((p, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-lg font-extrabold w-6 text-center" style={{ color: idx === 0 ? '#F5C518' : idx === 1 ? '#9CA3AF' : idx === 2 ? '#F97316' : 'var(--text-secondary)' }}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                    <div className="w-full rounded-full h-1.5 mt-1" style={{ background: 'var(--border-color)' }}>
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${(p.qty / data.top_products[0].qty) * 100}%`,
                          background: COLORS[idx % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-bold shrink-0" style={{ color: 'var(--text-secondary)' }}>{p.qty} units</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
