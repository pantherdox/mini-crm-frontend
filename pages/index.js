import withAuth from "../utils/withAuth";
import Layout from "../components/Layout";
import Badge from "../components/Badge";
import useSWR from "swr";
import api from "../lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
const fetcher = (url) => api.get(url).then((r) => r.data);
function Dashboard() {
  const { data } = useSWR("/dashboard", fetcher);
  const { data: activity } = useSWR("/activity", fetcher);
  
  if (!data)
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  
  const chart = (data.leadsPerDay || []).map((d) => ({
    date: d._id,
    count: d.count,
  }));

  const leadStatusData = Object.entries(data.leadStatus || {}).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const COLORS = {
    'New': '#3B82F6',
    'In Progress': '#F59E0B', 
    'Closed Won': '#10B981',
    'Closed Lost': '#EF4444'
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-600">Total Customers</div>
          <div className="text-2xl font-bold">{data.totalCustomers}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-600">My Open Tasks</div>
          <div className="text-2xl font-bold">{data.myOpenTasks}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-600">Overdue Tasks</div>
          <div className="text-2xl font-bold text-red-600">{data.overdueTasks}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-600">Total Leads</div>
          <div className="text-2xl font-bold">
            {Object.values(data.leadStatus || {}).reduce((a, b) => a + b, 0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Status Breakdown */}
        <section className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-4">Lead Status Breakdown</h3>
          {leadStatusData.length > 0 ? (
            <div className="space-y-3">
              {leadStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[item.name] || '#6B7280' }}
                    ></div>
                    <span>{item.name}</span>
                  </div>
                  <Badge color={
                    item.name === 'New' ? 'blue' :
                    item.name === 'In Progress' ? 'yellow' :
                    item.name === 'Closed Won' ? 'green' : 'red'
                  }>
                    {item.value}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No leads data available</div>
          )}
        </section>

        {/* Recent Activity */}
        <section className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          {activity && activity.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activity.map((item, index) => (
                <div key={index} className="text-sm border-b border-gray-100 pb-2 last:border-b-0">
                  <div className="font-medium text-gray-800">{item.message}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    {new Date(item.createdAt).toLocaleString()} by {item.actor?.name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No recent activity</div>
          )}
        </section>
      </div>

      {/* Leads per day chart */}
      <section className="mt-6 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-4">Leads Created (Last 14 Days)</h3>
        {chart.length > 0 ? (
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={chart}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3182ce"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">No leads data for the last 14 days</div>
        )}
      </section>
    </Layout>
  );
}
export default withAuth(Dashboard);
