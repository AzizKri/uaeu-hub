import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

const App = lazy(() => import('./App'));
const AdminLogin = lazy(() => import('./components/AdminLogin/AdminLogin'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const Reports = lazy(() => import('./components/Reports/Reports'));
const BugReports = lazy(() => import('./components/Feedback/BugReports'));
const FeatureRequests = lazy(() => import('./components/Feedback/FeatureRequests'));

const routes = [
    {
        path: '/login',
        element: (
            <Suspense fallback={<LoadingSpinner />}>
                <AdminLogin />
            </Suspense>
        ),
    },
    {
        path: '/',
        element: (
            <Suspense fallback={<LoadingSpinner />}>
                <App />
            </Suspense>
        ),
        children: [
            { 
                index: true, 
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <Dashboard />
                    </Suspense>
                )
            },
            { 
                path: 'reports', 
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <Reports />
                    </Suspense>
                )
            },
            { 
                path: 'bug-reports', 
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <BugReports />
                    </Suspense>
                )
            },
            { 
                path: 'feature-requests', 
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <FeatureRequests />
                    </Suspense>
                )
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
];

const router = createBrowserRouter(routes);

export const Routes: React.FC = () => {
    return (
        <ThemeProvider>
            <AdminAuthProvider>
                <RouterProvider router={router} />
            </AdminAuthProvider>
        </ThemeProvider>
    );
};
