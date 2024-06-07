// import { useEffect } from "react";
import React from 'react';
import { Navbar, Button, Form, Nav, Image, NavLink, Stack, Col, Row, NavDropdown } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';

import { useAuth } from './AuthContext.js';

function NavBar() {

    const { activeUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <Navbar bg='primary' data-bs-theme='light' className='d-flex justify-content-between px-2' sticky='top'>
            {/* these don't have to both be flexboxes in the current state */}
            <Nav className="fs-4 flex-grow-1 my-2 my-lg-0" style={{ maxHeight: '100px' }}>
                
                {/* I'd use Navbar.Brand but it breaks custom styling */}
                <NavLink as={Link} to='/'><img className='position-absolute top-' style={{ transform: 'translateY(-7%)', maxHeight: '40px' }} src='/logo.png'/></NavLink>
                <NavLink as={Link} to='/' className='ps-5'>Palette</NavLink> 
                
                {/* home link doesn't force reload but should */}
                {activeUser && <NavLink as={Link} to='/following'>Following</NavLink>}
                <NavLink className={activeUser || 'me-auto'} as={Link} to='/create'>Create</NavLink>
                {activeUser && <NavLink className='me-auto' as={Link} to='/drafts'>Drafts</NavLink>}
                {activeUser ? 
                    <>
                    {/* not a great way to get url */}
                        <NavLink as={Link} to={'/profile/' + activeUser.url.self.split("=")[1]}>{activeUser.username}</NavLink> 
                        <div className='px-3 d-flex align-items-center'> 
                        {/* makes button less tall */}
                            <Button onClick={handleLogout} size='sm' variant='danger' style={{'color': 'white'}}>Logout</Button>
                        </div>
                    </> : <>
                        <NavLink className='justify-left' as={Link} to='/login'>Login</NavLink>
                        <NavLink as={Link} to='/login/true'>Signup</NavLink>
                    </> 
                    // will have to link with signup=true or something
                }
            </Nav>
        </Navbar>
    );

}

export default NavBar