import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AuthContext, AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { ToastContainer } from "react-toastify";
import { Sun, Moon } from 'lucide-react';
import Login from "./components/Login";
import { ContactList } from "./components/ContactList";
import { ContactForm } from "./components/ContactForm";
import { AdminPanel } from "./components/Admin";

const ProtectedRoute = ({children}) => {
  const {user} = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

const AdminRoute = ({children}) => {
  const {user} = useAuth();
  const location = useLocation();

  if (String(!user || !user?.role).toLocaleLowerCase() === 'admin'){
    return <Navigate to="login" state={{from: location}} replace />;
  }
  return children
}

const PublicRoute = ({children}) => {
  const {user} = useAuth();
  const location = useLocation();

  if (user) {
    const from = location.state?.from || "/contacts";
    return <Navigate to={from} replace />;
  }
  return children;
}

const Navigation = () => {
  const {user, logout} = useAuth();
  const {isDark, toggleTheme} = useTheme();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar 
      bg={isDark ? "dark" : "light"} 
      variant={isDark ? "dark" : "light"} 
      expand="lg" 
      className="shadow-sm sticky-top"
      style={{
        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
        borderBottom: isDark ? '1px solid #333' : '1px solid #eee'
      }}
    >
      <Container>
        <Navbar.Brand 
          href="/" 
          className="fw-bold"
          style={{ 
            fontSize: '1.5rem',
            color: isDark ? '#fff' : '#333',
            textShadow: isDark ? '0 0 10px rgba(255,255,255,0.1)' : 'none'
          }}
        >
          Buddy Base
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user && (
              <>
                <Nav.Link 
                  href="/contacts" 
                  className="fw-medium"
                  style={{ color: isDark ? '#fff' : '#333' }}
                >
                  My Contacts
                </Nav.Link>
                <Nav.Link 
                  href="/contacts/new" 
                  className="fw-medium"
                  style={{ color: isDark ? '#fff' : '#333' }}
                >
                  Add Contact
                </Nav.Link>
              </>
            )}
            {
              user?.role === "admin" && (
                <Nav.Link
                href="/admin"
                className="fw-medium py-2 "
                style={{
                  background: 'linear-gradient(135deg, #6f00ff, #00e0ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                  transition: 'transform 0.2s',
                }}>
                  Admin
                </Nav.Link>
              )
            }

          </Nav>
          <Nav className="d-flex align-items-center">
            {user ? (
              <>
                <span 
                  className="navbar-text me-3 fw-medium"
                  style={{ color: isDark ? '#fff' : '#333' }}
                >
                  Welcome, {user?.name}
                </span>

                <div className="flex align-items-center">
                  <Button 
                    variant={isDark ? "outline-light" : "outline-dark"}
                    size="sm" 
                    onClick={toggleTheme}
                    className="me-3"
                    style={{
                      borderWidth:'2px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isDark ? <Sun size={22} /> : <Moon size={22} />}
                  </Button>
                  <Button 
                    variant={isDark ? "outline-light" : "outline-dark"}
                    size="sm"
                    onClick={handleLogout}
                    className="fw-small"
                    style={{
                      borderWidth: '2px',
                      transition: 'all 0.3s ease',
                      padding: '0.25rem 0.75rem',
                      fontSize: '1rem'
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Nav.Link 
                  href="/login" 
                  className="fw-medium"
                  style={{ color: isDark ? '#fff' : '#333' }}
                >
                  Login/ Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

const Home = () => {
  const {user} = useAuth();
  const location = useLocation();
  const {isDark} = useTheme();

  if (user) {
    const from = location.state?.from || "/contacts";
    return <Navigate to={from} replace />;
  }

  return(
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ 
        background: isDark 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        marginTop: '-56px',
        paddingTop: '56px'
      }}
    >
      <Container className="py-5">
        <div className="text-center">
          <h1 
            className="display-3 fw-bold mb-4"
            style={{ 
              color: isDark ? '#fff' : '#333',
              textShadow: isDark ? '0 0 20px rgba(255,255,255,0.1)' : 'none'
            }}
          >
            📱 Buddy Base
          </h1>
          <p 
            className="lead mb-5 fs-4"
            style={{ color: isDark ? '#ccc' : '#666' }}
          >
            Manage your contacts efficiently with our modern, secure platform
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <Button 
              variant={isDark ? "light" : "primary"}
              size="lg" 
              href="/login"
              className="px-5 py-3 fw-medium shadow-sm"
              style={{
                transition: 'all 0.3s ease',
                transform: 'translateY(0)',
                ':hover': {
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Get Started
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}
function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="min-vh-100">
          {!isLoginPage && <Navigation />}
          <main>
            <Routes>
              <Route path="/" element={<Home/>} />
              <Route path="/login" element={<PublicRoute><Login/></PublicRoute>} />
              <Route 
                path="/contacts" 
                element={
                  <ProtectedRoute>
                    <ContactList/>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/contacts/new" 
                element={
                  <ProtectedRoute>
                    <ContactForm/>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/contacts/edit/:id" 
                element={
                  <ProtectedRoute>
                    <ContactForm/>
                  </ProtectedRoute>
                } 
              />
              <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel/>
                </ProtectedRoute>
              }/>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <ToastContainer 
            position="bottom-right" 
            autoClose={3000} 
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored" 
          />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

