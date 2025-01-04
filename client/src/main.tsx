import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles/index.scss';
import App from './App.tsx';
import Login from './components/UserAccounts/Login/Login.tsx';
import SignUp from './components/UserAccounts/SignUp/SignUp.tsx';
import Home from './components/Home/Home.tsx';
import PostPage from './components/PostStuff/PostPage/PostPage.tsx';
import LoadingImage from "./components/Reusable/LoadingImage/LoadingImage.tsx";
import UserProvider from "./lib/userProvider.tsx";
import {UpdatePostProvider} from "./lib/UpdatePostProvider.tsx";
import UserProfile from "./components/UserProfilePage/UserProfile/UserProfile.tsx";
import NotFound from './components/Reusable/NotFound/NotFound.tsx';
import Community from "./components/Communities/Community/Community.tsx";
import ExploreCommunities from "./components/Communities/ExploreCommunities/ExploreCommunities.tsx"
import UserPosts from './components/UserProfilePage/UserPosts/UserPosts.tsx';
import UserComments from './components/UserProfilePage/UserComments/UserComments.tsx';
import UserLikes from './components/UserProfilePage/UserLikes/UserLikes.tsx';

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
                path: '/user/:username',
                element: <UserProfile />,
                children: [
                    {
                        path: '/user/:username/posts',
                        element: <UserPosts />,
                    },
                    {
                        path: '/user/:username/comments',
                        element: <UserComments />,
                    },
                    {
                        path: '/user/:username/likes',
                        element: <UserLikes />,
                    }
                ]
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
                        inviteOnly: false,
                        createdAt: new Date(24, 12, 5),
                        tags: "test",
                        memberCount: 5
                    }}
                />
            },
            {
                path: '/community/explore',
                element: <ExploreCommunities />
            },
            // {
            //     path: '/community/:communityId',
            //     element: <Community />
            // }
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
