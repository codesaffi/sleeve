import axios from 'axios';
import React, { useEffect, useState, useMemo } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { Trash2, TrendingUp, Package, Tag, MessageSquarePlus } from 'lucide-react';
import AdminAddReviewModal from '../components/AdminAddReviewModal';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const List = ({token}) => {
  const [list, setList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingStock, setEditingStock] = useState({ id: null, value: "" });

  const fetchList = async () => { 
    try {
      const response = await axios.get(backendUrl + '/api/product/list');
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', {id}, {headers:{token}});
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleStockUpdate = async (id) => {
    try {
      const response = await axios.post(backendUrl + '/api/product/editStock', { id, stock: Number(editingStock.value) }, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        setEditingStock({ id: null, value: "" });
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const downloadInventoryPDF = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/inventory-pdf', {
        headers: { token },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  // Compute analytics data for Recharts (map legacy categories to gaming categories)
  const chartData = useMemo(() => {
    const mapped = {
      'Cooling Devices': 0,
      'Controllers': 0,
      'Gaming Accessories': 0
    };

    const mapCategoryName = (cat) => {
      switch (cat) {
        case 'Men':
        case 'Cooling Devices':
          return 'Cooling Devices';
        case 'Women':
        case 'Controllers':
          return 'Controllers';
        case 'Unisex':
        case 'Accessories':
        case 'Gaming Accessories':
          return 'Gaming Accessories';
        default:
          return cat;
      }
    };

    list.forEach(p => {
      const name = mapCategoryName(p.category);
      if (mapped[name] !== undefined) mapped[name]++;
    });

    return [
      { name: 'Cooling Devices', count: mapped['Cooling Devices'] },
      { name: 'Controllers', count: mapped['Controllers'] },
      { name: 'Gaming Accessories', count: mapped['Gaming Accessories'] }
    ];
  }, [list]);

  const mapCategory = (cat) => {
    switch (cat) {
      case "Men":
      case "Cooling Devices":
        return "Cooling Devices";
      case "Women":
      case "Controllers":
        return "Controllers";
      case "Unisex":
      case "Accessories":
      case "Gaming Accessories":
        return "Gaming Accessories";
      default: return cat;
    }
  };

  return (
    <>
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl w-full font-sans"
    >
      <div className="flex items-end justify-between border-b-2 border-primary pb-2 mb-6">
        <h2 className="text-3xl font-serif font-bold text-primary tracking-tighter uppercase">Archive <span className="italic">Ledger</span></h2>
        <div className="text-[10px] font-mono tracking-widest text-primary uppercase border border-primary px-2 py-1 bg-white">LEDGER 02-B</div>
      </div>

      {/* Dashboard Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#FAF9F6] p-6 border-2 border-primary shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] flex items-center justify-between">
          <div>
            <p className="text-primary text-[10px] font-mono font-bold uppercase tracking-widest mb-1 border-b border-primary/40 pb-1">Total Entries</p>
            <h3 className="text-5xl font-serif font-extrabold text-primary">{list.length}</h3>
          </div>
          <div className="w-16 h-16 border-2 border-primary rounded-full flex items-center justify-center bg-white shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <Package size={24} className="text-primary" />
          </div>
        </div>
        
        <div className="bg-[#FAF9F6] p-6 border-2 border-primary shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] flex items-center justify-between">
          <div>
            <p className="text-primary text-[10px] font-mono font-bold uppercase tracking-widest mb-1 border-b border-primary/40 pb-1">Categories</p>
            <h3 className="text-5xl font-serif font-extrabold text-primary">3</h3>
          </div>
          <div className="w-16 h-16 border-2 border-primary rounded-full flex items-center justify-center bg-white shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <Tag size={24} className="text-primary" />
          </div>
        </div>
        
        <div className="bg-[#FAF9F6] p-6 border-2 border-primary shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-center h-[120px] relative halftone-bg">
          <p className="text-primary text-[10px] font-mono font-bold uppercase tracking-widest mb-2 border-b border-primary/40 pb-1 z-10 bg-[#FAF9F6] px-1">Inventory Distribution</p>
          <div className="h-full w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#1a1a1a', fontFamily: 'monospace'}} axisLine={{stroke: '#1a1a1a'}} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(26,26,26,0.1)'}} contentStyle={{borderRadius: '0', border: '2px solid #1a1a1a', boxShadow: '4px 4px 0px 0px rgba(26,26,26,1)', backgroundColor: '#FAF9F6', fontFamily: 'monospace', fontSize: '10px'}} />
                <Bar dataKey="count" radius={[0, 0, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#1a1a1a' : index === 1 ? '#4a4a4a' : '#8a8a8a'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Product List */}
      <div className="bg-white border-2 border-primary shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden w-full">
        <div className="p-4 sm:p-6 border-b-2 border-primary flex flex-wrap justify-between items-center gap-4 bg-[#FAF9F6]">
          <h2 className="text-xl font-serif font-bold text-primary uppercase tracking-tighter">Inventory Ledger</h2>
          <button 
            onClick={downloadInventoryPDF}
            className="w-full sm:w-auto bg-primary hover:bg-black text-white px-4 py-2 text-[10px] font-mono font-bold tracking-widest transition-transform shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:-translate-y-1 active:translate-y-1 active:shadow-none border border-primary flex justify-center items-center uppercase"
          >
            PRINT INVENTORY LOG
          </button>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="bg-white border-b-2 border-primary">
                <th className="px-6 py-4 text-[10px] font-mono font-bold text-primary uppercase tracking-widest border-r border-primary/40">Product</th>
                <th className="px-6 py-4 text-[10px] font-mono font-bold text-primary uppercase tracking-widest border-r border-primary/40">Category</th>
                <th className="px-6 py-4 text-[10px] font-mono font-bold text-primary uppercase tracking-widest border-r border-primary/40">Price</th>
                <th className="px-6 py-4 text-[10px] font-mono font-bold text-primary uppercase tracking-widest border-r border-primary/40">Stock</th>
                <th className="px-6 py-4 text-[10px] font-mono font-bold text-primary uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/20 bg-[#FAF9F6]">
              <AnimatePresence>
                {list.map((item) => (
                  <motion.tr 
                    key={item._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-white transition-colors group"
                  >
                    <td className="px-6 py-4 border-r border-primary/40">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-primary p-1 shrink-0 overflow-hidden shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                          <img className="w-full h-full object-cover grayscale-[0.2] contrast-125 sepia-[0.1]" src={item.image[0]} alt={item.name} />
                        </div>
                        <span className="font-bold font-serif text-primary text-sm line-clamp-2 max-w-[250px] uppercase">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r border-primary/40">
                      <span className="inline-flex px-2 py-0.5 border border-primary bg-white text-primary text-[10px] font-mono font-bold tracking-widest uppercase">
                        {mapCategory(item.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-r border-primary/40">
                      <span className="font-bold text-primary font-mono text-sm">{currency}{new Intl.NumberFormat('en-PK').format(item.price)}</span>
                    </td>
                    <td className="px-6 py-4 border-r border-primary/40">
                      <div className="flex flex-col gap-1">
                        {editingStock.id === item._id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={editingStock.value}
                              onChange={(e) => setEditingStock({ ...editingStock, value: e.target.value })}
                              className="w-16 px-2 py-1 border border-primary bg-white text-sm font-mono outline-none focus:border-black"
                            />
                            <button onClick={() => handleStockUpdate(item._id)} className="text-[10px] text-primary bg-white border border-primary font-mono px-2 py-1 uppercase tracking-widest hover:bg-black hover:text-white transition-colors">SAVE</button>
                            <button onClick={() => setEditingStock({ id: null, value: "" })} className="text-[10px] text-primary/80 hover:text-primary font-mono uppercase tracking-widest">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-mono text-primary">{item.stock || 0}</span>
                            <button onClick={() => setEditingStock({ id: item._id, value: item.stock || 0 })} className="text-[10px] font-mono text-primary/80 hover:text-primary underline uppercase tracking-widest">Edit</button>
                          </div>
                        )}
                        <span className={`text-[10px] font-bold font-mono uppercase tracking-widest ${(item.stock || 0) > 0 ? 'text-primary' : 'text-primary/80'}`}>
                          {(item.stock || 0) > 0 ? 'IN STOCK' : 'DEPLETED'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedProduct(item)}
                          className="w-8 h-8 flex items-center justify-center border border-primary text-primary hover:bg-black hover:text-white transition-colors"
                          title="Add Review"
                        >
                          <MessageSquarePlus size={14} />
                        </button>
                        <button 
                          onClick={() => removeProduct(item._id)}
                          className="w-8 h-8 flex items-center justify-center border border-primary text-primary hover:bg-black hover:text-white transition-colors"
                          title="Remove Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {list.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-primary font-mono text-xs uppercase tracking-widest opacity-50">
                    ARCHIVE IS EMPTY
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>

    {/* Admin Add Review Modal */}
    {selectedProduct && (
      <AdminAddReviewModal
        product={selectedProduct}
        token={token}
        onClose={() => setSelectedProduct(null)}
        onSuccess={() => setSelectedProduct(null)}
      />
    )}
  </>
  );
};

export default List;