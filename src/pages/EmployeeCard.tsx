//frontend/src/pages/EmployeeCard.tsx
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { apiRequest } from '~/utils/api';

interface Employee {
    empNo: string | number;
    name_en: string;
    name_ar: string;
    perHour?: number;
    Job_code: string | number;
    WPlaceDesc?: string;
    Work_status: boolean;
    Work_place: string | number;
}

const EmployeeCard: React.FC = () => {
    const { empNo } = useParams<{ empNo: string }>();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEmployee = async () => {
            setLoading(true);
            setError(null);

            try {
                if (!empNo) throw new Error('Employee ID not provided');
                const res = await apiRequest(`/employees/${empNo}`);
                if (res.success && res.data) {
                    setEmployee({
                        ...res.data,
                        perHour: res.data.perHour ?? 0,
                    });
                } else {
                    setError(res.message || 'Employee not found.');
                }
            } catch {
                setError('Network error');
            } finally {
                setLoading(false);
            }
        };

        fetchEmployee();
    }, [empNo]);

    if (loading) return <p className="p-4">Loading employee data...</p>;
    if (error) return <p className="p-4 text-red-500">{error}</p>;
    if (!employee) return <p className="p-4">No data found.</p>;

    return (
        <div className="p-6 space-y-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-semibold mb-4">Employee Card</h1>
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="space-y-1">
                    <p><strong>Name (EN):</strong> {employee.name_en}</p>
                    <p><strong>Name (AR):</strong> {employee.name_ar}</p>
                    <p><strong>Employee No:</strong> {employee.empNo}</p>
                    <p><strong>Hourly Rate:</strong> {employee.perHour?.toFixed(2)}</p>
                    <p><strong>Job Code:</strong> {employee.Job_code}</p>
                    <p><strong>Work Place:</strong> {employee.WPlaceDesc || employee.Work_place}</p>
                    <p><strong>Status:</strong> {employee.Work_status ? 'Active' : 'Inactive'}</p>
                </div>
            </div>
        </div>
    );
};

export default EmployeeCard;
