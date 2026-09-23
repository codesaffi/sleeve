import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Star } from "lucide-react";
import { backendUrl } from "../App";

// ── Star renderer ──────────────────────────────────────────────────────────────
const StarRow = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        className={i <= rating ? "text-yellow-400" : "text-gray-300"}
        fill={i <= rating ? "currentColor" : "none"}
      />
    ))}
  </div>
);

// ── Interactive star selector ──────────────────────────────────────────────────
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
            size={28}
            className={i <= (hovered || value) ? "text-yellow-400" : "text-gray-300"}
            fill={i <= (hovered || value) ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
};

// ── Format date ────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

// ── Single review card ─────────────────────────────────────────────────────────
const ReviewCard = ({ r }) => (
  <div className="border border-border rounded-2xl p-5 bg-background/40 flex flex-col gap-3">
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-primary text-sm">{r.name}</span>
          {r.source === "admin" && (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
              Store Review
            </span>
          )}
        </div>
        <StarRow rating={r.rating} size={14} />
      </div>
      <span className="text-xs text-secondary">{formatDate(r.date)}</span>
    </div>
    <p className="text-sm text-secondary leading-relaxed">{r.review}</p>
    {r.image && (
      <img
        src={r.image}
        alt="Review"
        className="max-h-48 w-auto rounded-xl object-cover border border-border"
      />
    )}
  </div>
);

// ── Average Rating Banner ──────────────────────────────────────────────────────
const RatingBanner = ({ avg, total }) => {
  if (total === 0) {
    return (
      <p className="text-secondary text-sm italic">No reviews yet — be the first!</p>
    );
  }
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex flex-col items-center gap-1">
        <span className="text-4xl font-extrabold text-primary">{avg.toFixed(1)}</span>
        <StarRow rating={Math.round(avg)} size={18} />
        <span className="text-xs text-secondary mt-0.5">out of 5</span>
      </div>
      <div className="h-12 w-px bg-border hidden sm:block" />
      <span className="text-sm text-secondary">
        Based on <span className="font-bold text-primary">{total}</span> review{total !== 1 ? "s" : ""}
      </span>
    </div>
  );
};

// ── Main Reviews component ─────────────────────────────────────────────────────
const Reviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/review/list?productId=${productId}`);
      if (res.data.success) {
        setReviews(res.data.reviews);
        setAvgRating(res.data.avgRating);
        setTotalReviews(res.data.totalReviews);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) { toast.error("Name is required"); return; }
    if (rating < 1 || rating > 5) { toast.error("Please select a rating (1–5 stars)"); return; }
    if (!reviewText.trim()) { toast.error("Review text is required"); return; }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address"); return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("rating", rating);
      formData.append("review", reviewText.trim());
      formData.append("source", "customer");
      if (imageFile) formData.append("image", imageFile);

      const res = await axios.post(`${backendUrl}/api/review/add`, formData);
      if (res.data.success) {
        toast.success("Review submitted! Thank you.");
        setName(""); setEmail(""); setRating(0); setReviewText("");
        setImageFile(null); setImagePreview("");
        await fetchReviews();
      } else {
        toast.error(res.data.message || "Failed to submit review");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16">
      {/* ── Header ── */}
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-primary mb-1">Customer Reviews</h2>
        <div className="w-12 h-1 bg-accent rounded-full mb-6" />
        {loading ? (
          <p className="text-secondary text-sm">Loading reviews…</p>
        ) : (
          <RatingBanner avg={avgRating} total={totalReviews} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ── Review List ── */}
        <div className="flex flex-col gap-4">
          {!loading && reviews.length === 0 && (
            <p className="text-secondary text-sm italic">No reviews yet. Submit the first one!</p>
          )}
          {reviews.map((r) => (
            <ReviewCard key={r._id} r={r} />
          ))}
        </div>

        {/* ── Submit Form ── */}
        <div>
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-primary mb-5">Write a Review</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="text-xs font-bold text-primary uppercase tracking-wide block mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-primary placeholder-secondary bg-background focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold text-primary uppercase tracking-wide block mb-1">
                  Email <span className="text-secondary font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-primary placeholder-secondary bg-background focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="text-xs font-bold text-primary uppercase tracking-wide block mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <StarPicker value={rating} onChange={setRating} />
              </div>

              {/* Review text */}
              <div>
                <label className="text-xs font-bold text-primary uppercase tracking-wide block mb-1">
                  Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this product…"
                  rows={4}
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-primary placeholder-secondary bg-background focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="text-xs font-bold text-primary uppercase tracking-wide block mb-1">
                  Image <span className="text-secondary font-normal">(optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-secondary file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-3 max-h-36 w-auto rounded-xl border border-border object-cover"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 bg-accent hover:bg-accentHover text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-accent/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting…" : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
