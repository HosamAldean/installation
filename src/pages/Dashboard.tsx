/* eslint-disable react-hooks/set-state-in-effect */
// src/pages/Dashboard.tsx
import { motion } from 'framer-motion'
import * as React from 'react'
import { useEffect,useState } from 'react'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import Sidebar from '~/components/layout/Sidebar'
import { Button } from '~/components/ui/button/Button'
import { Slider } from '~/components/ui/slider'
import { useTheme } from '~/hooks/useTheme'

const initialLineData = [
    { name: 'Jan', users: 400 },
    { name: 'Feb', users: 300 },
    { name: 'Mar', users: 500 },
    { name: 'Apr', users: 700 },
    { name: 'May', users: 600 },
]

const initialBarData = [
    { name: 'Product A', sales: 2400 },
    { name: 'Product B', sales: 1398 },
    { name: 'Product C', sales: 9800 },
    { name: 'Product D', sales: 3908 },
    { name: 'Product E', sales: 4800 },
]

const Dashboard: React.FC = () => {
    const { theme } = useTheme()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // State for sliders controlling live stats
    const [sliderUsers, setSliderUsers] = useState(50)
    const [sliderSales, setSliderSales] = useState(5000)

    // Dynamic chart data based on sliders
    const [lineData, setLineData] = useState(initialLineData)
    const [barData, setBarData] = useState(initialBarData)

    useEffect(() => {
        // Update line chart dynamically based on sliderUsers
        setLineData((prev) =>
            prev.map((item, _idx) => ({ ...item, users: item.users + sliderUsers / 5 }))
        )
    }, [sliderUsers])

    useEffect(() => {
        // Update bar chart dynamically based on sliderSales
        setBarData((prev) =>
            prev.map((item) => ({ ...item, sales: item.sales + sliderSales / 10 }))
        )
    }, [sliderSales])

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-zinc-900">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onToggle={() => setSidebarOpen((prev) => !prev)}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-auto">
                <header className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
                    <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSidebarOpen((prev) => !prev)}
                        className="lg:hidden"
                    >
                        Toggle Sidebar
                    </Button>
                </header>

                <main className="p-4 space-y-6">
                    {/* Live Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <motion.div
                            key={sliderUsers}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow"
                        >
                            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-300">Active Users</h2>
                            <motion.p
                                className="text-xl font-semibold text-zinc-900 dark:text-zinc-100"
                                animate={{ scale: [1, 1.1, 1] }}
                            >
                                {Math.round(1000 + sliderUsers * 10)}
                            </motion.p>
                            <Slider
                                value={[sliderUsers]}
                                onValueChange={(val) => setSliderUsers(val[0])}
                                max={100}
                            />
                        </motion.div>

                        <motion.div
                            key={sliderSales}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow"
                        >
                            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-300">Sales</h2>
                            <motion.p
                                className="text-xl font-semibold text-zinc-900 dark:text-zinc-100"
                                animate={{ scale: [1, 1.05, 1] }}
                            >
                                ${Math.round(sliderSales * 10)}
                            </motion.p>
                            <Slider
                                value={[sliderSales]}
                                onValueChange={(val) => setSliderSales(val[0])}
                                max={10000}
                            />
                        </motion.div>

                        {/* Static Cards */}
                        <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow">
                            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-300">Revenue</h2>
                            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">$12,345</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow">
                            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-300">Feedbacks</h2>
                            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">128</p>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Line Chart */}
                        <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow">
                            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-300 mb-2">Monthly Users</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={lineData}>
                                    <XAxis dataKey="name" stroke={theme === 'dark' ? '#F0F0F0' : '#333'} />
                                    <YAxis stroke={theme === 'dark' ? '#F0F0F0' : '#333'} />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="users"
                                        stroke="#4F46E5"
                                        strokeWidth={2}
                                        isAnimationActive={true}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#444' : '#ddd'} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Bar Chart */}
                        <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow">
                            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-300 mb-2">Product Sales</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={barData}>
                                    <XAxis dataKey="name" stroke={theme === 'dark' ? '#F0F0F0' : '#333'} />
                                    <YAxis stroke={theme === 'dark' ? '#F0F0F0' : '#333'} />
                                    <Tooltip />
                                    <Bar dataKey="sales" fill="#4F46E5" isAnimationActive />
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#444' : '#ddd'} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Dashboard
