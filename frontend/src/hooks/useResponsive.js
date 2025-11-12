import { useState, useEffect } from 'react';

/**
 * Hook personalizado para detectar el tamaño de pantalla de forma reactiva
 * @returns {Object} - Objeto con información sobre el tamaño de pantalla
 */
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        width,
        height: window.innerHeight,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    // Agregar listener
    window.addEventListener('resize', handleResize);
    
    // Llamar una vez al montar
    handleResize();

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

/**
 * Hook simple para detectar solo si es móvil
 * @returns {boolean} - true si la pantalla es menor a 768px
 */
export const useIsMobile = () => {
  const { isMobile } = useResponsive();
  return isMobile;
};
