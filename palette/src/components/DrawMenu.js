import React from 'react';
import { Container, Button, Dropdown, DropdownButton, Form, Nav, Image, NavLink, Stack, Col, Row, NavDropdown } from 'react-bootstrap';

function DrawMenu({ setPrimaryColor, setLineWidth, setLineOpacity }) {

    return (
        <Container className='d-flex p-1 align-items-center'>
            <DropdownButton title="File">
                <Dropdown.Item>Take 1</Dropdown.Item>
            </DropdownButton>
            <Button>
                <input 
                    type='color'
                    onChange={e => setPrimaryColor(e.target.value)}
                />
            </Button>
            <label>Brush thickness</label>
            <input 
                type="range"
                min="3"
                max="20"
                defaultValue='5'
                onChange={(e) => { 
                    setLineWidth(e.target.value); 
                }} 
            /> 
            <label>Brush Opacity</label> 
            <input 
                type="range"
                min="1"
                max="100"
                defaultValue='100'
                onChange={(e) => { 
                    setLineOpacity(e.target.value / 100); 
                }} 
            /> 
        </Container>
    )

}

export default DrawMenu;