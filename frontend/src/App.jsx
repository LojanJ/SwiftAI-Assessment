/* eslint-disable react-refresh/only-export-components */

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

function App(){
  return (
  <AuthProvider>
    <ThemeProvider>

    </ThemeProvider>
  </AuthProvider>
  )
}

export default App();

