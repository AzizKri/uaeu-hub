import React, { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const App = lazy(() => import("./App.tsx"));
const Login = lazy(() => import("./components/UserAccounts/Login/Login.tsx"));
const SignUp = lazy(
    () => import("./components/UserAccounts/SignUp/SignUp.tsx"),
);
const Home = lazy(() => import("./components/Home/Home.tsx"));
const PostPage = lazy(
    () => import("./components/PostStuff/PostPage/PostPage.tsx"),
);
const UserProfile = lazy(
    () => import("./components/UserProfilePage/UserProfile/UserProfile.tsx"),
);
const NotFound = lazy(
    () => import("./components/Reusable/NotFound/NotFound.tsx"),
);
const Community = lazy(
    () => import("./components/Communities/Community/Community.tsx"),
);
const ExploreCommunities = lazy(
    () =>
        import(
            "./components/Communities/ExploreCommunities/ExploreCommunities.tsx"
        ),
);
const UserPosts = lazy(
    () => import("./components/UserProfilePage/UserPosts/UserPosts.tsx"),
);
const UserCommunities = lazy(
    () => import("./components/UserProfilePage/UserCommunities/UserCommunities.tsx"),
);
const UserLikes = lazy(
    () => import("./components/UserProfilePage/UserLikes/UserLikes.tsx"),
);

const routes = [
    {
        path: "/",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <App />
            </Suspense>
        ),
        children: [
            { path: "/", element: <Home /> },
            { path: "post/:postId", element: <PostPage /> },
            {
                path: "user/:username",
                element: <UserProfile />,
                children: [
                    { path: "posts", element: <UserPosts /> },
                    { path: "communities", element: <UserCommunities /> },
                    { path: "likes", element: <UserLikes /> },
                ],
            },
            { path: "community/:communityName", element: <Community /> },
            { path: "community/explore", element: <ExploreCommunities /> },
        ],
    },
    {
        path: "/login",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Login />
            </Suspense>
        ),
    },
    {
        path: "/signup",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <SignUp />
            </Suspense>
        ),
    },
    { path: "*", element: <NotFound /> },
];

const router = createBrowserRouter(routes);

export const Routes: React.FC = () => {
    return <RouterProvider router={router} />;
};
