import NavBar from "./components/NavBar/NavBar.tsx";
import Home from "./components/Home.tsx";
import "./styles/index.scss";

function App() {
    return (
        <>
            <NavBar/>
            <div className="main">
                <div className="left">
                </div>

                <div className="middle">
                    {/*<Post />*/}
                    <Home />
                </div>
                <div className="right">

                </div>
            </div>
        </>
    );
}

export default App;
