import { useEffect, useState } from 'preact/hooks';

export function useClock(): string {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('en-GB', { 
    hour12: false, 
    timeZone: 'Africa/Nairobi' 
  }));

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-GB', { 
        hour12: false, 
        timeZone: 'Africa/Nairobi' 
      }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}
