import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Route, Routes } from 'react-router-dom' 
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import Discounts from './pages/Discounts'
import Gallery from './pages/Gallery'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = 'Rs.'

const App = () => {

  const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):'');
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(()=>{
    localStorage.setItem('token',token)
  },[token])

  return (
    <div className='admin-shell bg-background halftone-bg min-h-screen text-primary'>
      <ToastContainer />
      {token === ''
      ? <Login setToken={setToken} />
      :       <>
      <Navbar setToken={setToken} setShowSidebar={setShowSidebar} />
      <div className='flex w-full'>
        <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
        <div className='w-full md:w-[70%] mx-auto md:ml-[max(5vw,25px)] my-4 md:my-8 px-4 md:px-0 text-primary text-base pb-10'>
          <Routes>
            <Route path='/add' element={<Add token={token} />} />
            <Route path='/list' element={<List token={token} />} />
            <Route path='/orders' element={<Orders token={token} />} />
            <Route path='/discounts' element={<Discounts token={token} />} />
            <Route path='/gallery' element={<Gallery token={token} />} />
          </Routes>
        </div>
      </div>
      </>
      }

    </div>
  )
}

export default App
