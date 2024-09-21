import NavBar from "./components/NavBar";
import "./styles/index.scss";
import Question from "./components/Question.tsx";

function App() {
  return (
    <>
      <NavBar />
      <div className="main">
        <div className="left">

        </div>
          <div className="middle">

              {/*<div>
                  <h3>Home</h3>

                  <span>What's your question?</span>

                  <button>Submit</button>

              </div>

              <h3>Recent Questions</h3>
              <span>20 new questions</span>*/}

              <Question />
              <Question />
              <Question />
              <Question />
              <Question />
              <Question />
              <Question />
              <Question />
              <Question />
          </div>
          <div className="right">

          </div>
      </div>
    </>
  );
}

export default App;
