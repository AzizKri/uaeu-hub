import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles/index.scss";
import App from './App.tsx'
import Login from "./components/Login/Login.tsx";
import SignUp from "./components/SignUp/SignUp.tsx";
import Home from "./components/Home/Home.tsx";
import Post from "./components/Post/Post.tsx";



const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: "/post/0",
                element: <Post authorUsername={"huss"} authorDisplayName={"hussein"} postDate={new Date("10/13/24")} content={"Test"} pfp={""}/>
            }
        ]
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/signup",
        element: <SignUp />,
    }
]);

createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
)
