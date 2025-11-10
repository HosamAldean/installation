/* eslint-disable @eslint-react/dom/no-missing-button-type */
import { ArrowUpDown, Edit, Plus, Trash } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '~/components/layout/Sidebar';
import { Button } from '~/components/ui/button/Button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '~/components/ui/dialog/Dialog';
import { useLanguage } from '~/context/LanguageContext';
import { apiRequest } from '~/utils/api';
import { toast } from 'sonner';

interface Employee {
    empNo: string | number;
    name_ar: string;
    job_Desc?: string;
    Work_status?: boolean | string;
}

interface Team {
    id: number;
    name: string;
    description?: string;
    members?: Employee[];
}

const EmployeeCardPage = () => {
    const { strings, language, toggleLanguage } = useLanguage();
    const isRTL = language === 'ar';

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<Set<string | number>>(new Set());
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamDesc, setNewTeamDesc] = useState('');
    const [removingMembers, setRemovingMembers] = useState<Set<string | number>>(new Set());

    const navigate = useNavigate();
    const toggleSidebar = () => setSidebarOpen((s) => !s);

    /** Load Employees */
    const loadEmployees = async () => {
        setLoading(true);
        try {
            const res = await apiRequest('/employees');
            if (res.success && Array.isArray(res.data)) {
                const teamMembers = new Set(
                    teams.flatMap((team) => team.members?.map((m) => m.empNo) || [])
                );
                const available = res.data.filter((emp: any) => !teamMembers.has(emp.empNo));
                setEmployees(
                    available.map((emp: any) => ({
                        empNo: emp.empNo,
                        name_ar: emp.name_ar,
                        job_Desc: emp.job_Desc || '—',
                        Work_status: emp.Work_status ?? false,
                    }))
                );
            } else {
                setError(res.message || strings.noEmployeeData);
            }
        } catch {
            setError(strings.fetchError);
        } finally {
            setLoading(false);
        }
    };

    /** Load Teams */
    const loadTeams = async () => {
        try {
            const res = await apiRequest('/teams');
            if (res.success && Array.isArray(res.data)) {
                const teamsData: Team[] = await Promise.all(
                    res.data.map(async (team: Team) => {
                        const membersRes = await apiRequest(`/teams/${team.id}/members`);
                        const members = membersRes.success
                            ? membersRes.data.map((m: any) => ({ ...m, job_Desc: m.job_Desc || '—' }))
                            : [];
                        return { ...team, members };
                    })
                );
                setTeams(teamsData);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Initial load
    useEffect(() => {
        const fetchData = async () => {
            await loadTeams();
        };
        fetchData();
    }, []);

    // Reload employees whenever teams change
    useEffect(() => {
        loadEmployees();
    }, [teams]);

    const filteredEmployees = useMemo(() => {
        const q = search.trim().toLowerCase();
        return employees.filter(
            (emp) =>
                emp.name_ar.toLowerCase().includes(q) ||
                (emp.job_Desc ?? '').toLowerCase().includes(q)
        );
    }, [employees, search]);

    const toggleEmployeeSelection = (empNo: string | number) => {
        setSelectedEmployees((prev) => {
            const copy = new Set(prev);
            copy.has(empNo) ? copy.delete(empNo) : copy.add(empNo);
            return copy;
        });
    };

    const openCreateDialog = () => {
        setEditingTeam(null);
        setNewTeamName('');
        setNewTeamDesc('');
        setSelectedEmployees(new Set());
        setIsDialogOpen(true);
    };

    const openEditDialog = (team: Team) => {
        setEditingTeam(team);
        setNewTeamName(team.name);
        setNewTeamDesc(team.description || '');
        setSelectedEmployees(new Set(team.members?.map((m) => m.empNo) || []));
        setIsDialogOpen(true);
    };

    const saveTeam = async () => {
        if (!newTeamName.trim()) {
            toast.error(strings.pleaseSelectEmployee);
            return;
        }

        try {
            let teamId = editingTeam?.id;
            if (editingTeam) {
                await apiRequest(`/teams/${teamId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newTeamName, description: newTeamDesc }),
                });
            } else {
                const teamRes = await apiRequest('/teams', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newTeamName, description: newTeamDesc }),
                });
                teamId = teamRes.teamId || teamRes.insertId;
            }

            if (teamId && selectedEmployees.size > 0) {
                await apiRequest(`/teams/${teamId}/members`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ empNos: Array.from(selectedEmployees) }),
                });
            }

            toast.success(editingTeam ? 'Team updated successfully' : 'Team created successfully');
            setIsDialogOpen(false);
            setEditingTeam(null);
            await loadTeams();
        } catch (err) {
            console.error(err);
            toast.error(strings.fetchError);
        }
    };

    const deleteTeam = async (teamId: number) => {
        if (!confirm('Are you sure you want to delete this team?')) return;
        try {
            await apiRequest(`/teams/${teamId}`, { method: 'DELETE' });
            toast.success('Team deleted successfully');
            await loadTeams();
        } catch (err) {
            console.error(err);
            toast.error(strings.fetchError);
        }
    };

    const removeMember = async (teamId: number, empNo: string | number) => {
        try {
            setRemovingMembers((prev) => new Set(prev).add(`${teamId}_${empNo}`));
            await apiRequest(`/teams/${teamId}/members/${empNo}`, { method: 'DELETE' });
            toast.success('Member removed successfully');
            await loadTeams();
            await loadEmployees();
        } catch (err) {
            console.error(err);
            toast.error(strings.fetchError);
        } finally {
            setRemovingMembers((prev) => {
                const updated = new Set(prev);
                updated.delete(`${teamId}_${empNo}`);
                return updated;
            });
        }
    };

    if (loading)
        return (
            <div className="p-8 min-h-screen flex justify-center items-center text-gray-600 dark:text-gray-300">
                {strings.loadingEmployeeData}
            </div>
        );

    if (error)
        return (
            <div className="p-8 min-h-screen flex flex-col gap-4 justify-center items-center text-red-600 dark:text-red-400">
                <div>{error}</div>
                <Button onClick={() => window.location.reload()}>{strings.trySelectingProject}</Button>
            </div>
        );

    return (
        <div className="min-h-screen bg-background text-text p-0" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="lg:flex">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onToggle={toggleSidebar} />
                <main
                    className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:mr-[280px]' : 'lg:mr-[64px]'
                        }`}
                >
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pt-4 gap-2">
                            <div className="flex items-center gap-2">
                                <button
                                    className="lg:hidden p-2 rounded-md hover:bg-fill transition"
                                    onClick={toggleSidebar}
                                    aria-label="Toggle sidebar"
                                >
                                    <i className="i-mingcute-menu-line w-6 h-6" />
                                </button>
                                <h1 className="text-2xl font-bold">{strings.employeeCard}</h1>
                            </div>

                            {/* Desktop buttons */}
                            <div className="hidden sm:flex gap-2 justify-end">
                                <Button onClick={openCreateDialog} className="gap-2">
                                    <Plus className="h-4 w-4" /> {strings.createTeamAssign}
                                </Button>
                                <Button
                                    onClick={toggleLanguage}
                                    className="px-3 py-1 rounded-md border border-border bg-fill hover:bg-fill-secondary transition"
                                >
                                    {strings.changeLang}
                                </Button>
                            </div>
                        </div>

                        {/* Floating button for mobile */}
                        <div className="sm:hidden fixed bottom-4 right-4 z-50">
                            <Button
                                onClick={openCreateDialog}
                                className="gap-2 shadow-lg rounded-full px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 transition flex items-center"
                            >
                                <Plus className="h-4 w-4" /> {strings.createTeamAssign}
                            </Button>
                        </div>

                        {/* Top Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-xl shadow flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{strings.totalAvailableEmployees}</p>
                                    <p className="text-2xl font-bold">{employees.length}</p>
                                </div>
                                <i className="i-mingcute-user-line text-4xl text-blue-500 dark:text-blue-400"></i>
                            </div>

                            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-xl shadow flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{strings.totalTeams}</p>
                                    <p className="text-2xl font-bold">{teams.length}</p>
                                </div>
                                <i className="i-mingcute-team-line text-4xl text-green-500 dark:text-green-400"></i>
                            </div>
                        </div>

                        {/* Teams Section */}
                        <section className="space-y-6">
                            {teams.map((team) => (
                                <div
                                    key={team.id}
                                    className="bg-material-thin dark:bg-zinc-800 shadow rounded-xl p-5 border dark:border-zinc-700 hover:shadow-lg transition"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold">{team.name}</h3>
                                            {team.description && (
                                                <p className="text-sm text-text-secondary">{team.description}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="secondary" size="sm" onClick={() => openEditDialog(team)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => deleteTeam(team.id)}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="border-t border-border pt-3 space-y-1">
                                        {team.members && team.members.length > 0 ? (
                                            team.members.map((m) => (
                                                <div
                                                    key={m.empNo}
                                                    className="flex justify-between items-center px-2 py-1 rounded-md hover:bg-fill-secondary transition"
                                                >
                                                    <span>{m.name_ar} ({m.job_Desc})</span>
                                                    <button
                                                        onClick={() => removeMember(team.id, m.empNo)}
                                                        disabled={removingMembers.has(`${team.id}_${m.empNo}`)}
                                                    >
                                                        <Trash className="h-4 w-4 text-red-600" />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-text-secondary">{strings.noRecords}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* Dialog for Add/Edit */}
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingTeam ? strings.edit : strings.createTeamAssign}</DialogTitle>
                                    <DialogDescription>{strings.teams}</DialogDescription>
                                </DialogHeader>

                                <div className="py-4 flex flex-col gap-3">
                                    <input
                                        type="text"
                                        placeholder={strings.teams}
                                        value={newTeamName}
                                        onChange={(e) => setNewTeamName(e.target.value)}
                                        className="border rounded-md p-2 text-right"
                                    />
                                    <input
                                        type="text"
                                        placeholder={strings.description}
                                        value={newTeamDesc}
                                        onChange={(e) => setNewTeamDesc(e.target.value)}
                                        className="border rounded-md p-2 text-right"
                                    />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={strings.trySelectingProject}
                                        className="border rounded-md p-2 text-right mb-2"
                                    />

                                    <div className="max-h-64 overflow-y-auto border rounded-md p-2">
                                        {filteredEmployees.map((emp) => (
                                            <label
                                                key={emp.empNo}
                                                className="flex items-center gap-2 mb-1 flex-row-reverse"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEmployees.has(emp.empNo)}
                                                    onChange={() => toggleEmployeeSelection(emp.empNo)}
                                                    className="accent-blue-600"
                                                />
                                                {emp.name_ar} ({emp.job_Desc})
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button onClick={saveTeam}>{strings.submit}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmployeeCardPage;
