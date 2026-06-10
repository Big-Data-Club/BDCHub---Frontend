import { useEffect, useRef } from 'react';

interface TrackingEvent {
  event_type: string;
  target_element: string;
  page_url: string;
  timestamp: string;
  payload: Record<string, any>;
}

export function useTracker(userId: string | number | undefined) {
  const queue = useRef<TrackingEvent[]>([]);
  const lastMouseMove = useRef<number>(0);
  const lastScroll = useRef<number>(0);

  useEffect(() => {
    if (!userId) return;

    // Flush batch queue to ingestion gateway via Traefik router path /events
    const flushQueue = async () => {
      if (queue.current.length === 0) return;
      const eventsToSend = [...queue.current];
      queue.current = [];

      try {
        const response = await fetch('/events/clickstream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            events: eventsToSend,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
      } catch (err) {
        console.error('Failed to flush clickstream tracking queue:', err);
        // Put failed messages back at the front of the queue
        queue.current = [...eventsToSend, ...queue.current];
      }
    };

    // Periodically flush tracking events every 5 seconds
    const interval = setInterval(flushQueue, 5000);

    // Throttled mouse movement tracking (max once per 1 second)
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseMove.current < 1000) return; // 1 second throttle
      lastMouseMove.current = now;

      const element = e.target as HTMLElement;
      queue.current.push({
        event_type: 'mouse_move',
        target_element: element?.id || element?.className || element?.tagName || 'unknown',
        page_url: window.location.pathname,
        timestamp: new Date().toISOString(),
        payload: {
          x: e.clientX,
          y: e.clientY,
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight,
        },
      });
    };

    // Immediate click tracking
    const handleClick = (e: MouseEvent) => {
      const element = e.target as HTMLElement;
      // Track clicks on relevant interactive elements
      queue.current.push({
        event_type: 'click',
        target_element: element?.id || element?.className || element?.tagName || 'unknown',
        page_url: window.location.pathname,
        timestamp: new Date().toISOString(),
        payload: {
          x: e.clientX,
          y: e.clientY,
          text: element?.innerText?.slice(0, 50) || '',
        },
      });
    };

    // Throttled page scroll depth tracking (max once per 1.5 seconds)
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScroll.current < 1500) return; // 1.5 second throttle
      lastScroll.current = now;

      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;

      queue.current.push({
        event_type: 'scroll',
        target_element: 'window',
        page_url: window.location.pathname,
        timestamp: new Date().toISOString(),
        payload: {
          scroll_top: scrollTop,
          scroll_percentage: scrollPercentage,
        },
      });
    };

    // Register event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll);

    // Cleanup listeners and flush remainder on unmount
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      flushQueue(); // Try final flush
    };
  }, [userId]);
}
