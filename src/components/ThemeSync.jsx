import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function ThemeSync() {
  const mode = useSelector((state) => state.theme.mode);

  useEffect(() => {
    if (mode === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', mode);
  }, [mode]);

  return null;
}

