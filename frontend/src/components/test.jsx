import React, { useState, useEffect } from 'react';
import { assets } from '../assets/frontend_assets/assets';

const Hero = () => {
  const [currentVideo, setCurrentVideo] = useState(0);
//   const videos = [assets.slide_1, assets.slide_2];
  const videos = ["/videos/IMG_5962.MP4","/videos/IMG_5975.MP4"];
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length);
    }, 5000); // Change video every 5 seconds

    return () => clearInterval(interval);
  }, [videos.length]);

  return (
    <div className='w-full border border-gray-400 flex justify-center items-center'>
      <video
        src={videos[currentVideo]}
        autoPlay
        muted
        loop
        playsInline
        controls
        className='w-full h-auto object-cover'
      />
    </div>
  );
};

export default Hero;