import Search from "./Search.tsx";

export default function NavBar() {
  return (
    <>
      <div className="navbar">
        <div className="navbar_logo">UAEU</div>
        <div className="navbar_buttons">
          <div className="button selected-button">Home</div>
          <div className="button">Your Questions</div>
        </div>
        <Search />
      </div>
    </>
  );
}
