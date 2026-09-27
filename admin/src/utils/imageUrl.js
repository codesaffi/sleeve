export const cloudinaryImageUrl = (url, width = 480) => {
  if (typeof url !== "string" || !url.includes("res.cloudinary.com/") || !url.includes("/upload/")) {
    return url;
  }

  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
};
