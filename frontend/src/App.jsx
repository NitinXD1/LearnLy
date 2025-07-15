import { Route,Routes } from "react-router"
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

  const {data} = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const response = await axiosInstance.get('/auth/user')
      return response.data
    }
  })

  console.log(data)

  return (
    <>
      <div className="h-screen" data-theme="night">
        <Routes>
          <Route path="/" element={<HomePage />}/>
          <Route path="/signup" element={<SignUpPage />}/>
          <Route path="/login" element={<LogInPage />}/>
          <Route path="/chat" element={<ChatPage />}/>
          <Route path="/call" element={<CallPage />}/>
          <Route path="/onboard" element={<OnBoardingPage />}/>
          <Route path="/notifications" element={<NotificationPage />}/>
        </Routes>
      </div>

      <Toaster />
    </>
  )
}

export default App
