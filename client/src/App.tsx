import NavBar from './components/NavBar/NavBar.tsx';
import './styles/index.scss';
import { Outlet } from 'react-router-dom';
import { UpdatePostProvider } from './contextProviders/UpdatePostProvider.tsx';

// import Post from "./components/Post/Post.tsx";

function App() {
    return (
        <UpdatePostProvider>
            <NavBar />
            <div className="main">
                <div className="left">
                </div>

                <div className="middle">
                    <Outlet />
                </div>
                <div className="right">

                </div>
            </div>
        </UpdatePostProvider>
    );
}

export default App;
