import Logo from "../assets/logo.png";

const transformations = {
  hero: "f_auto,q_auto,c_fill,w_1600,h_900",
  large: "f_auto,q_auto,c_fill,w_1000,h_1250",
  card: "f_auto,q_auto,c_fill,w_720,h_900",
  thumbnail: "f_auto,q_auto,c_fill,w_160,h_160",
};

export const fallbackImage = Logo;

export const getOptimizedImageUrl = (url, variant = "card") => {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url || fallbackImage;
  }

  return url.replace("/upload/", `/upload/${transformations[variant]}/`);
};
