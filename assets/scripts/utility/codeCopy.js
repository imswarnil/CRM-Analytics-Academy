document.addEventListener('DOMContentLoaded', () => {
    // Function to add copy button to code blocks
    function addCopyButtons() {
        const codeBlocks = document.querySelectorAll('pre.highlight, figure.highlight');

        codeBlocks.forEach(codeBlock => {
            const parentElement = codeBlock.closest('pre, figure');

            // Check if the button already exists to prevent duplicates
            if (parentElement && !parentElement.querySelector('.copy-code-button')) {
                const button = document.createElement('span');
                button.className = ' button is-small is-primary copy-code-button';
                button.innerHTML = '<span class="icon"><i class="fas fa-copy"></i></span><span class="text">Copy</span>';

                // Insert button before the code block
                parentElement.insertAdjacentElement('beforebegin', button);

                // Add event listener for the copy button
                button.addEventListener('click', () => {
                    const codeToCopy = codeBlock.querySelector('code').innerText;

                    navigator.clipboard.writeText(codeToCopy)
                        .then(() => {
                            console.log('Code copied successfully');
                            button.classList.add('is-success');
                            button.querySelector('.icon').innerHTML = '<i class="fas fa-check"></i>';
                            button.querySelector('.text').textContent = 'Copied';
                            showCopiedToast();
                            setTimeout(hideCopiedToast, 2000);
                            setTimeout(() => {
                                button.classList.remove('is-success');
                                button.querySelector('.icon').innerHTML = '<i class="fas fa-copy"></i>';
                                button.querySelector('.text').textContent = 'Copy';
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('Failed to copy code: ', err);
                        });
                });

                // Optionally, add the language tag
                const language = parentElement.querySelector('code').className.split('-')[1];
                if (language) {
                    const languageTag = document.createElement('span');
                    languageTag.className = 'language-tag';
                    languageTag.textContent = language.toUpperCase();
                    parentElement.insertAdjacentElement('beforebegin', languageTag);
                }
            }
        });
    }

    // Show toast message
    function showCopiedToast() {
        let toast = document.getElementById('copied-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'copied-toast';
            toast.className = 'toast is-success';
            toast.textContent = 'Code copied successfully!';
            document.body.appendChild(toast);
        }
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 2000);
    }

    addCopyButtons();
});
