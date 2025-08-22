import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import LoginPage from "./LoginPage";
import ChatPage from "./ChatPage";
import DataQuery from "./DataQuery";
import MyFiles from "./MyFiles";
import ProtectedRoute from "../components/utils/ProtectedRoute";

export const Routers = createBrowserRouter([
    {
        path:"",
        element:<App/>,
        children:[
            {path:"login", element:<LoginPage />},
            {index: true, element:<ProtectedRoute><ChatPage /></ProtectedRoute>},
            {path:"query", element:<ProtectedRoute><DataQuery /></ProtectedRoute>},
            {path:"myfiles", element:<ProtectedRoute><MyFiles /></ProtectedRoute>},
            {path:"chat/:chatId", element:<ProtectedRoute><ChatPage /></ProtectedRoute>}
        ]
    }
]);