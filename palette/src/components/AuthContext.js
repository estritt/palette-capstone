import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {

    const [ activeUser, setActiveUser ] = useState(null);

    useEffect(() => {

        fetch('/check_session')
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(user => {
            setActiveUser(user)
        })
        .catch(error => {
            console.error('User check error:', error);
            setActiveUser(null); // just in case
        });
    }, []);

    const login = (username, password) => {
        fetch('/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify({username, password}),
        })
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(user => {
            setActiveUser(user);
        })
        .catch(error => {
            console.error('Login error:', error);
            setActiveUser(null);
        })
    };

    const logout = () => {
        fetch('logout', {
            method: 'DELETE',
            headers:{"Content-Type": "application/json",},
        })
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(() => setActiveUser(null))
        .catch(error => {
            console.error('Logout error:', error);
        });
    };

    const value = { // check shoul be run without giving it in value
        activeUser,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

};