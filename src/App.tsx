import Search from "./components/search";
import "./styles/index.scss";

function App() {
  return (
    <>
      <div className="navbar">
        <div className="navbar_logo">UAEU some shit</div>
        <div className="navbar_buttons">
          <div className="button selected-button">Home</div>
          <div className="button">Your Questions</div>
        </div>
        <Search />
      </div>
    </>
  );
}

export default App;
