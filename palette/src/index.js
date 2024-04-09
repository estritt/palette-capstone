import React from 'react';
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import routes from './routes'

import App from './components/App';
// import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.scss';

const router = createBrowserRouter(routes);

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<RouterProvider router={router} />);