// src/components/layout/Sidebar.tsx
import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '~/components/ui/button/Button';
import { useLanguage } from '~/context/LanguageContext';
import { ProfileDropdown } from '~/components/profile/ProfileDropdown';
import FocusTrap from 'focus-trap-react';
import { m, AnimatePresence } from 'framer-motion';
import useTheme from '~/hooks/useTheme';
import Tooltip from '~/components/ui/Tooltip';

type UserInfo = {
    id?: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
    avatarUrl?: string;
};

const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/** ✅ Unified avatar logic */
const getAvatarUrl = (user?: UserInfo | null) => {
    const url = user?.avatarUrl || user?.avatar;
    if (!url) return '/default-avatar.png';
    if (url.startsWith('http')) return url;
    return `${SERVER_URL}/${url.replace(/^\/+/, '')}`;
};

type Props = {
    isOpen?: boolean;
    onClose?: () => void;
    onToggle?: () => void;
};

export const Sidebar: React.FC<Props> = ({
    isOpen = false,
    onClose = () => { },
    onToggle = () => { },
}) => {
    const { strings, language, toggleLanguage } = useLanguage();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserInfo | null>(() => {
        try {
            const raw = localStorage.getItem('user');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    const displayName = user?.firstName || user?.username || 'Guest';
    const panelRef = useRef<HTMLDivElement | null>(null);
    const { theme, toggleTheme } = useTheme();

    const [isMobile, setIsMobile] = useState<boolean>(
        typeof window !== 'undefined' ? window.innerWidth < 1024 : false
    );
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isMobile) document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, isMobile]);

    // ✅ Sync profile/avatar updates across app
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'user' && e.newValue) {
                try {
                    setUser(JSON.parse(e.newValue));
                } catch { }
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
    };

    const isRTL = language === 'ar';
    const anchorSide = isRTL ? { right: 0 } : { left: 0 };

    const panelVariants = {
        hidden: { x: isRTL ? '100%' : '-100%', opacity: 0 },
        visible: { x: 0, opacity: 1 },
    };

    const trapActive = isOpen && isMobile;
    const focusTrapOptions = { fallbackFocus: () => panelRef.current as HTMLElement };

    const shouldBeVisible = !isMobile || isOpen;
    const pointerEventsClass = shouldBeVisible ? 'pointer-events-auto' : 'pointer-events-none';

    const expanded = isOpen || hovered;
    const desktopWidthClass = expanded ? 'lg:max-w-[280px] lg:w-[280px]' : 'lg:max-w-[80px] lg:w-[80px]';
    const desktopPaddingClass = expanded ? 'lg:p-4' : 'lg:p-2';
    const desktopBaseClass = `${desktopWidthClass} ${desktopPaddingClass} lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden`;
    const mobileBaseClass = 'fixed inset-y-0 z-50 w-72 max-w-full p-4 overflow-y-auto';

    const slideStyle = isMobile
        ? {
            ...anchorSide,
            transform: isOpen ? 'translateX(0)' : isRTL ? 'translateX(100%)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease-in-out',
        }
        : undefined;

    const navItem = (to: string, label: string, iconClass: string, end = false) => (
        <li key={to}>
            <NavLink
                to={to}
                end={end}
                onClick={() => isMobile && onClose()}
                aria-label={label}
                className={({ isActive }) =>
                    `flex items-center gap-2 ${expanded ? '' : 'justify-center'} px-3 py-2 rounded-md text-sm transition-colors duration-150 ${isActive ? 'bg-fill/80 font-medium' : 'hover:bg-fill/60'
                    }`
                }
            >
                {expanded ? (
                    <>
                        <i className={`${iconClass} w-5 h-5`} aria-hidden />
                        <span>{label}</span>
                    </>
                ) : (
                    <Tooltip content={label} placement="right">
                        <span className="inline-flex items-center justify-center" aria-hidden>
                            <i className={`${iconClass} w-5 h-5`} />
                        </span>
                    </Tooltip>
                )}
            </NavLink>
        </li>
    );

    const panel = (
        <m.aside
            ref={panelRef}
            aria-label="Main navigation"
            variants={panelVariants}
            initial={isMobile ? 'hidden' : 'visible'}
            animate={shouldBeVisible ? 'visible' : 'hidden'}
            transition={{ type: 'spring', stiffness: 300, damping: 28, duration: 0.28, ease: 'easeOut' }}
            style={isMobile ? slideStyle : undefined}
            className={`${isMobile ? mobileBaseClass : desktopBaseClass} bg-white dark:bg-zinc-900 border dark:border-zinc-700 rounded-xl shadow-lg lg:shadow-none ${pointerEventsClass}`}
            role="navigation"
            onMouseEnter={() => !isMobile && setHovered(true)}
            onMouseLeave={() => !isMobile && setHovered(false)}
        >
            <div className="flex flex-col gap-4 h-full">
                {/* ✅ Profile section */}
                <div className={`flex items-center gap-3 mb-2 ${expanded ? '' : 'justify-center'}`}>
                    <button
                        onClick={onClose}
                        aria-label="Close navigation"
                        className="ml-auto lg:hidden p-2 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-fill transition"
                        type="button"
                    >
                        <i className="i-mingcute-close-line w-4 h-4" />
                    </button>
                    <div className="ml-2">
                        <ProfileDropdown user={user} />
                    </div>
                </div>

                {/* ✅ Theme & Language Controls */}
                <div className="flex gap-2 items-center justify-center mt-4">
                    <Button onClick={toggleTheme} variant="ghost" className="px-2 py-1 text-sm">
                        {theme === 'dark' ? strings.light : strings.dark}
                    </Button>
                </div>
                <div className="flex gap-2 items-center justify-center mt-4">
                    <Button variant="secondary" onClick={toggleLanguage} className="px-2 py-1 text-sm">
                        {language === 'ar' ? 'EN' : 'AR'}
                    </Button>
                </div>

                <nav className="flex-1 overflow-y-auto">
                    <ul className="space-y-1">
                        {navItem('/profile', strings.profile, 'i-mingcute-user-3-line')}
                        {navItem('/', strings.dashboardOverview, 'i-mingcute-dashboard-line', true)}
                        {navItem('/reports', strings.reports, 'i-mingcute-report-line')}
                        {navItem('/schedule', strings.schedule, 'i-mingcute-calendar-2-line')}
                        {navItem('/employees', strings.employeeCard || 'Employee', 'i-mingcute-badge-line')}
                    </ul>
                </nav>

                <div className="mt-4 lg:hidden">
                    <Button onClick={handleLogout} variant="destructive" className="w-full">
                        {strings.logout}
                    </Button>
                </div>
            </div>
        </m.aside>
    );

    return (
        <>
            <AnimatePresence>
                {isOpen && isMobile && (
                    <m.div
                        key="sidebar-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 z-40 lg:hidden pointer-events-auto"
                        aria-hidden
                    />
                )}
            </AnimatePresence>
            <FocusTrap active={trapActive} focusTrapOptions={focusTrapOptions}>
                {panel}
            </FocusTrap>
        </>
    );
};

export default Sidebar;
