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
        catch (e) {
            throw 'Login Failed';
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
        } catch (e) {
            throw 'Registration Failed';
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