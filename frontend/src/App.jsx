import { Navigate, Route,Routes } from "react-router"
import HomePage from './pages/HomePage.jsx'
import SignUpPage from "./pages/SignUpPage.jsx"
import LogInPage from "./pages/LogInPage.jsx"
import ChatPage from "./pages/ChatPage.jsx"
import NotificationPage from "./pages/NotificationsPage.jsx"
import OnBoardingPage from "./pages/OnBoardingPage.jsx"
import CallPage from "./pages/CallPage.jsx"

import {Toaster} from "react-hot-toast"
import PageLoader from "./components/PageLoader.jsx"
import useAuthUser from "./hooks/useAuthUser.js"

function App() {

  const {isLoading, authUser} = useAuthUser()

  const isAuthenticated = Boolean(authUser)
  const isOnboarded = authUser?.isOnboarded

  if(isLoading) return <PageLoader />

  return (
    <>
      <div className="h-screen" data-theme="night">
        <Routes>
          <Route path="/" element={isAuthenticated && isOnboarded ?
            (
              <HomePage />
            ) : 
            (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }/>
          <Route path="/signup" element={!isAuthenticated ? <SignUpPage /> : <Navigate to="/" />}/>
          <Route path="/login" element={!isAuthenticated ? <LogInPage /> : <Navigate to="/" />}/>
          <Route path="/chat" element={isAuthenticated ? <ChatPage /> : <Navigate to="/" />}/>
          <Route path="/call" element={isAuthenticated ? <CallPage /> : <Navigate to="/" />}/>
          <Route path="/onboard" element={isAuthenticated ? <OnBoardingPage /> : <Navigate to="/" />}/>
          <Route path="/notifications" element={isAuthenticated ? <NotificationPage /> : <Navigate to="/" />}/>
        </Routes>
      </div>

      <Toaster />
    </>
  )
}

export default App
