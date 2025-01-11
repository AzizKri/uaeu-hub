import { createRoot } from "react-dom/client";
import "./styles/index.scss";
import UserProvider from "./lib/providers/userProvider.tsx";
import { UpdatePostProvider } from "./lib/providers/UpdatePostProvider.tsx";
import WebSocketProvider from "./lib/providers/WebSocketProvider.tsx";
import {Routes} from "./routes.tsx";

createRoot(document.getElementById("root")!).render(
    <UserProvider>
        <WebSocketProvider>
            <UpdatePostProvider>
                <Routes />
            </UpdatePostProvider>
        </WebSocketProvider>
    </UserProvider>,
);
