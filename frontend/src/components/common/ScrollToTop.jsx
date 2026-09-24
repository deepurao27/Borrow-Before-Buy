import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that resets the window scroll position to (0, 0)
 * on every React Router route transition.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname]);

  return null;
};
