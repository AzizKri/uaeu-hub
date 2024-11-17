import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles/index.scss';
import App from './App.tsx';
import Login from './components/Login/Login.tsx';
import SignUp from './components/SignUp/SignUp.tsx';
import Home from './components/Home/Home.tsx';
import PostPage from './components/Post/PostPage.tsx';
import LoadingImage from "./components/LoadingImage/LoadingImage.tsx";
import UserProvider from "./lib/userProvider.tsx";
import {UpdatePostProvider} from "./lib/UpdatePostProvider.tsx";


const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '/',
                element: <Home />
            },
            {
                path: '/post/:postId',
                element: <PostPage />
            },
            // just for testing
            {
                path: '/loading',
                element: <LoadingImage />
            }
        ]
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/signup',
        element: <SignUp />
    }
]);

createRoot(document.getElementById('root')!).render(
    <UserProvider>
        <UpdatePostProvider>
            <RouterProvider router={router} />
        </UpdatePostProvider>
    </UserProvider>
);
