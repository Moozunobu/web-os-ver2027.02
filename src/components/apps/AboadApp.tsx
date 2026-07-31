import React, { useEffect, useRef } from 'react';

const ABOAD_DEFAULT_URL = 'https://moozunobu.github.io/Abord-browser-ver2/';

const getSanitizedUrl = () => {
  const saved = localStorage.getItem('aboad_git_url');
  if (!saved || saved.includes('web-os-ver') || saved.includes('noob-web-os-ver')) {
    localStorage.removeItem('aboad_git_url');
    return ABOAD_DEFAULT_URL;
  }
  return saved;
};

// Singleton background container & iframe for instant 0ms pre-loading
let globalAboadIframe: HTMLIFrameElement | null = null;
let globalAboadUrl: string = '';

function getOrCreateGlobalIframe(): HTMLIFrameElement {
  if (!globalAboadIframe && typeof document !== 'undefined') {
    const iframe = document.createElement('iframe');
    iframe.title = "Aboad Web App";
    iframe.className = "w-full h-full border-none bg-white";
    iframe.referrerPolicy = "no-referrer";
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups allow-modals");
    iframe.setAttribute("loading", "eager");
    
    const initialUrl = getSanitizedUrl();
    iframe.src = initialUrl;
    globalAboadUrl = initialUrl;
    
    // Create hidden background wrapper so iframe starts loading immediately on OS boot
    let bgHost = document.getElementById('aboad-bg-preload-host');
    if (!bgHost) {
      bgHost = document.createElement('div');
      bgHost.id = 'aboad-bg-preload-host';
      bgHost.style.position = 'fixed';
      bgHost.style.top = '-9999px';
      bgHost.style.left = '-9999px';
      bgHost.style.width = '1px';
      bgHost.style.height = '1px';
      bgHost.style.overflow = 'hidden';
      bgHost.style.opacity = '0';
      bgHost.style.pointerEvents = 'none';
      bgHost.style.zIndex = '-9999';
      document.body.appendChild(bgHost);
    }
    bgHost.appendChild(iframe);
    globalAboadIframe = iframe;
  }
  return globalAboadIframe!;
}

// Preload immediately on script load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    getOrCreateGlobalIframe();
  }, 0);
}

interface AboadAppProps {
  initialUrl?: string;
}

export const AboadApp: React.FC<AboadAppProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const iframe = getOrCreateGlobalIframe();
    const currentTargetUrl = getSanitizedUrl();

    if (globalAboadUrl !== currentTargetUrl) {
      iframe.src = currentTargetUrl;
      globalAboadUrl = currentTargetUrl;
    }

    // Attach iframe into visible window container
    container.appendChild(iframe);

    const handleUrlUpdate = () => {
      const updatedUrl = getSanitizedUrl();
      if (globalAboadUrl !== updatedUrl) {
        iframe.src = updatedUrl;
        globalAboadUrl = updatedUrl;
      }
    };

    window.addEventListener('aboad_url_updated', handleUrlUpdate);
    window.addEventListener('storage', handleUrlUpdate);

    return () => {
      window.removeEventListener('aboad_url_updated', handleUrlUpdate);
      window.removeEventListener('storage', handleUrlUpdate);

      // When window closes, put iframe back into background host so it stays loaded
      const bgHost = document.getElementById('aboad-bg-preload-host');
      if (bgHost && iframe) {
        bgHost.appendChild(iframe);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white overflow-hidden select-none" />
  );
};

