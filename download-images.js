/**
 * Run this script in your browser console to help download the required images
 */

// Download background image
fetch('https://img.freepik.com/free-vector/hand-painted-watercolor-nature-background_23-2148941599.jpg')
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'background.jpg';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  });

// Download tropical foliage image
fetch('https://img.freepik.com/free-vector/tropical-foliage-log-landing-page_23-2148537424.jpg')
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'tropical-foliage.jpg';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  });

console.log('Download started. Save these files to your assets/images folder.');
