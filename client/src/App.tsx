import NavBar from "./components/NavBar/NavBar.tsx";
import Home from "./components/Home/Home.tsx";
import "./styles/index.scss";
// import Post from "./components/Post/Post.tsx";

function App() {
    return (
        <>
            <NavBar/>
            <div className="main">
                <div className="left">
                </div>

                <div className="middle">
                    <Home />
                </div>
                <div className="right">

                </div>
            </div>
        </>
    );
}

export default App;
