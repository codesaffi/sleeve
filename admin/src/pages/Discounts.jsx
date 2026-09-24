import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { Trash2, Loader2, Search } from 'lucide-react';

const Discounts = ({ token }) => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [customerName, setCustomerName] = useState('');
    const [code, setCode] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState('');
    
    const fetchDiscounts = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/discount/list', { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                setDiscounts(response.data.discounts);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    
    useEffect(() => {
        fetchDiscounts();
    }, [token]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(backendUrl + '/api/discount/create', {
                customerName,
                code,
                discountPercentage: Number(discountPercentage)
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            if (response.data.success) {
                toast.success(response.data.message);
                setCustomerName('');
                setCode('');
                setDiscountPercentage('');
                fetchDiscounts();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
        setLoading(false);
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const response = await axios.post(backendUrl + '/api/discount/status', {
                id,
                isActive: !currentStatus
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            if (response.data.success) {
                toast.success(response.data.message);
                fetchDiscounts();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const removeDiscount = async (id) => {
        if (!window.confirm("Are you sure you want to delete this discount code?")) return;
        
        try {
            const response = await axios.post(backendUrl + '/api/discount/delete', {
                id
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            if (response.data.success) {
                toast.success(response.data.message);
                fetchDiscounts();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            <h1 className="text-2xl font-serif font-bold text-primary mb-2">Discount Codes</h1>
            
            {/* Create Form */}
            <div className="bg-white p-6 shadow-vintage vintage-border">
                <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 pb-2 border-b border-primary/20">Create New Discount</h2>
                
                <form onSubmit={onSubmitHandler} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest font-semibold text-secondary">Customer Name</label>
                        <input
                            type="text"
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="e.g. Ali Khan"
                            className="w-full bg-background border border-border px-4 py-2.5 outline-none focus:border-primary transition-all text-sm font-sans"
                        />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest font-semibold text-secondary">Discount Code</label>
                        <input
                            type="text"
                            required
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="e.g. ALI10"
                            className="w-full bg-background border border-border px-4 py-2.5 outline-none focus:border-primary transition-all text-sm font-sans uppercase"
                        />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest font-semibold text-secondary">Percentage (%)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            max="100"
                            value={discountPercentage}
                            onChange={(e) => setDiscountPercentage(e.target.value)}
                            placeholder="e.g. 10"
                            className="w-full bg-background border border-border px-4 py-2.5 outline-none focus:border-primary transition-all text-sm font-sans"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-primary text-background py-2.5 font-bold tracking-widest text-xs uppercase transition-all flex items-center justify-center h-[42px] ${loading ? 'opacity-80' : 'hover:bg-black active:scale-[0.98]'}`}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Code'}
                    </button>
                </form>
            </div>
            
            {/* List */}
            <div className="bg-white p-6 shadow-vintage vintage-border mt-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 pb-2 border-b border-primary/20">All Discount Codes</h2>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-primary bg-background/50">
                                <th className="p-3 text-xs uppercase tracking-widest font-bold text-primary whitespace-nowrap">Customer</th>
                                <th className="p-3 text-xs uppercase tracking-widest font-bold text-primary whitespace-nowrap">Code</th>
                                <th className="p-3 text-xs uppercase tracking-widest font-bold text-primary whitespace-nowrap">Discount</th>
                                <th className="p-3 text-xs uppercase tracking-widest font-bold text-primary whitespace-nowrap">Status</th>
                                <th className="p-3 text-xs uppercase tracking-widest font-bold text-primary whitespace-nowrap">Used</th>
                                <th className="p-3 text-xs uppercase tracking-widest font-bold text-primary whitespace-nowrap">Created Date</th>
                                <th className="p-3 text-xs uppercase tracking-widest font-bold text-primary whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discounts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-secondary font-sans text-sm">
                                        No discount codes found. Create one above.
                                    </td>
                                </tr>
                            ) : (
                                discounts.map((item) => (
                                    <tr key={item._id} className="border-b border-border hover:bg-black/[0.02] transition-colors font-sans text-sm">
                                        <td className="p-3 font-semibold text-primary">{item.customerName}</td>
                                        <td className="p-3">
                                            <span className="font-mono bg-black/5 px-2 py-1 border border-border text-xs font-bold text-primary">
                                                {item.code}
                                            </span>
                                        </td>
                                        <td className="p-3 font-medium">{item.discountPercentage}%</td>
                                        <td className="p-3">
                                            <button 
                                                onClick={() => toggleStatus(item._id, item.isActive)}
                                                className={`text-xs px-2 py-1 font-bold tracking-widest uppercase ${item.isActive ? 'text-green-600 bg-green-50 border border-green-200' : 'text-red-600 bg-red-50 border border-red-200'}`}
                                            >
                                                {item.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="p-3">
                                            {item.isUsed ? (
                                                <span className="text-xs px-2 py-1 font-bold tracking-widest uppercase text-secondary bg-gray-100 border border-gray-200">Yes</span>
                                            ) : (
                                                <span className="text-xs px-2 py-1 font-bold tracking-widest uppercase text-blue-600 bg-blue-50 border border-blue-200">No</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-secondary text-xs">
                                            {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="p-3 text-right">
                                            <button 
                                                onClick={() => removeDiscount(item._id)}
                                                className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-full transition-colors"
                                                title="Delete Discount"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Discounts;
