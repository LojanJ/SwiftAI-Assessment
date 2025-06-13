/* eslint-disable react-refresh/only-export-components */

import { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastContainer } from "react-toastify";
import Login from "./components/Login";

const ProtectedPath = ({children}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to={Login}></Navigate>
  }
}

function App(){
  return (
  <AuthProvider>
    <ThemeProvider>
    <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
      <Routes> 
        <Route path="/login" element={<Login/>} />
      </Routes>
    </ThemeProvider>
  </AuthProvider>
  )
}

export default App;

