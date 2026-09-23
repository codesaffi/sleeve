import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Star, X, Upload } from "lucide-react";
import { backendUrl } from "../App";

// ── Interactive star picker ────────────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            size={26}
            className={i <= (hovered || value) ? "text-yellow-400" : "text-gray-300"}
            fill={i <= (hovered || value) ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
};

// ── Admin Add Review Modal ─────────────────────────────────────────────────────
const AdminAddReviewModal = ({ product, token, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (rating < 1 || rating > 5) { toast.error("Please select a star rating"); return; }
    if (!reviewText.trim()) { toast.error("Review text is required"); return; }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address"); return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("productId", product._id);
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("rating", rating);
      formData.append("review", reviewText.trim());
      formData.append("source", "admin");
      if (imageFile) formData.append("image", imageFile);

      const res = await axios.post(`${backendUrl}/api/review/add`, formData, {
        headers: { token }
      });

      if (res.data.success) {
        toast.success("Review added successfully!");
        onSuccess && onSuccess();
        onClose();
      } else {
        toast.error(res.data.message || "Failed to add review");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 relative animate-fade-in">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-bold text-accent uppercase tracking-wider mb-1">Store Review</p>
          <h2 className="text-xl font-extrabold text-gray-800">Add Review</h2>
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{product.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Reviewer name"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">
              Email <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="reviewer@email.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">
              Stars <span className="text-red-500">*</span>
            </label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          {/* Review text */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">
              Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write the review content…"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Image */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">
              Image <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-xl px-4 py-2.5 hover:border-blue-400 transition-colors text-sm text-gray-500">
              <Upload size={16} />
              {imageFile ? imageFile.name : "Choose image…"}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 max-h-32 w-auto rounded-xl border border-gray-200 object-cover"
              />
            )}
          </div>

          {/* Note about admin label */}
          <p className="text-xs text-gray-400 italic">
            This review will be labelled <strong>"Store Review"</strong> on the product page.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting…" : "Add Review"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAddReviewModal;
