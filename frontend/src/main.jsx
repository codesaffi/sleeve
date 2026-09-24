import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Contact from './pages/Contact.jsx'
import ShopContextProvider from './context/ShopContext.jsx'
import Collection from './pages/Collection.jsx'
import About from './pages/About.jsx'
import Product from './pages/Product.jsx'
import Cart from './pages/Cart.jsx'
import Login from './pages/Login.jsx'
import PlaceOrder from './pages/PlaceOrder.jsx'
import Orders from './pages/Orders.jsx'
import Profile from './pages/Profile.jsx'
import OrderVerify from './pages/OrderVerify.jsx'
import Gallery from './pages/Gallery.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/collection",
        element: <Collection />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/product/:productId",
        element: <Product />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/place-order",
        element: <PlaceOrder />,
      },
      {
        path: "/orders",
        element: <Orders />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      // New routes
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/verify-order",
        element: <OrderVerify />,
      },
      {
        path: "/gallery",
        element: <Gallery />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <ShopContextProvider>
   <RouterProvider router={router} />
   </ShopContextProvider>
);


