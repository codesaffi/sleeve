import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

const CartTotal = () => {
    const { currency, getCartAmount, formatPrice } = useContext(ShopContext);
    
    return (
        <div className='w-full bg-white border border-border p-6 rounded-2xl shadow-sm'>
            <div className='mb-6'>
                <h3 className='text-lg font-bold text-primary'>ORDER SUMMARY</h3>
                <div className='w-10 h-1 bg-accent rounded-full mt-2'></div>
            </div>

            <div className='flex flex-col gap-4 text-sm'>
                <div className='flex justify-between items-center text-secondary'>
                    <p>Subtotal</p>
                    <p className='font-medium text-primary'>{currency} {formatPrice(getCartAmount())}</p>
                </div>
                
                <div className='flex justify-between items-center text-secondary'>
                    <p>Shipping Fee</p>
                    <p className='font-medium text-green-600'>Free</p>
                </div>
                
                <hr className='border-border my-2' />
                
                <div className='flex justify-between items-center'>
                    <b className='text-base text-primary'>Total</b>
                    <b className='text-xl text-accent'>{currency} {formatPrice(getCartAmount())}</b>
                </div>
            </div>
        </div>
    );
};

export default CartTotal;