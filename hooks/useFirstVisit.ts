import { useState, useEffect } from 'react';

export function useFirstVisit(key: string) {
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Check if the key exists in localStorage
    const visited = localStorage.getItem(key);
    // If not visited yet, set state to true
    if (!visited) {
      setIsFirstVisit(true);
    }
  }, [key]);

  const markAsVisited = () => {
    localStorage.setItem(key, 'true');
    setIsFirstVisit(false);
  };

  return { isFirstVisit, markAsVisited };
}