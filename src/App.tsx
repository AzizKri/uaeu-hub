import NavBar from "./components/NavBar";
// import Post from "./components/Post";
import "./styles/index.scss";

import Home from "./components/Home.tsx";

function App() {
    return (
        <>
            <NavBar/>
            <div className="main">
                <div className="left">
                </div>

                <div className="middle">
                    {/*<Post />*/}
                    <Home/>
                </div>
                <div className="right">

                </div>
            </div>
        </>
    );
}

export default App;
