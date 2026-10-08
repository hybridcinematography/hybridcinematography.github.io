(() => {
  if (!('IntersectionObserver' in window)) return;

  function loopGroup(selector, toggleId, label) {
    const videos = [...document.querySelectorAll(selector)];
    const toggle = toggleId ? document.getElementById(toggleId) : null;

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const visible = new Set();
    let enabled = !reducedMotion.matches;

    function update() {
      if (toggle) toggle.textContent = `${enabled ? 'Pause' : 'Play'} ${label}`;
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
    if (toggle) {
      toggle.hidden = false;
      toggle.addEventListener('click', () => { enabled = !enabled; update(); });
    }
    reducedMotion.addEventListener('change', () => { enabled = !reducedMotion.matches; update(); });
    document.addEventListener('visibilitychange', update);
    update();
  }
  loopGroup('.thumb video', 'preview-toggle', 'previews');
  loopGroup('.factor-videos video', 'factor-toggle', 'animations');
  loopGroup('.visualizer-previews video', 'visualizer-toggle', 'previews');
  loopGroup('.risk-story video');
  loopGroup('.slider-motif video');
})();
