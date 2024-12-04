
    document.addEventListener("DOMContentLoaded", function() {
                const codeBlocks = document.querySelectorAll('pre code');
                
                codeBlocks.forEach(function(codeBlock) {
                const parent = codeBlock.closest('.highlighter-rouge');
                if (parent) {
                    // Create language badge based on language class
                    const language = parent.classList.contains('language-js') ? 'JavaScript' : 'Other';
                    const languageBadge = document.createElement('span');
                    languageBadge.classList.add('tag', 'is-primary', 'is-light');
                    languageBadge.textContent = language;
            
                    // Create the copy button wrapper
                    const copyButtonWrapper = document.createElement('div');
                    copyButtonWrapper.classList.add('copy-btn-wrapper');
            
                    const copyButton = document.createElement('button');
                    copyButton.classList.add('button', 'is-info', 'is-small', 'copy-btn');
                    copyButton.textContent = 'Copy';
                    
                    // Event listener for copy button
                    copyButton.addEventListener('click', function() {
                    const range = document.createRange();
                    range.selectNode(codeBlock);
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(range);
                    
                    try {
                        document.execCommand('copy');
                        copyButton.innerHTML = `
                        <span class="icon is-small">
                            <i class="fas fa-check"></i>
                        </span>
                        <span>Copied!</span>
                        `;
                        setTimeout(() => {
                        copyButton.innerHTML = `
                            <span class="icon is-small">
                            <i class="fas fa-copy"></i>
                            </span>
                            <span>Copy</span>
                        `;
                        }, 2000);
                    } catch (err) {
                        console.error('Copy failed', err);
                    }
                    });
            
                    copyButtonWrapper.appendChild(copyButton);
                    parent.appendChild(languageBadge);
                    parent.appendChild(copyButtonWrapper);
                }
                });
    });
    // Lazy Load Adsense
    document.addEventListener("DOMContentLoaded", function () {
      const ads = document.querySelectorAll('.ads-container');
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const ad = entry.target.querySelector('.adsbygoogle');
            if (ad && !ad.hasAttribute('data-loaded')) {
              (adsbygoogle = window.adsbygoogle || []).push({});
              ad.setAttribute('data-loaded', 'true');
              observer.unobserve(entry.target);
            }
          }
        });
      });
  
      ads.forEach(ad => {
        observer.observe(ad);
      });
    }); 