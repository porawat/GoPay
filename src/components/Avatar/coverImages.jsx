import React, { useState, useEffect } from "react";

const ImageCover = ({ name, url }) => {
  const [imageExists, setImageExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!url) {
      setImageExists(false);
      setIsLoading(false);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setImageExists(true);
      setIsLoading(false);
    };
    img.onerror = () => {
      setImageExists(false);
      setIsLoading(false);
    };
    img.src = url;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  if (isLoading) {
    return (
      <img
        src="/images/cover.png"
        alt={name}
        className="w-full h-32 object-cover rounded-t-lg mb-4"
      />
    );
  }

  if (!imageExists) {
    return (
      <img
        src="/images/cover.png"
        alt={name}
        className="w-full h-32 object-cover rounded-t-lg mb-4"
      />
    );
  }

  return (
    <img
      src={url}
      alt={name}
      className="w-full h-32 object-cover rounded-t-lg mb-4"
    />
  );
};

export default ImageCover;
