import NavBar from './components/Nav/NavBar/NavBar.tsx';
import { Outlet } from 'react-router-dom';
import Right from "./components/Right/Right.tsx";
import Aside from "./components/Aside/Aside.tsx";
import {inActivateLeft} from "./utils/tools.ts";

function App() {

    return (
        <>
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
