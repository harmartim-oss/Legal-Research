import React, { useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';

interface CanLIIViewerProps {
  initialUrl?: string;
}

export function CanLIIViewer({ initialUrl = 'https://www.canlii.org/en/' }: CanLIIViewerProps) {
  const [url, setUrl] = useState(initialUrl);
  const [key, setKey] = useState(0); // Used to force iframe reload

  const handleReload = () => {
    setKey(prev => prev + 1);
  };

  const handleOpenExternal = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span className="font-medium">CanLII Integration</span>
          <span className="text-gray-400">|</span>
          <span className="truncate max-w-md">{url}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReload}
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            title="Reload iframe"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleOpenExternal}
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 w-full relative bg-gray-100">
        <iframe
          key={key}
          src={url}
          className="absolute inset-0 w-full h-full border-0"
          title="CanLII Viewer"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
}
