import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles/index.scss";
import App from './App.tsx'
import Login from "./components/Login/Login.tsx";
import SignUp from "./components/SignUp/SignUp.tsx";
import Home from "./components/Home/Home.tsx";
import PostPage from "./components/Post/PostPage.tsx";



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
                path: "/post/:postId",
                element: <PostPage/>
            },
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
