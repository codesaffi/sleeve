import React from 'react';
import { Send } from 'lucide-react';

const NewsLetterBox = () => {
    const onSubmitHandler = (event) => {
        event.preventDefault();
    };

    return (
        <div className='max-w-4xl mx-auto my-24 px-4'>
            <div className='bg-background vintage-border p-8 md:p-16 text-center relative shadow-vintage'>
                <div className='relative z-10'>
                    <h2 className='text-3xl md:text-5xl font-serif text-primary mb-4 tracking-tight'>
                        Join the <span className="italic text-accent">Archive.</span>
                    </h2>
                    <p className='text-secondary max-w-lg mx-auto mb-8 text-sm md:text-base leading-relaxed'>
                        Subscribe to our newsletter for exclusive access to rare album drops, artist highlights, and get 10% off your first framed poster.
                    </p>
                    
                    <form onSubmit={onSubmitHandler} className='w-full sm:w-2/3 lg:w-1/2 mx-auto flex flex-col sm:flex-row items-center gap-0 border border-border'>
                        <input 
                            className='w-full bg-background outline-none text-primary placeholder:text-secondary px-4 py-3 text-sm md:text-base border-r-0 sm:border-r border-border focus:ring-0 focus:outline-none' 
                            type="email" 
                            placeholder='Enter your email address' 
                            required 
                        />
                        <button 
                            type='submit' 
                            className='w-full sm:w-auto bg-primary hover:bg-black text-background font-medium px-8 py-3 transition-colors flex items-center justify-center gap-2 whitespace-nowrap'
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewsLetterBox;