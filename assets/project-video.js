(() => {
  const frame = document.querySelector('.video-frame');

  function fitOpeningVideo() {
    const top = frame.getBoundingClientRect().top + window.scrollY;
    // Keep a readable minimum when a small screen cannot fit the full header.
    const height = Math.max(180, window.innerHeight - top - 24);
    frame.style.maxWidth = `${height * 16 / 9}px`;
  }

  const observer = new ResizeObserver(fitOpeningVideo);
  observer.observe(document.querySelector('.project-hero'));
  window.addEventListener('resize', fitOpeningVideo);
  fitOpeningVideo();
})();
