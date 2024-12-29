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
import UserProfile from "./components/UserProfile/UserProfile.tsx";
import NotFound from './components/NotFound/NotFound.tsx';
import Community from "./components/Community/Community.tsx";


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
            },
            {
                path: '/user',
                element: <UserProfile displayName={"Test"} username={"test"} bio={"my bio"} pfp={"test.png"} isAnonymous={false}/>
            },
            {
                // TODO: use same approach used in post
                path: '/community/community1',
                element: <Community
                    info={{
                        id: 123,
                        name: "Community1",
                        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
                        icon: null,
                        verified: true,
                        public: true,
                        invite_only: false,
                        created_at: new Date(24, 12, 5),
                        tags: "test",
                        member_count: 5
                    }}
                />
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
    },
    {
        path: '*',
        element: <NotFound />
    }
]);

createRoot(document.getElementById('root')!).render(
    <UserProvider>
        <UpdatePostProvider>
            <RouterProvider router={router} />
        </UpdatePostProvider>
    </UserProvider>
);
