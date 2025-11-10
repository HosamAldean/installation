// src/components/common/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

export default function ProtectedRoute() {
    const token = localStorage.getItem('accessToken');
    const location = useLocation();

    // If user is not logged in
    if (!token) {
        // Avoid showing toast repeatedly on the login page itself
        if (location.pathname !== '/login') {
            toast.error('Please login to continue');
        }
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}
