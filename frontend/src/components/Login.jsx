import { useState } from "react"
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import loginBg from '../../public/Login.jpg'

const LoginRegister = () => {
    const [isLogin, setLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const {login, register} = useAuth();
    const navigate = useNavigate();

    // Login 
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    // Register
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleLoginChange = (e) => {
        const {name, value} = e.target;
        setLoginData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRegisterChange = (e) => {
        const {name, value} = e.target;
        setRegisterData(prev => ({
            ...prev,
            [name]: value
        }))
    }
 
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          await login(loginData.email, loginData.password);
          toast.success('Login successful!');
          navigate('/');
        } catch (error) {
          toast.error(error.toString());
        } finally {
          setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault()
        if (registerData.password !== registerData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }

        setLoading(true);
        try {
          await register(registerData.name, registerData.email, registerData.password);
          toast.success('Account Created!');
          navigate('/');
        } catch (error) {
          toast.error(error.toString());
        } finally {
          setLoading(false);
        }
    }

    const toggleMode = () => {
        setLogin(!isLogin);
        // Clear form data when switching modes
        setLoginData({ email: '', password: '' });
        setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
    };


    return (
         <Container fluid 
            className="vh-100 d-flex align-items-center justify-content-center"
            style={{
                fontFamily: "'Inter', sans-serif",
                backgroundImage: `url(${loginBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                minHeight: "100vh"
            }}
         >
        <Row className="w-100 justify-content-center">
            <Col lg={10} xl={8}>
            <Card className="shadow-lg border-0 overflow-hidden position-relative">
                <Row className="g-0 min-vh-50">
                
                {/* Login Form */}
                <Col md={6} className={`position-absolute w-50 h-100 ${isLogin ? 'form-slide-in' : 'form-slide-out-left'}`}>
                    <div className="p-5 h-100 d-flex flex-column justify-content-center bg-white">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold">Welcome Back</h2>
                        <p className="text-muted small">Sign in to continue your journey</p>
                    </div>
                    
                    <Form onSubmit={handleLoginSubmit}>
                        <Form.Group className="mb-3">
                        <Form.Control
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={loginData.email}
                            onChange={handleLoginChange}
                            required
                            size="md"
                        />
                        </Form.Group>
                        
                        <Form.Group className="mb-4">
                        <Form.Control
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={loginData.password}
                            onChange={handleLoginChange}
                            required
                            minLength={8}
                            size="md"
                        />
                        </Form.Group>
                        
                        <Button
                        variant="primary"
                        type="submit"
                        size="lg"
                        className="w-100"
                        disabled={loading}
                        style={{ border: 'none'}}
                        >
                        {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </Form>
                    <div className=" d-md-none text-center mt-4">
                        <div className="or-separator d-flex align-items-center justify-content-center mb-3">
                            <hr className="flex-grow-1" />
                            <span className="mx-3">OR</span>
                            <hr className="flex-grow-1" />
                        </div>
                        <p className="small mb-0">
                            {isLogin 
                            ? <>Don't have an account?{' '}
                                <span
                                    onClick={toggleMode}
                                    style={{ color: '#FF5349', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Sign Up
                                </span>
                                </>
                            : <>Already have an account?{' '}
                                <span
                                    onClick={toggleMode}
                                    style={{ color: '#FF5349', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Sign In
                                </span>
                                </>
                            }
                        </p>
                        </div>
                    </div>
                </Col>
                
                {/* Register Form */}
                <Col md={6} className={`position-absolute w-50 h-100 ${!isLogin ? 'form-slide-in' : 'form-slide-out-right'}`} style={{left: '50%'}}>
                    <div className="p-5 h-100 d-flex flex-column justify-content-center bg-white">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold">Join Us</h2>
                        <p className="text-muted small">Create an account and get started</p>
                    </div>
                    
                    <Form onSubmit={handleRegisterSubmit}>
                        <Form.Group className="mb-3">
                        <Form.Control
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={registerData.name}
                            onChange={handleRegisterChange}
                            required
                            size="md"
                        />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                        <Form.Control
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={registerData.email}
                            onChange={handleRegisterChange}
                            required
                            size="md"
                        />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                        <Form.Control
                            type="password"
                            name="password"
                            placeholder="Password"
                            minLength={8}
                            value={registerData.password}
                            onChange={handleRegisterChange}
                            required
                            size="md"
                        />
                        </Form.Group>
                        
                        <Form.Group className="mb-4">
                        <Form.Control
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            minLength={8}
                            value={registerData.confirmPassword}
                            onChange={handleRegisterChange}
                            required
                            size="md"
                        />
                        </Form.Group>
                        
                        <Button
                        variant="primary"
                        type="submit"
                        size="lg"
                        className="w-100"
                        disabled={loading}
                        >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </Form>
                    <div className="d-md-none text-center mt-4">
                        <div className="or-separator d-flex align-items-center justify-content-center mb-3">
                            <hr className="flex-grow-1" />
                            <span className="mx-3">OR</span>
                            <hr className="flex-grow-1" />
                        </div>
                        <p className="small mb-0">
                            {isLogin 
                            ? <>Don't have an account?{' '}
                                <span
                                    onClick={toggleMode}
                                    style={{ color: '#FF5349', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Sign Up
                                </span>
                                </>
                            : <>Already have an account?{' '}
                                <span
                                    onClick={toggleMode}
                                    style={{ color: '#FF5349', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Sign In
                                </span>
                                </>
                            }
                        </p>
                        </div>
                    </div>
                </Col>

                
                {/* Welcome Panel - Login Mode */}
                <Col md={6} className={`position-absolute w-50 h-100 text-white ${isLogin ? 'panel-slide-in-right' : 'panel-slide-out-right'}`} style={{right: '0', backgroundColor: '#FF5349'}}>
                    <div className="p-5 h-100 d-flex flex-column justify-content-center text-center">
                    <h2 className="fw-bold mb-3">Hi There!</h2>
                    <p className="mb-4 opacity-75">
                        Enter your personal details and start your journey with us
                    </p>
                    <Button
                        variant="outline-light"
                        size="md"
                        onClick={toggleMode}
                        className="px-4"
                    >
                        Sign Up
                    </Button>
                    </div>
                </Col>
                
                {/* Welcome Panel - Register Mode */}
                <Col md={6} className={`position-absolute w-50 h-100 text-white ${!isLogin ? 'panel-slide-in-left' : 'panel-slide-out-left'}`} style={{left: '0', backgroundColor: '#FF5349'}}>
                    <div className="p-5 h-100 d-flex flex-column justify-content-center text-center">
                    <h2 className="fw-bold mb-3">Nice to See You!</h2>
                    <p className="mb-4 opacity-75">
                        To keep connected with us please login with your personal info
                    </p>
                    <Button
                        variant="outline-light"
                        size="md"
                        onClick={toggleMode}
                        className="px-4"
                    >
                        Sign In
                    </Button>
                    </div>
                </Col>
                
                </Row>
            </Card>
            </Col>
        </Row>
        
        <style jsx>{`

            .form-slide-in {
                transform: translateX(0);
                transition: transform 0.6s ease-in-out;
                z-index: 2;
            }

            .form-slide-out-left {
                transform: translateX(-100%);
                transition: transform 0.6s ease-in-out;
                z-index: 1;
            }

            .form-slide-out-right {
                transform: translateX(100%);
                transition: transform 0.6s ease-in-out;
                z-index: 1;
            }

            .panel-slide-in-right,
            .panel-slide-in-left {
                transform: translateX(0);
                transition: transform 0.6s ease-in-out;
                z-index: 2;
            }

            .panel-slide-out-left {
                transform: translateX(-100%);
                transition: transform 0.6s ease-in-out;
                z-index: 1;
            }

            .panel-slide-out-right {
                transform: translateX(100%);
                transition: transform 0.6s ease-in-out;
                z-index: 1;
            }

            .min-vh-50 {
                min-height: 70vh;
            }

            @media (max-width: 768px) {
                .position-absolute {
                position: relative !important;
                width: 100% !important;
                left: 0 !important;
                right: 0 !important;
                transform: none !important;
                }

                .panel-slide-in-right,
                .panel-slide-out-right,
                .panel-slide-in-left,
                .panel-slide-out-left {
                display: none !important;
                }

                .form-slide-out-left,
                .form-slide-out-right {
                display: none !important;
                }

                .form-slide-in {
                transform: none !important;
                }

                .p-5 {
                padding: 2rem !important;
                }

                .h-100 {
                height: auto !important;
                }
            }
        `}</style>
    </Container>
    );
}

export default LoginRegister;