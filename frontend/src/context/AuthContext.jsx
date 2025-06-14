/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import {jwtDecode} from 'jwt-decode'
import axios from 'axios';

export const AuthContext = createContext(null); 
const endpointURL = import.meta.env.VITE_ENDPOINT_URL;

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth is out of Provider");
    }
    return context;
}

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('Initial token check:', { token });
        if (token) {
            try{
                const decode = jwtDecode(token);
                console.log('Decoded token:', decode);
                if (decode.exp * 1000 > Date.now()) {
                    setUser(decode);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    console.log('Token set in axios headers:', axios.defaults.headers.common);
                } 
                else{
                    console.log('Token expired');
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization']
                }
            // eslint-disable-next-line no-unused-vars
            } catch (error) {
                console.error('Error decoding token:', error);
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization']
            }
        };
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try{
            const response = await axios.post(`${endpointURL}/auth/login`, {
                email: email,
                password: password,
            });
    
            const {accessToken} = response.data.data;
            localStorage.setItem('token', accessToken);

            const decoded = jwtDecode(accessToken);
            setUser(decoded);
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
            return true;
        } 
        catch (error) {
             console.error('Login error:', error);
            
            let errorMessage = 'Login failed';
            if (error.response) {
                    switch (error.response.status) {
                        case 401:
                            errorMessage = 'Invalid email or password';
                            break;
                        case 422:
                            errorMessage = 'Please check your email and password';
                            break;
                        case 429:
                            errorMessage = 'Too many login attempts. Please try again later';
                            break;
                        default:
                            errorMessage = 'Login failed';
                        }
                    }
            else if (error.request) {
                errorMessage = 'Network error. Please check your connection';
            }

            throw new Error(errorMessage)
        }
    }

    const register = async (name, email, password) => {
        try {
            const response = await axios.post(`${endpointURL}/auth/register`, {
                name: name,
                email: email,
                password: password
            });

            const {accessToken} = response.data.data;
            localStorage.setItem('token', accessToken);
            
            const decoded = jwtDecode(accessToken);
            setUser(decoded);
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            
            let errorMessage = 'Registration failed';
            if (error.response) {
                switch (error.response.status) {
                    case 409:
                        errorMessage = 'An account with this email already exists';
                        break;
                    case 422:
                        errorMessage = 'Please check your information and try again';
                        break;
                    case 400:
                        if (error.response.data?.errors) {
                            errorMessage = error.response.data.errors.map(err => err.message).join(', ');
                        } else {
                            errorMessage = 'Invalid registration data';
                        }
                        break;
                    default:
                        errorMessage = 'Registration failed';
                }
            } else if (error.request) {
                errorMessage = 'Network error. Please check your connection';
            }
            
            throw new Error(errorMessage);
        }
    }

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization']
        setUser(null);
    }

    const value = {user, loading, login, register, logout}

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}