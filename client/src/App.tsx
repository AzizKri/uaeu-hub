import NavBar from './components/NavBar/NavBar.tsx';
import './styles/index.scss';
import { Outlet } from 'react-router-dom';
import { UpdatePostProvider } from './lib/UpdatePostProvider.tsx';
import UserProvider from "./lib/userProvider.tsx";
import Right from "./components/Right/Right.tsx";

// import Post from "./components/Post/Post.tsx";

function App() {
    return (
        <UserProvider>
        <UpdatePostProvider>
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
        </UpdatePostProvider>
        </UserProvider>
    );
}

export default App;
