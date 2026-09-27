import { Outlet } from "react-router-dom";
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const adminUrl = import.meta.env.VITE_ADMIN_URL

function App() {

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
