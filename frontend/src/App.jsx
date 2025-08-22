import { Navigate, Route,Routes } from "react-router"
import HomePage from './pages/HomePage.jsx'
import SignUpPage from "./pages/SignUpPage.jsx"
import LogInPage from "./pages/LoginPage.jsx"
import ChatPage from "./pages/ChatPage.jsx"
import NotificationPage from "./pages/NotificationsPage.jsx"
import OnBoardingPage from "./pages/OnBoardingPage.jsx"
import CallPage from "./pages/CallPage.jsx"
import Layout from "./components/Layout.jsx"

import {Toaster} from "react-hot-toast"
import PageLoader from "./components/PageLoader.jsx"
import useAuthUser from "./hooks/useAuthUser.js"
import { useThemeStore } from "./store/useThemeStore.js"

function App() {

  const {isLoading, authUser} = useAuthUser()
  const {theme} = useThemeStore()

  const isAuthenticated = Boolean(authUser)
  const isOnboarded = authUser?.isOnBoarded

  if(isLoading) return <PageLoader />

  return (
    <>
      <div className="h-screen" data-theme={theme}>
        <Routes>
          <Route path="/" element={isAuthenticated && isOnboarded ?
            (
              <Layout showSidebar={true}>
                <HomePage />
              </Layout>
            ) : 
            (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }/>
          <Route 
            path="/login"
            element={
              !isAuthenticated 
              ? <LogInPage /> 
              : <Navigate to={isOnboarded ? "/" : "/onboarding"} />}
          />
          <Route 
            path="/signup" 
            element={
              !isAuthenticated ? 
              <SignUpPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />
            }
          />
          
          <Route 
            path="/notifications" 
            element={
              isAuthenticated  && isOnboarded? 
              (
                <Layout showSidebar={true}>
                  <NotificationPage />
                </Layout>
              ) :
              (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              )
            }
          />

          <Route path="/onboarding" element={
            isAuthenticated  ? (
              !isOnboarded ?( 
                <OnBoardingPage /> 
                ) :
                ( 
                <Navigate to="/" />
              ) 
            )
            : (
                <Navigate to="/login" />
            )
          }/>

          <Route
            path="/chat/:id"
            element={
              isAuthenticated && isOnboarded 
              ? (
                <Layout showSidebar={false}>
                  <ChatPage />
                </Layout>
              ) :
              (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              ) 
              }/>
          <Route
            path="/call/:id"
            element={
              isAuthenticated && isOnboarded ? 
              <CallPage /> :
              (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              )
            }
          />
          
        </Routes>
      </div>

      <Toaster />
    </>
  )
}

export default App
