import React from 'react'
import App from './components/App'
import Home from './components/Home'
import Create from './components/Create'
import Login from './components/Login'
import Following from './components/Following'
import Post from './components/Post'
import Drafts from './components/Drafts'
import Profile from './components/Profile'
import About from './components/About'

const routes = [
    {
        path: '/',
        element: <App />,
        // errorElement: <Home />, // make error page
        children: [
            {
                path: '/',
                element: <Home />
            },
            {
                path: '/create',
                element: <Create />
            },
            {
                path: '/login',
                element: <Login />
            },
            {
                path: '/following', // might have to change in future
                element: <Following />
            },
            {
                path: '/post/:filename',
                element: <Post />
            },
            {
                path: '/drafts',
                element: <Drafts />
            },
            {
                path: '/profile/:id',
                element: <Profile />
            },
            {
                path: '/about',
                element: <About />
            }
        ]
    }
];

export default routes;
