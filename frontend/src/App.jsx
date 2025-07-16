import { Navigate, Route,Routes } from "react-router"
import HomePage from './pages/HomePage.jsx'
import SignUpPage from "./pages/SignUpPage.jsx"
import LogInPage from "./pages/LogInPage.jsx"
import ChatPage from "./pages/ChatPage.jsx"
import NotificationPage from "./pages/NotificationsPage.jsx"
import OnBoardingPage from "./pages/OnBoardingPage.jsx"
import CallPage from "./pages/CallPage.jsx"

import {Toaster} from "react-hot-toast"
import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "./lib/axios.js"

function App() {

  const {data:authData , isLoading , error} = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const response = await axiosInstance.get('/auth/me')
      return response.data
    }
    ,
    retry: false,
  })

  const authUser = authData?.user

  return (
    <>
      <div className="h-screen" data-theme="night">
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />}/>
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />}/>
          <Route path="/login" element={!authUser ? <LogInPage /> : <Navigate to="/" />}/>
          <Route path="/chat" element={authUser ? <ChatPage /> : <Navigate to="/" />}/>
          <Route path="/call" element={authUser ? <CallPage /> : <Navigate to="/" />}/>
          <Route path="/onboard" element={authUser ? <OnBoardingPage /> : <Navigate to="/" />}/>
          <Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to="/" />}/>
        </Routes>
      </div>

      <Toaster />
    </>
  )
}

export default App
