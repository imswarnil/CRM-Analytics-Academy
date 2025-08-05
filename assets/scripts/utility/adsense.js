// Minimal script required for AdSense to work
(function() {
  const script = document.createElement('script');
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1291242080282540';
  script.async = true;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
  
  // Push ads after script loads
  script.onload = function() {
    (adsbygoogle = window.adsbygoogle || []).push({});
  };
})();
