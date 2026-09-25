import axios from 'axios';
import { backendUrl, currency } from '../App';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Package, User, MapPin, Calendar, CreditCard, ChevronDown, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Orders = ( {token} ) => {
  const [orders, setOrders] = useState([]);
  
  const [reportType, setReportType] = useState('daily');
  const [reportDate, setReportDate] = useState('');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportMonth, setReportMonth] = useState('');
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }
    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, {headers:{token}});
       if (response.data.success) {
        setOrders(response.data.orders.reverse());
       } else {
        toast.error(response.data.message);
       }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const statusHandler = async ( event, orderId ) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/status', {orderId, status:event.target.value}, {headers:{token}});
      if (response.data.success) {
        await fetchAllOrders();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Order Placed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Packing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Out for delivery': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const downloadOrderPDF = async (payload) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/report-pdf', payload, {
        headers: { token },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${payload.type}-report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  const handleGenerateReport = () => {
    if (reportType === 'daily' && !reportDate) return toast.error("Please select a date");
    if (reportType === 'weekly' && (!reportStartDate || !reportEndDate)) return toast.error("Please select start and end dates");
    if (reportType === 'monthly' && (!reportMonth || !reportYear)) return toast.error("Please select month and year");
    
    downloadOrderPDF({
      type: reportType,
      date: reportDate,
      startDate: reportStartDate,
      endDate: reportEndDate,
      month: reportMonth,
      year: reportYear
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl w-full font-sans"
    >
      <div className="flex items-end justify-between border-b-2 border-primary pb-2 mb-6">
        <h2 className="text-3xl font-serif font-bold text-primary tracking-tighter uppercase">Dispatch <span className="italic">Ledger</span></h2>
        <div className="flex items-center gap-4 bg-white border border-primary px-3 py-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] self-start sm:self-auto">
          <span className="w-1.5 h-1.5 bg-black animate-pulse"></span>
          <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">{orders.length} Active Dispatches</span>
        </div>
      </div>

      {/* Reports Section */}
      <div className="bg-white p-4 sm:p-6 border-2 border-primary shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] mb-8">
        <h3 className="text-[10px] font-mono font-bold text-primary mb-4 uppercase tracking-widest border-b border-primary/40 pb-2">Generate Archival Reports</h3>
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end flex-wrap">
          <div>
            <label className="block text-[10px] font-mono font-bold text-primary uppercase tracking-widest mb-1">Report Interval</label>
            <select 
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="bg-transparent border-b-2 border-t-0 border-l-0 border-r-0 border-primary px-0 py-2 outline-none focus:border-black text-primary font-mono text-sm uppercase"
            >
              <option value="daily">Daily Print</option>
              <option value="weekly">Weekly Print</option>
              <option value="monthly">Monthly Print</option>
            </select>
          </div>

          {reportType === 'daily' && (
            <div>
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">Date</label>
              <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="bg-background border border-border rounded-xl px-4 py-2 outline-none focus:border-accent" />
            </div>
          )}

          {reportType === 'weekly' && (
            <>
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">Start Date</label>
                <input type="date" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)} className="bg-background border border-border rounded-xl px-4 py-2 outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">End Date</label>
                <input type="date" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)} className="bg-background border border-border rounded-xl px-4 py-2 outline-none focus:border-accent" />
              </div>
            </>
          )}

          {reportType === 'monthly' && (
            <>
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">Month</label>
                <select value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className="bg-background border border-border rounded-xl px-4 py-2 outline-none focus:border-accent">
                  <option value="">Select</option>
                  {[...Array(12).keys()].map(i => <option key={i+1} value={i+1}>{i+1}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">Year</label>
                <input type="number" value={reportYear} onChange={(e) => setReportYear(e.target.value)} className="bg-background border border-border rounded-xl px-4 py-2 outline-none focus:border-accent w-24" />
              </div>
            </>
          )}

          <button 
            onClick={handleGenerateReport}
            className="w-full md:w-auto bg-primary hover:bg-black text-white px-6 py-2 border border-primary text-[10px] font-mono font-bold tracking-widest uppercase transition-transform hover:-translate-y-1 active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] active:shadow-none flex items-center justify-center gap-2 h-[42px] mt-2 md:mt-0"
          >
            <Download size={14} /> EXPORT LEDGER
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <AnimatePresence>
          {orders.map((order, index) => (
            <motion.div 
              key={index}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-primary shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] overflow-hidden"
            >
              {/* Order Header */}
              <div className="bg-[#FAF9F6] border-b border-primary/40 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 halftone-bg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border border-primary flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                    <Package size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest mb-1 border-b border-primary/40 pb-0.5">Dispatch ID</p>
                    <p className="font-mono text-sm text-primary font-bold tracking-widest">{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest mb-1 border-b border-primary/40 pb-0.5 sm:border-b-0">Total Due</p>
                    <p className="text-lg font-mono font-bold text-primary">{currency}{new Intl.NumberFormat('en-PK').format(order.amount)}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 relative w-full sm:w-auto">
                    <div className="relative">
                      <select 
                        onChange={(event) => statusHandler(event, order._id)} 
                        value={order.status} 
                        className={`appearance-none outline-none font-mono font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 pr-8 border border-primary cursor-pointer transition-colors w-full bg-white text-primary`}
                      >
                        <option value="Order Placed">LOGGED</option>
                        <option value="Packing">ARCHIVING</option>
                        <option value="Shipped">DISPATCHED</option>
                        <option value="Out for delivery">IN TRANSIT</option>
                        <option value="Delivered">CONFIRMED</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary" />
                    </div>
                    <button 
                      onClick={() => downloadOrderPDF({ type: 'single', orderId: order._id })}
                      className="w-full sm:w-auto bg-primary hover:bg-black text-white text-[10px] font-mono font-bold tracking-widest uppercase px-4 py-2.5 border border-primary transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={14} /> PRINT
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Items */}
                <div className="col-span-1 md:col-span-1">
                  <h4 className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-primary/40 pb-2">
                    <Package size={14} /> Ledger Items ({order.items.length})
                  </h4>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => {
                      const sizeText = item.size && item.size !== "Default" ? `| FORMAT: ${item.size}` : "";
                      return (
                        <div key={idx} className="flex flex-col gap-1 items-start mb-2">
                          <p className="text-sm font-serif font-bold text-primary leading-snug uppercase">
                            {item.name} 
                            <span className="text-primary/80 text-[10px] font-mono ml-2">QTY: {item.quantity} {sizeText}</span>
                          </p>
                          {item.designSource && (
                            <div className="text-[10px] font-mono text-primary/80 bg-black/5 px-2 py-1 border border-primary/20">
                              <span className="font-bold uppercase tracking-widest">{item.designSource}:</span>{' '}
                              {item.galleryImage && (
                                <img src={item.galleryImage} alt={item.galleryTitle || "Selected design"} className="w-12 h-12 object-cover inline-block align-middle border border-primary/30 ml-1" />
                              )}
                              {item.galleryTitle && <span className="ml-1">{item.galleryTitle}</span>}
                              {item.customImageUrl && (
                                <a href={item.customImageUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline ml-1">
                                  [View Image]
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="col-span-1 md:col-span-1 border-t border-primary/40 md:border-t-0 md:border-l md:border-primary/40 mt-6 pt-6 md:mt-0 md:pl-8 md:pt-0">
                  <h4 className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-primary/40 pb-2">
                    <User size={14} /> Recipient
                  </h4>
                  <p className="font-bold font-serif uppercase text-primary mb-3">{order.address.firstName} {order.address.lastName}</p>
                  
                  <div className="flex items-start gap-2 text-xs font-mono text-primary mb-2">
                    <MapPin size={14} className="shrink-0 mt-0.5" />
                    <p className="uppercase">
                      {order.address.street}<br/>
                      {order.address.city}, {order.address.state}<br/>
                      {order.address.country}, {order.address.zipcode}
                    </p>
                  </div>
                  <p className="text-xs font-mono text-primary ml-6 break-all tracking-widest">{order.address.phone}</p>
                </div>

                {/* Payment & Status Info */}
                <div className="col-span-1 md:col-span-1 border-t border-primary/40 md:border-t-0 md:border-l md:border-primary/40 mt-6 pt-6 md:mt-0 md:pl-8 md:pt-0">
                  <h4 className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-primary/40 pb-2">
                    <CreditCard size={14} /> Processing
                  </h4>
                  
                  <div className="space-y-3 text-[10px] font-mono tracking-widest uppercase">
                    <div className="flex justify-between items-center">
                      <span className="text-primary/80">Method</span>
                      <span className="font-bold text-primary">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-primary/80">Settlement</span>
                      <span className={`font-bold px-2 py-0.5 border ${order.payment ? 'bg-black text-white border-black' : 'bg-transparent text-primary border-primary'}`}>
                        {order.payment ? 'CLEARED' : 'PENDING'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-primary/80 flex items-center gap-1.5"><Calendar size={12} /> Log Date</span>
                      <span className="font-bold text-primary">{new Date(order.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {orders.length === 0 && (
          <div className="bg-white p-12 border-2 border-primary shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] flex flex-col items-center justify-center text-primary">
            <Package size={48} className="opacity-20 mb-4" />
            <p className="text-sm font-mono font-bold uppercase tracking-widest">No active dispatches</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Orders;