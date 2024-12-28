import NavBar from './components/NavBar/NavBar.tsx';
// import './styles/index.scss';
import { Outlet } from 'react-router-dom';
// import Right from "./components/Right/Right.tsx";
import Aside from "./components/Aside/Aside.tsx";

function App() {

    const inActivateLeft = () => {
        const left = document.getElementById('left');
        if (left) left.classList.remove('active');
    }
    return (
        <>
            <NavBar />
            <div className="main">
                <div id="left" className="left">
                    <Aside />
                    <div className="left-overlay" onClick={inActivateLeft}></div>
                </div>

                <div className="middle">
                    <Outlet />
                </div>
                {/*<div className="right">*/}
                {/*    <Right />*/}
                {/*</div>*/}
            </div>
        </>
    );
}

export default App;
