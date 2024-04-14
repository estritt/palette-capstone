import './App.css';
import React from 'react'; //this is supposed to import automatically in this version but doesn't
import { Outlet, useNavigate } from 'react-router-dom'
import NavBar from './NavBar'
// import Home from './Home'
// import Create from './Create'
// import Login from './Login'
// import Following from './Following'
// import Artwork from './Artwork'
// import Drafts from './Drafts'
// import Profile from './Profile'
// import About from './About'
import { AuthProvider } from './AuthContext';

// there is a ton of repetitive element-specific styling done with bootstrap. a css page would help

function App() {
  return (
    <AuthProvider>
      <NavBar />
      <Outlet />
    </AuthProvider>
  )
}

export default App;

/* <AuthProvider>
    <Router>
      <div className='site-content'>
        <Navbar />
        <div className='main-content'>
          <Switch>
            <Route exact path='/'>
              <Home />
            </Route>
            <Route path='/create'>
              <Create />
            </Route>
            <Route path='/login'>
              <Login />
            </Route>
            <Route path='/following'>
              <Following />
            </Route>
            <Route path='/artwork'>
              <Artwork />
            </Route>
            <Route path='/drafts'>
              <Drafts />
            </Route>
            <Route path='/profile'>
              <Profile />
            </Route>
            <Route path='/about'>
              <About />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  </AuthProvider> */