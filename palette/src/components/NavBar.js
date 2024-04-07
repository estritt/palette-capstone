// import { useEffect } from "react";
import React from 'react';
import { Navbar, Form, Nav, Image, NavLink, Stack, Col, Row } from 'react-bootstrap';
import { useAuth } from './AuthContext.js';
import { useNavigate, Link } from 'react-router-dom';

function NavBar() {

    const { activeUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <Navbar bg='primary' data-bs-theme='light' className='justify-content-between p-2' sticky='top'>
            <Nav>
                <NavLink as={Link} to='/'>Home</NavLink>
            </Nav>
        </Navbar>
    );

}

export default NavBar