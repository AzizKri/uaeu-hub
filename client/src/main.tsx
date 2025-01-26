import { createRoot } from 'react-dom/client';
import './index.scss';
import { Routes } from './routes.tsx';
import AppProviders from "./contexts/AppProviders.tsx";

createRoot(document.getElementById('root')!).render(
    <AppProviders>
        <Routes/>
    </AppProviders>
);
