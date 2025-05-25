import React, { useState, useEffect } from "react";

const ImageAvatar = ({ name, url }) => {
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
    return <img src="https://avatar.iran.liara.run/public" alt={name} />;
  }

  if (!imageExists) {
    return <img src="https://avatar.iran.liara.run/public" alt={name} />;
  }

  return <img src={url} alt={name} />;
};

export default ImageAvatar;
