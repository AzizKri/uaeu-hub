import { createRoot } from 'react-dom/client';
import './index.scss';
import { Routes } from './routes.tsx';
import AppProviders from "./contexts/AppProviders.tsx";
import AuthGate from "./components/AuthGate/AuthGate.tsx";

createRoot(document.getElementById('root')!).render(
    <AppProviders>
        <AuthGate>
            <Routes/>
        </AuthGate>
    </AppProviders>
);
