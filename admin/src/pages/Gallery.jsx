import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { Trash2, Loader2, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const Gallery = ({ token }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [files, setFiles] = useState([]);
    const [category, setCategory] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fileInputKey, setFileInputKey] = useState(0);
    const previewUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

    useEffect(() => () => previewUrls.forEach((url) => URL.revokeObjectURL(url)), [previewUrls]);
    
    const fetchImages = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/gallery/list');
            if (response.data.success) {
                setImages(response.data.images);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    
    useEffect(() => {
        fetchImages();
    }, [token]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        const normalizedCategory = category.trim();
        if (!normalizedCategory) {
            toast.error("Please enter a category name");
            return;
        }
        if (files.length === 0) {
            toast.error("Please select at least one image");
            return;
        }
        if (files.length > 10) {
            toast.error("You can upload a maximum of 10 images at a time.");
            return;
        }
        
        setLoading(true);
        try {
            const formData = new FormData();
            files.forEach((file) => formData.append("images", file));
            formData.append("category", normalizedCategory);
            formData.append("title", title);
            formData.append("description", description);
            
            const response = await axios.post(backendUrl + '/api/gallery/add', formData, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            
            if (response.data.success) {
                toast.success(response.data.message);
                setFiles([]);
                setCategory('');
                setTitle('');
                setDescription('');
                setFileInputKey((key) => key + 1);
                fetchImages();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const onFilesSelected = (event) => {
        const selectedFiles = Array.from(event.target.files || []);
        if (selectedFiles.length > 10) {
            toast.error("You can upload a maximum of 10 images at a time.");
        }
        setFiles(selectedFiles);
    };

    const removeImage = async (id) => {
        if (!window.confirm("Are you sure you want to delete this gallery image?")) return;
        
        try {
            const response = await axios.post(backendUrl + '/api/gallery/remove', {
                id
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            if (response.data.success) {
                toast.success(response.data.message);
                fetchImages();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full max-w-5xl font-sans">
            <h1 className="text-3xl font-serif font-bold text-primary mb-2 uppercase tracking-tighter border-b-2 border-primary pb-2">Gallery <span className="italic font-normal">Archive</span></h1>
            
            {/* Create Form */}
            <div className="bg-[#FAF9F6] p-6 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] border-2 border-primary relative">
                <div className="absolute top-4 right-4 text-[10px] font-mono tracking-widest text-primary uppercase border border-primary px-2 py-1 bg-white">UPLOAD 10</div>
                <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary mb-6 pb-2 border-b border-primary/40">Upload Gallery Images</h2>
                
                <form onSubmit={onSubmitHandler} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    
                    <div className="md:col-span-1">
                        <p className="text-[10px] font-mono font-bold text-primary mb-2 uppercase tracking-widest">Select Images</p>
                        <label htmlFor="gallery-images" className="cursor-pointer group block">
                            <div className="w-full min-h-32 border-2 border-dashed border-primary/40 bg-white group-hover:border-primary group-hover:bg-black/5 flex flex-col items-center justify-center gap-2 p-4 transition-all">
                                <Upload size={24} className="text-primary/60" />
                                <span className="text-xs font-bold uppercase tracking-widest text-primary">Choose Images</span>
                                <span className="text-[10px] text-primary/60">Maximum 10 images</span>
                            </div>
                            <input
                                key={fileInputKey}
                                onChange={onFilesSelected}
                                type="file"
                                id="gallery-images"
                                accept="image/*"
                                multiple
                                hidden
                            />
                        </label>
                        <p className={`mt-2 text-xs font-mono ${files.length > 10 ? 'text-red-600' : 'text-primary/70'}`}>
                            Selected Images: {files.length}/10
                        </p>
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-4">
                        {previewUrls.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {previewUrls.map((url, index) => (
                                    <img key={url} src={url} alt={`Selected gallery image ${index + 1}`} className="w-full aspect-square object-cover border border-primary" />
                                ))}
                            </div>
                        )}

                        <div>
                            <label className="text-[10px] font-mono font-bold text-primary mb-1 block uppercase tracking-widest">Category Name</label>
                            <input
                                type="text"
                                required
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="e.g. Arctic Monkeys"
                                className="w-full bg-transparent border-b-2 border-t-0 border-l-0 border-r-0 border-primary px-0 py-2 outline-none focus:border-black focus:ring-0 transition-all text-primary font-serif text-lg placeholder:text-primary/30"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-mono font-bold text-primary mb-1 block uppercase tracking-widest">Title (Optional)</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Vintage 70s Rock Poster"
                                className="w-full bg-transparent border-b-2 border-t-0 border-l-0 border-r-0 border-primary px-0 py-2 outline-none focus:border-black focus:ring-0 transition-all text-primary font-serif text-lg placeholder:text-primary/30"
                            />
                        </div>
                        
                        <div>
                            <label className="text-[10px] font-mono font-bold text-primary mb-1 block uppercase tracking-widest">Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the aesthetic..."
                                className="w-full h-24 bg-transparent border-2 border-primary p-3 outline-none focus:border-black focus:ring-0 transition-all text-primary resize-none font-sans text-sm"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full sm:w-auto self-start mt-2 bg-primary text-white py-3 px-8 font-bold tracking-widest text-[10px] uppercase transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] active:translate-y-1 active:shadow-none hover:-translate-y-1 border border-primary ${loading ? 'opacity-80' : 'hover:bg-black'}`}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload size={14} /> UPLOAD</>}
                        </button>
                    </div>
                </form>
            </div>
            
            {/* List */}
            <div className="bg-white p-6 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] border-2 border-primary mt-4">
                <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary mb-6 pb-2 border-b border-primary/40">Archive Gallery</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.length === 0 ? (
                        <p className="col-span-full p-8 text-center text-primary/60 font-serif italic">
                            No gallery images found.
                        </p>
                    ) : (
                        images.map((item) => (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={item._id} 
                                className="border border-primary bg-[#FAF9F6] p-2 flex flex-col group"
                            >
                                <div className="w-full aspect-square overflow-hidden border border-primary relative">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover grayscale-[0.2] contrast-125 sepia-[0.1] group-hover:scale-105 transition-transform duration-500" />
                                    <button 
                                        onClick={() => removeImage(item._id)}
                                        className="absolute top-2 right-2 bg-white border border-primary text-red-500 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                        title="Delete Image"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="mt-2 pt-2 border-t border-primary/20">
                                    <p className="text-xs font-bold text-primary truncate" title={item.title}>{item.title || "Untitled"}</p>
                                    <p className="text-[10px] text-primary/60 truncate" title={item.description}>{item.description || "No description"}</p>
                                    <p className="text-[10px] font-bold text-primary truncate mt-1" title={item.category}>{item.category || "Uncategorized"}</p>
                                    {item.createdAt && <p className="text-[10px] text-primary/50 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Gallery;
