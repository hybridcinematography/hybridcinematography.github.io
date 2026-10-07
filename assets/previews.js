(() => {
  const videos = [...document.querySelectorAll('.thumb video')];
  const toggle = document.getElementById('preview-toggle');
  if (!('IntersectionObserver' in window)) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new Set();
  let enabled = !reducedMotion.matches;

  function update() {
    toggle.textContent = enabled ? 'Pause previews' : 'Play previews';
    for (const video of videos) {
      if (enabled && !document.hidden && visible.has(video)) {
        if (!video.getAttribute('src')) video.src = video.dataset.src;
        video.play().catch(() => {}); // Keep the still image if autoplay is unavailable.
      } else {
        video.pause();
        if (!enabled) video.classList.remove('has-preview');
      }
    }
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    update();
  }, { threshold: 0.15 });

  for (const video of videos) {
    video.muted = true;
    video.addEventListener('playing', () => video.classList.add('has-preview'));
    video.addEventListener('error', () => video.classList.remove('has-preview'));
    observer.observe(video);
  }
  toggle.hidden = false;
  toggle.addEventListener('click', () => { enabled = !enabled; update(); });
  reducedMotion.addEventListener('change', () => { enabled = !reducedMotion.matches; update(); });
  document.addEventListener('visibilitychange', update);
  update();
})();
