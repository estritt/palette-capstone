// import { useEffect } from "react";
import React from 'react';
import { Navbar, Form, Nav, Image, NavLink, Stack, Col, Row, NavDropdown } from 'react-bootstrap';
import { useAuth } from './AuthContext.js';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';


function NavBar() {

    const { activeUser, logout } = useAuth();
    const navigate = useNavigate();

    // const handleLogout = () => {
    //     logout();
    //     navigate('/');
    // };

    return (
        <Navbar bg='primary' data-bs-theme='light' className='d-flex justify-content-between p-2' sticky='top'>
            {/* these don't have to both be flexboxes in the current state */}
            <Nav className="fs-4 flex-grow-1 my-2 my-lg-0" style={{ maxHeight: '100px' }}>
                
                <NavLink as={Link} to='/'>Home</NavLink> 
                {/* this should force reload but doesn't seem to */}
                <NavLink as={Link} to='/following'>Following</NavLink>
                <NavLink className='me-auto' as={Link} to='/create'>Create</NavLink>
                { activeUser ? 
                    <>
                        <NavLink as={Link} to={'/users/' + activeUser.username}>{activeUser.username}</NavLink>
                        <NavLink class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Dropdown
                        </NavLink>
                    </> : <>
                        <NavDropdown title='Test'>
                            <NavDropdown.Item eventKey="4.1">Action</NavDropdown.Item>
                            <NavDropdown.Item eventKey="4.2">Another action</NavDropdown.Item>
                            <NavDropdown.Item eventKey="4.3">Something else here</NavDropdown.Item>
                        </NavDropdown>
                        <NavLink className='justify-left' as={Link} to='/login'>Login</NavLink>
                        <NavLink as={Link} to='/login'>Signup</NavLink>
                    </> 
                    // will have to link with signup=true or something
                }
            </Nav>
        </Navbar>
    );

}

export default NavBar