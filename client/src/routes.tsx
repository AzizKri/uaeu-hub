import React, {lazy, Suspense} from "react";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import LoadingFallback from "./components/Reusable/LoadingFallback/LoadingFallback.tsx";
import ResetPasswordPage from "./components/UserAuthentication/Password/ResetPasswordPage.tsx";
import Terms from "./components/Legal/Terms/Terms.tsx";

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
const EmailVerification = lazy(
    () =>
        import(
            "./components/UserAuthentication/EmailVerification/EmailVerification.tsx"
            ),
);

const PasswordLandingPage = lazy(
    () =>
        import(
            "./components/UserAuthentication/Password/PasswordLandingPage.tsx"
            ),
);

const routes = [
    {
        path: "/",
        element: (
            <Suspense fallback={<LoadingFallback/>}>
                <App/>
            </Suspense>
        ),
        children: [
            {path: "/", element: <Home/>},
            {path: "post/:postId", element: <PostPage/>},
            {
                path: "user/:username",
                element: <UserProfile/>,
            },
            {path: "community/:communityName", element: <Community/>},
            {path: "community/explore", element: <ExploreCommunities/>},
            {
                path: "/terms",
                element: (
                    <Terms/>
                )
            },
        ],
    },
    {
        path: "/login",
        element: (
            <Suspense fallback={<LoadingFallback/>}>
                <Login/>
            </Suspense>
        ),
    },
    {
        path: "/signup",
        element: (
            <Suspense fallback={<LoadingFallback/>}>
                <SignUp/>
            </Suspense>
        ),
    },
    {
        path: "/verify-email",
        element: (
            <Suspense fallback={<LoadingFallback/>}>
                <EmailVerification/>
            </Suspense>
        ),
    },
    {
        path: "/reset-password-form",
        element: (
            <Suspense fallback={<LoadingFallback/>}>
                <PasswordLandingPage/>
            </Suspense>
        )
    },
    {
        path: "/reset-password",
        element: (
            <Suspense fallback={<LoadingFallback/>}>
                <ResetPasswordPage/>
            </Suspense>
        )
    },
    {path: "*", element: <NotFound/>},
];

const router = createBrowserRouter(routes);

export const Routes: React.FC = () => {
    return <RouterProvider router={router}/>;
};
