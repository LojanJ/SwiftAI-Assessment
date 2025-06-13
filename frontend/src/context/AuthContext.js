import { createContext, useEffect, useState } from "react";
import {jwtDecode} from 'jwt-decode'
import axios from 'axios';

const AuthContext = createContext(null); 
const endpointURL = import.meta.env.ENDPOINT_URL;

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try{
                const decode = jwtDecode(token);
                if (decode.exp * 1000 > Date.now()) {
                    setUser(decode);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                } 
                else{
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization']
                }
            // eslint-disable-next-line no-unused-vars
            } catch (error) {
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization']
            }
        };
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try{
            const response = await axios.get(`${endpointURL}/auth/login`, {
                email,
                password,
            });
    
            const {token} = response.data;
            localStorage.setItem('token', token);

            const decoded = jwtDecode(token);
            setUser(decoded);
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
            return true;
        } 
        catch (error) {
            throw error.response?.data?.message || 'Login Failed';
        }
    }

    const register = async (userData) => {
        try {
            const response = await axios.get(`${endpointURL}/auth/register`, userData);
            
            const {token} = response.data;
            localStorage.setItem('token', token);
            
            const decoded = jwtDecode(token);
            setUser(decoded);
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
            return true;
        } catch (error) {
            throw error.response?.data?.message || 'Registration Failed';
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