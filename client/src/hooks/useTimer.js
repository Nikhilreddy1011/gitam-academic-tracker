// src/hooks/useTimer.js
import { useEffect, useState } from "react";

export default function useTimer(deadline) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const i = setInterval(() => {
      const diff = new Date(deadline) - new Date();

      if (diff <= 0) {
        setTime("⚠️ OVERDUE");
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setTime(`${h}:${m}:${s}`);
    }, 1000);

    return () => clearInterval(i);
  }, [deadline]);

  return time;
}