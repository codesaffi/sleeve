import React from 'react'

// Accepts productData prop — renders actual description from backend
// Falls back gracefully if no description available
const Description = ({ productData }) => {
  const description = productData?.description;

  if (!description) {
    return (
      <div className="px-2 py-4 text-sm text-secondary">
        <p>No product description available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-2 py-4 text-sm text-secondary leading-relaxed">
      {description.split('\n').filter(Boolean).map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  );
};

export default Description;