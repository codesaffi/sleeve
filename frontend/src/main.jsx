import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ShopContextProvider from './context/ShopContext.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        lazy: async () => ({ Component: (await import('./pages/Home.jsx')).default }),
      },
      {
        path: "/collection",
        lazy: async () => ({ Component: (await import('./pages/Collection.jsx')).default }),
      },
      {
        path: "/about",
        lazy: async () => ({ Component: (await import('./pages/About.jsx')).default }),
      },
      {
        path: "/product/:productId",
        lazy: async () => ({ Component: (await import('./pages/Product.jsx')).default }),
      },
      {
        path: "/cart",
        lazy: async () => ({ Component: (await import('./pages/Cart.jsx')).default }),
      },
      {
        path: "/login",
        lazy: async () => ({ Component: (await import('./pages/Login.jsx')).default }),
      },
      {
        path: "/place-order",
        lazy: async () => ({ Component: (await import('./pages/PlaceOrder.jsx')).default }),
      },
      {
        path: "/orders",
        lazy: async () => ({ Component: (await import('./pages/Orders.jsx')).default }),
      },
      {
        path: "/contact",
        lazy: async () => ({ Component: (await import('./pages/Contact.jsx')).default }),
      },
      {
        path: "/profile",
        lazy: async () => ({ Component: (await import('./pages/Profile.jsx')).default }),
      },
      {
        path: "/verify-order",
        lazy: async () => ({ Component: (await import('./pages/OrderVerify.jsx')).default }),
      },
      {
        path: "/gallery",
        lazy: async () => ({ Component: (await import('./pages/Gallery.jsx')).default }),
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <ShopContextProvider>
   <RouterProvider router={router} />
   </ShopContextProvider>
);
