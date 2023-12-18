// install.js

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (event) => {
  // Prevent the browser from automatically showing the prompt
  event.preventDefault();

  // Stash the event so it can be triggered later
  deferredPrompt = event;

  // Optionally, you can show a custom install button
  // Example: Show a button to the user to install the PWA
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.style.display = 'block';
    installButton.addEventListener('click', () => {
      // Trigger the deferred prompt
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        // Reset the deferred prompt
        deferredPrompt = null;
      });
    });
  }
});
