import NavBar from './components/NavBar/NavBar.tsx';
import './styles/index.scss';
import { Outlet } from 'react-router-dom';
import Right from "./components/Right/Right.tsx";

// import Post from "./components/Post/Post.tsx";

function App() {
    return (
        <>
            <NavBar />
            <div className="main">
                <div className="left">
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
