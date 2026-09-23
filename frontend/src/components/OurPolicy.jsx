import React from 'react'
import { assets } from '../assets/frontend_assets/assets'

const OurPolicy = () => {
  return (
    <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-primary'>

     <div>
        <img src={assets.exchange_icon} className='w-12 m-auto mb-5 grayscale opacity-80' alt="" />
        <p className='font-semibold'>Authenticity Guarantee</p>
        <p className='text-secondary'>All our vintage prints are certified</p>
     </div>
     <div>
        <img src={assets.quality_icon} className='w-12 m-auto mb-5 grayscale opacity-80' alt="" />
        <p className='font-semibold'>14 Days Return</p>
        <p className='text-secondary'>We provide a 14-day free return policy</p>
     </div>
     <div>
        <img src={assets.support_img} className='w-12 m-auto mb-5 grayscale opacity-80' alt="" />
        <p className='font-semibold'>Curator Support</p>
        <p className='text-secondary'>Speak with our album art experts</p>
     </div>

    </div>
  )
}

export default OurPolicy