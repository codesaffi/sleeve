import { useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { initializeMetaPixel, trackPageView } from "./utils/metaPixel";

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const adminUrl = import.meta.env.VITE_ADMIN_URL

function App() {
  const location = useLocation();

  useEffect(() => {
    initializeMetaPixel();
    trackPageView(`${location.pathname}${location.search}${location.hash}`);
  }, [location.pathname, location.search, location.hash]);

  return (

<div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
  <ToastContainer position="top-right" newestOnTop closeOnClick pauseOnFocusLoss draggable />
     <Navbar />
     <SearchBar />
     <Outlet/>
     <Footer />
    </div>

  )
}

export default App
