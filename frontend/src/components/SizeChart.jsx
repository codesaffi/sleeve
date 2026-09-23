import React from "react";

// Accepts productData prop — renders dynamic specifications from backend
// Gracefully handles products with no specifications (old + new products)
const SizeChart = ({ productData }) => {
  const specs = productData?.specifications;

  if (!specs || specs.length === 0) {
    return (
      <div className="px-2 py-4 text-sm text-secondary">
        <p>Specifications not available for this product.</p>
      </div>
    );
  }

  return (
    <div className="px-2 py-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {specs.map((spec, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-background" : "bg-white"} transition-colors`}
              >
                <td className="px-4 py-3 font-semibold text-primary rounded-l-lg w-1/2 md:w-1/3">
                  {spec.name}
                </td>
                <td className="px-4 py-3 text-secondary rounded-r-lg">
                  {spec.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SizeChart;
