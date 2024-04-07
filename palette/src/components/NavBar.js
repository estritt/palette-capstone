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
            <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: '100px' }}>
                <NavLink as={Link} to='/'>Home</NavLink> 
                {/* this should force reload but doesn't seem to */}
                <Nav.Link as={Link} to='/following'>Following</Nav.Link>
            </Nav>
        </Navbar>
    );

}

export default NavBar