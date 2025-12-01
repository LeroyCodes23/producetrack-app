
'use client';

import { useState, useEffect } from 'react';

interface ParallaxBackgroundProps {
  imageUrl: string;
}

export default function ParallaxBackground({ imageUrl }: ParallaxBackgroundProps) {
  const [offsetY, setOffsetY] = useState(0);
  const handleScroll = () => setOffsetY(window.pageYOffset);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="absolute top-0 right-0 w-1/2 h-full bg-no-repeat bg-cover bg-center"
      style={{
        backgroundImage: `url('${imageUrl}')`,
        transform: `translateY(${offsetY * 0.5}px)`,
        clipPath: 'ellipse(100% 100% at 100% 50%)',
        zIndex: 0,
        filter: 'blur(1px)',
        maskImage: 'radial-gradient(circle at center, black 0%, transparent 98%)',
        WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 98%)',
      }}
    />
  );
}
