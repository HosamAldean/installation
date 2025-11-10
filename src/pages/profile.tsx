// src/pages/Profile.tsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button/Button';
import { Input } from '~/components/ui/input/Input';
import { Label } from '~/components/ui/label/Label';
import { useLanguage } from '~/context/LanguageContext';
import AvatarUpload from '~/components/profile/AvatarUpload';

interface UserInfo {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    role?: string;
}

interface FormFieldProps {
    id: string;
    label: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

const FormField = ({ id, label, value, onChange, disabled }: FormFieldProps) => (
    <div className="mb-4">
        <Label htmlFor={id}>{label}</Label>
        <Input id={id} value={value} onChange={onChange} disabled={disabled} />
    </div>
);

const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Profile = () => {
    const { strings } = useLanguage();
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const token = localStorage.getItem('accessToken');

    if (!token) {
        toast.error('Please login first');
        return <Navigate to="/login" replace />;
    }

    useEffect(() => {
        const fetchUser = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${SERVER_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);

                const data = await res.json();
                const currentUser: UserInfo = {
                    id: data.userId ?? data.id,
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    email: data.email || '',
                    avatarUrl: data.avatarUrl || '',
                    role: data.role || '',
                };

                setUser(currentUser);
                localStorage.setItem('user', JSON.stringify(currentUser));
            } catch (err: any) {
                console.error(err);
                toast.error('Failed to fetch profile: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [token]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);

        try {
            const res = await fetch(`${SERVER_URL}/api/users/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    avatarUrl: user.avatarUrl, // already set by AvatarUpload
                }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Profile updated successfully!');
                const updatedUser: UserInfo = {
                    ...user,
                    firstName: data.user?.firstName ?? user.firstName,
                    lastName: data.user?.lastName ?? user.lastName,
                    email: data.user?.email ?? user.email,
                    avatarUrl: data.user?.avatarUrl ?? user.avatarUrl,
                };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (err: any) {
            console.error(err);
            toast.error(`Error saving profile: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-300">
                {strings.loading}...
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-red-600">
                {strings.fetchError || 'User not found'}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-text p-8">
            <div className="max-w-3xl mx-auto bg-material-thin dark:bg-zinc-800 shadow-lg rounded-2xl p-8 border dark:border-zinc-700">
                <h1 className="text-3xl font-semibold mb-6">{strings.profile || 'Profile'}</h1>

                {/* Avatar */}
                <div className="flex flex-col items-center mb-6">
                    <AvatarUpload
                        initial={user.avatarUrl?.startsWith('http') ? user.avatarUrl : `${SERVER_URL}${user.avatarUrl}`}
                        accessToken={token ?? undefined}
                        onSaved={(newAvatarUrl) => {
                            setUser((prev) => prev ? { ...prev, avatarUrl: newAvatarUrl } : prev);
                            localStorage.setItem('user', JSON.stringify({ ...user, avatarUrl: newAvatarUrl }));
                        }}
                    />
                </div>

                {/* Form Fields */}
                <FormField
                    id="firstName"
                    label={strings.firstName || 'First Name'}
                    value={user.firstName ?? ''}
                    onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                />
                <FormField
                    id="lastName"
                    label={strings.lastName || 'Last Name'}
                    value={user.lastName ?? ''}
                    onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                />
                <FormField
                    id="email"
                    label={strings.email || 'Email'}
                    value={user.email ?? ''}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
                <FormField
                    id="role"
                    label={strings.role || 'Role'}
                    value={user.role ?? ''}
                    disabled
                />

                {/* Buttons */}
                <div className="flex gap-3 mt-4">
                    <Button type="button" onClick={handleSave} isLoading={saving}>
                        {strings.submit || 'Save'}
                    </Button>
                    <Button variant="ghost" onClick={() => window.history.back()}>
                        {strings.cancel || 'Cancel'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
