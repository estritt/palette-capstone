import './App.css';
import React from 'react'; //this is supposed to import automatically in this version but doesn't
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom'
import NavBar from './NavBar'
import { AuthProvider } from './AuthContext';

// there is a ton of repetitive element-specific styling done with bootstrap. the css page could help

function App() {
  return (
    <AuthProvider>
      <NavBar />
      <Outlet />
    </AuthProvider>
  )
}

export default App;