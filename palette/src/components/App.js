import './App.css';
import React from 'react'; //this is supposed to import automatically in this version but doesn't
import Navbar from './Navbar'
import Home from './Home'
import Create from './Create'
import Login from './Login'
import Following from './Following'
import Painting from './Painting'
import Drafts from './Drafts'
import Profile from './Profile'
import About from './About'

function App() {
  return (
    <AuthProvider>
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
              <Route path='/painting'>
                <Painting />
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
    </AuthProvider>
  );
}

export default App;
