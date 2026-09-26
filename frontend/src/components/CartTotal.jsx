import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

const CartTotal = ({ discountPercentage = 0, discountAmount = 0 }) => {
    const { currency, getCartAmount, formatPrice } = useContext(ShopContext);
    
    const subtotal = getCartAmount();
    const total = subtotal - discountAmount;
    
    return (
        <div className='coupon-paper w-full bg-white border border-border p-6 shadow-vintage'>
            <div className='mb-6'>
                <h3 className='text-lg font-bold text-primary'>ORDER SUMMARY</h3>
                <div className='w-10 h-1 bg-accent rounded-full mt-2'></div>
            </div>

            <div className='flex flex-col gap-4 text-sm'>
                <div className='flex justify-between items-center text-secondary'>
                    <p>Subtotal</p>
                    <p className='font-medium text-primary'>{currency} {formatPrice(subtotal)}</p>
                </div>
                
                <div className='flex justify-between items-center text-secondary'>
                    <p>Shipping Fee</p>
                    <p className='font-medium text-green-600'>Free</p>
                </div>

                {discountAmount > 0 && (
                    <div className='flex justify-between items-center text-green-600'>
                        <p>Discount ({discountPercentage}%)</p>
                        <p className='font-medium'>- {currency} {formatPrice(discountAmount)}</p>
                    </div>
                )}
                
                <hr className='border-border my-2' />
                
                <div className='flex justify-between items-center'>
                    <b className='text-base text-primary'>Total</b>
                    <b className='text-xl text-accent'>{currency} {formatPrice(total)}</b>
                </div>
            </div>
        </div>
    );
};

export default CartTotal;