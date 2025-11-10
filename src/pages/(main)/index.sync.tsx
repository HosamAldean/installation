/* eslint-disable @eslint-react/dom/no-missing-button-type */
//frontend/src/pages/(main)/index.sync.tsx
import { useEffect, useMemo, useState } from 'react'
import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { toast } from 'sonner'

import Sidebar from '~/components/layout/Sidebar'
import { Button } from '~/components/ui/button/Button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '~/components/ui/dialog/Dialog'
import { Divider } from '~/components/ui/divider/Divider'
import { SegmentTab } from '~/components/ui/segment-tab/SegmentTab'
import { Slider } from '~/components/ui/slider'
import { Switch } from '~/components/ui/switch'
import { useLanguage } from '~/context/LanguageContext'
import { apiRequest } from '~/utils/api'

// ✅ Moved out for better performance
const SummaryCard = ({ label, value, color }: { label: string; value: number | string; color?: string }) => (
    <div className="bg-material-thin dark:bg-zinc-800 shadow rounded-xl p-5 border dark:border-zinc-700 transition hover:shadow-lg">
        <div className="text-sm text-text-secondary">{label}</div>
        <div className={`text-2xl font-semibold mt-2 ${color ?? 'text-text'}`}>
            {typeof value === 'object' ? JSON.stringify(value) : value}
        </div>
    </div>
)

export const Component = () => {
    const { strings, language, toggleLanguage } = useLanguage()
    const isRTL = language === 'ar'

    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [data, setData] = useState({
        users: 0,
        teams: 0,
        avalaibleTeams: 0,
        bundingproject: 0,
        Units: 0,
        Stores: 0,
        Companies: 0,
        Projects: 0,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedTab, setSelectedTab] = useState<'overview' | 'stats' | 'settings'>('overview')
    const [enableSound, setEnableSound] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [metricValue, setMetricValue] = useState<number[]>([50])

    const toggleSidebar = () => setSidebarOpen((s) => !s)

    useEffect(() => {
        let mounted = true
        const load = async () => {
            setLoading(true)
            setError('')
            try {
                const res = await apiRequest('/stats')
                if (mounted) {
                    if (res.success && (res.stats || res.data)) {
                        const stats = res.stats ?? res.data ?? {}
                        setData({
    users: typeof stats.users === 'number' ? stats.users : 0,
    teams: typeof stats.teams === 'number' ? stats.teams : 0,
    avalaibleTeams: typeof stats.avalaibleTeams === 'number' ? stats.avalaibleTeams : 0,
    bundingproject: typeof stats.bundingproject === 'number' ? stats.bundingproject : 0,
    Units: typeof stats.units === 'number' ? stats.units : 0,
    Stores: typeof stats.stores === 'number' ? stats.stores : 0,
    Companies: typeof stats.Companies === 'number' ? stats.Companies : 0,
    Projects: typeof stats.projects === 'number' ? stats.projects : 0,
})
                    } else {
                        setError(res.error || strings.fetchError)
                    }
                }
            } catch (err: any) {
                if (mounted)
                    setError(strings.fetchError + (err?.message ? `: ${err.message}` : ''))
            } finally {
                if (mounted) setLoading(false)
            }
        }
        load()
        return () => {
            mounted = false
        }
    }, [strings])

    const summaryItems = useMemo(
    () => [
        { label: strings.users, value: data.users, color: 'text-blue-600 dark:text-blue-400' },
        { label: strings.teams, value: data.teams, color: 'text-green-600 dark:text-green-400' }, // total teams
        { label: strings.avalaibleTeams, value: data.avalaibleTeams, color: 'text-yellow-600 dark:text-yellow-400' }, // available teams
        { label: strings.bundingproject, value: data.bundingproject, color: 'text-red-600 dark:text-red-400' },
     //   { label: strings.Units, value: data.Units, color: 'text-purple-600 dark:text-purple-400' },
      //  { label: strings.Stores, value: data.Stores, color: 'text-cyan-600 dark:text-cyan-400' },
     //   { label: strings.Companies, value: data.Companies, color: 'text-indigo-600 dark:text-indigo-400' },
        { label: strings.Projects, value: data.Projects, color: 'text-pink-600 dark:text-pink-400' },
    ],
    [data, strings]
)


    const tabItems: { value: 'overview' | 'stats' | 'settings'; label: string }[] = [
        { value: 'overview', label: 'Overview' },
        { value: 'stats', label: 'Stats' },
        { value: 'settings', label: 'Settings' },
    ]

    const lineData = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => ({
            name: `Month ${i + 1}`,
            users: Math.floor(Math.random() * 500 + 100),
            items: Math.floor(Math.random() * 300 + 50),
        }))
    }, [data])

    if (loading) {
        return (
            <div
                className="p-8 min-h-screen flex justify-center items-center text-gray-600 dark:text-gray-300"
                role="status"
            >
                {strings.loading}...
            </div>
        )
    }

    if (error) {
        return (
            <div
                className="p-8 min-h-screen flex flex-col gap-4 justify-center items-center text-red-600 dark:text-red-400"
                role="alert"
            >
                <div>{error}</div>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-text p-0">
            {/* Sidebar always present, fixed to left/right */}
            <div className="lg:flex">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onToggle={toggleSidebar} />

                {/* Content */}
                <main
                    className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-[64px]'
                        }`}
                >
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* ✅ Header with hamburger on mobile */}
                        <div className="flex items-center justify-between mb-6 pt-4">
                            <div className="flex items-center gap-2">
                                {/* Hamburger for mobile only */}
                                <button
                                    className="lg:hidden p-2 rounded-md hover:bg-fill transition"
                                    onClick={toggleSidebar}
                                    aria-label="Toggle sidebar"
                                >
                                    <i className="i-mingcute-menu-line w-6 h-6" />
                                </button>
                                <h1 className="text-2xl font-bold">{strings.dashboardOverview}</h1>
                            </div>

                            <Button
                                onClick={toggleLanguage}
                                className="px-3 py-1 rounded-md border border-border bg-fill hover:bg-fill-secondary transition"
                            >
                                {strings.changeLang}
                            </Button>
                        </div>

                        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                            {summaryItems.map((item) => (
                                <SummaryCard key={item.label} {...item} />
                            ))}
                        </section>

                        <section className="bg-material-thin dark:bg-zinc-800 p-6 rounded-xl border dark:border-zinc-700 mb-12">
                            <SegmentTab items={tabItems} value={selectedTab} onChange={setSelectedTab} />
                            <Divider className="my-6" />

                            {selectedTab === 'overview' && (
                                <div className="space-y-4">
                                    <p className="text-text-secondary">Overview metrics slider:</p>
                                    <Slider min={0} max={100} value={metricValue} onValueChange={setMetricValue} />
                                    <p className="text-text">Current Value: {metricValue[0]}</p>
                                </div>
                            )}

                            {selectedTab === 'stats' && (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={lineData}>
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                                        <Line type="monotone" dataKey="items" stroke="#82ca9d" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}

                            {selectedTab === 'settings' && (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-text">Enable Sound</p>
                                        <p className="text-text-secondary text-sm">Play sound effects</p>
                                    </div>
                                    <Switch checked={enableSound} onCheckedChange={setEnableSound} />
                                </div>
                            )}
                        </section>

                        <section className="mb-12">
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="secondary">Open Dialog</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Example Dialog</DialogTitle>
                                        <DialogDescription>
                                            This dialog supports dark mode and smooth transitions
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4 text-text-secondary">This is a sample dialog.</div>
                                    <DialogFooter>
                                        <Button variant="primary" onClick={() => toast.success('Confirmed!')}>
                                            Confirm
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Component
