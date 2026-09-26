import React from 'react';

const Title = ({text1, text2}) => {
  return (
    <div className='flex flex-col items-center mb-12 text-center w-full relative'>
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-primary/20 -z-10"></div>
        <div className="absolute top-[calc(50%+4px)] left-0 w-full h-[1px] bg-primary/20 -z-10"></div>
        <div className="bg-background px-6 py-2 border-2 border-primary shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <h2 className='text-3xl md:text-5xl font-serif text-primary tracking-tighter uppercase'>
              {text1} <span className='italic'>{text2}</span>
          </h2>
        </div>
        <div className="mt-4 text-[10px] font-mono tracking-[0.3em] text-primary">★ THE ARCHIVE ★</div>
    </div>
  );
};

export default Title;