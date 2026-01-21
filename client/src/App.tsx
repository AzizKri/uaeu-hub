import NavBar from './components/Nav/NavBar/NavBar.tsx';
import { Outlet } from 'react-router-dom';
import Right from "./components/Right/Right.tsx";
import Aside from "./components/Aside/Aside.tsx";
import {inActivateLeft} from "./utils/tools.ts";
import { useUser } from "./contexts/user/UserContext.ts";
import SuspendedModal from "./components/Reusable/SuspendedModal/SuspendedModal.tsx";
import BannedModal from "./components/Reusable/BannedModal/BannedModal.tsx";
import { useState, useEffect } from 'react';

function App() {
    const { user, isSuspended, isBanned, removeUser } = useUser();
    const [showSuspendedModal, setShowSuspendedModal] = useState(false);

    // Show suspended modal when user becomes suspended (only once per session)
    useEffect(() => {
        if (isSuspended() && user?.suspendedUntil) {
            const dismissedKey = `suspendedModalDismissed_${user.suspendedUntil}`;
            const wasDismissed = sessionStorage.getItem(dismissedKey);
            if (!wasDismissed) {
                setShowSuspendedModal(true);
            }
        } else {
            setShowSuspendedModal(false);
        }
    }, [user?.suspendedUntil, isSuspended]);

    const handleDismissSuspendedModal = () => {
        if (user?.suspendedUntil) {
            sessionStorage.setItem(`suspendedModalDismissed_${user.suspendedUntil}`, 'true');
        }
        setShowSuspendedModal(false);
    };

    return (
        <>
            {/* Show banned modal if user is banned */}
            {isBanned() && <BannedModal onClose={removeUser} />}
            
            {/* Show suspended modal popup (dismissible) */}
            {showSuspendedModal && user?.suspendedUntil && (
                <SuspendedModal 
                    suspendedUntil={user.suspendedUntil} 
                    onClose={handleDismissSuspendedModal} 
                />
            )}
            
            <div id="overlay" onClick={inActivateLeft}></div>
            <div className="navbar-wrapper">
                <NavBar />
            </div>
            <div className="main">
                <div id="left" className="left">
                    <Aside />
                </div>
                <div className="middle">
                    <Outlet />
                </div>
                <div className="right">
                    <Right />
                </div>
            </div>
        </>
    );
}

export default App;
