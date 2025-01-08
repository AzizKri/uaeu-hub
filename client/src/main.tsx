import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles/index.scss';
import App from './App.tsx';
import Login from './components/UserAccounts/Login/Login.tsx';
import SignUp from './components/UserAccounts/SignUp/SignUp.tsx';
import Home from './components/Home/Home.tsx';
import PostPage from './components/PostStuff/PostPage/PostPage.tsx';
import UserProvider from './lib/providers/userProvider.tsx';
import { UpdatePostProvider } from './lib/providers/UpdatePostProvider.tsx';
import UserProfile from './components/UserProfilePage/UserProfile/UserProfile.tsx';
import NotFound from './components/Reusable/NotFound/NotFound.tsx';
import Community from './components/Communities/Community/Community.tsx';
import ExploreCommunities from './components/Communities/ExploreCommunities/ExploreCommunities.tsx';
import UserPosts from './components/UserProfilePage/UserPosts/UserPosts.tsx';
import UserComments from './components/UserProfilePage/UserComments/UserComments.tsx';
import UserLikes from './components/UserProfilePage/UserLikes/UserLikes.tsx';
import WebSocketProvider from './lib/providers/WebSocketProvider.tsx';

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
            {
                path: '/user/:username',
                element: <UserProfile />,
                children: [
                    {
                        path: '/user/:username/posts',
                        element: <UserPosts />
                    },
                    {
                        path: '/user/:username/comments',
                        element: <UserComments />
                    },
                    {
                        path: '/user/:username/likes',
                        element: <UserLikes />
                    }
                ]
            },
            {
                path: '/community/:communityName',
                element: <Community />
            },
            {
                path: '/community/explore',
                element: <ExploreCommunities />
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
        <WebSocketProvider>
            <UpdatePostProvider>
                <RouterProvider router={router} />
            </UpdatePostProvider>
        </WebSocketProvider>
    </UserProvider>
);
