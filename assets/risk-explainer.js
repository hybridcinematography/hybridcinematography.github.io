/* Interactive counterparts to the coverage, resolution, and performance diagrams.
   These are isolated geometric illustrations, not the scene viewer's risk estimator. */
(() => {
  'use strict';
  const root = document.getElementById('risk-explainer');
  if (!root) return;
  const $ = id => document.getElementById(id);
  const range = $('risk-amount');
  const animate = $('risk-animate');
  const buttons = [...root.querySelectorAll('[data-factor]')];
  const ink = '#303740', blue = '#3179b2', red = '#cb5459';
  let factor = 'coverage', frame = 0, previousTime = 0, direction = 1;
  let amount = Number(range.value);
  const modes = {
    coverage: {
      description: 'Move sideways with the same lens. The requested view extends beyond the recorded view, revealing a strip of wall that was never captured.',
      label: 'Move the camera sideways', endpoint: 'Move sideways →',
      cue: 'Red hatching marks unseen surfaces. A pickup can record this part of the static scene.'
    },
    resolution: {
      description: 'Move closer with the same lens. The same recorded samples must fill a larger image area. The dots represent samples; moving closer cannot add missing detail.',
      label: 'Move closer to the scene', endpoint: 'Move closer →',
      cue: 'Green → yellow marks the growing demand for detail. A closer pickup can supply more samples of the static scene.'
    },
    performance: {
      description: 'Orbit the performer at a fixed instant. A new angle reveals a side that was not recorded at that moment. Earlier or later poses cannot supply that same performance.',
      label: 'Orbit around the performer', endpoint: 'Orbit 90° →',
      cue: 'Yellow marks the newly revealed side. Recording the performer later cannot recover this unrecorded instant.'
    }
  };
  const line = (x1, y1, x2, y2, color, extra = '', width = 2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${extra}/>`;
  const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
  const hatch = id => `<defs><pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#fff0f0"/><path d="M-2 2L2-2M0 10L10 0M8 12L12 8" stroke="${red}" stroke-width="1.5"/></pattern></defs>`;
  const camera = (x, y, angle, color, opacity = 1) => `<g transform="translate(${x} ${y}) rotate(${angle})" stroke="${color}" fill="white" stroke-width="2.5" opacity="${opacity}"><path d="M-9 5L-12-3L12-3L9 5"/><rect x="-12" y="5" width="24" height="15" rx="3"/><circle cx="6" cy="12" r="2" fill="${color}"/></g>`;
  const cone = (cx, cy, left, right, color, dashed = false) => `<path d="M${cx} ${cy}L${left} 70L${right} 70Z" fill="${color}" fill-opacity=".035" stroke="${color}" stroke-opacity=".65" stroke-width="1.5" ${dashed ? 'stroke-dasharray="5 4"' : ''}/>`;
  const room = () => `<g stroke="#909aa4" stroke-width="2" fill="#f4f6f8">
    <path d="M0 210H420M22 0V210L0 260M398 0V210L420 260" fill="none"/>
    <rect x="49" y="37" width="94" height="92" rx="2" fill="white"/><path d="M96 37V129M49 83H143"/>
    <rect x="271" y="45" width="58" height="46" rx="2" fill="white"/><path d="M280 80L292 64L303 73L312 60L322 80Z" fill="#e7ecef"/>
    <rect x="165" y="128" width="194" height="66" rx="13"/><rect x="170" y="166" width="184" height="36" rx="5" fill="white"/>
    <rect x="152" y="155" width="22" height="50" rx="6" fill="white"/><rect x="349" y="155" width="22" height="50" rx="6" fill="white"/>
    <path d="M183 205V219M340 205V219M260 138V165"/>
  </g>`;
  const sampleGrid = id => `<defs><pattern id="${id}" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="2" fill="#338b84" opacity=".8"/></pattern></defs>${rect(0, 0, 420, 260, `url(#${id})`)}`;
  // A fixed pose with a narrowing silhouette as the requested camera orbits.
  const person = angle => {
    const c = Math.cos(angle), s = Math.sin(angle), w = 25 * (.55 + .45 * c);
    return `<g fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="210" cy="71" rx="${17 * (.82 + .18 * c)}" ry="19" stroke-width="2"/>
      <path d="M${223 + s * 3} 68L${226 + s * 8} 78H222" stroke-width="2"/>
      <path d="M${210-w} 113Q${210-w} 99 210 98Q${210+w} 99 ${210+w} 113L${210+w*.72} 159H${210-w*.72}Z" stroke-width="3"/>
      <path d="M${210-w+2} 112L${180+s*13} 143L${162+s*26} 129M${210+w-2} 112L${239-s*9} 141L${252-s*16} 134" fill="none" stroke-width="12"/>
      <path d="M200 156L${190+s*9} 190L${169+s*20} 220M220 156L${229-s*6} 188L${243-s*12} 218" fill="none" stroke-width="15"/>
    </g>`;
  };
  const topPerson = (x, opacity = 1) => `<g opacity="${opacity}" fill="${ink}"><ellipse cx="${x}" cy="150" rx="23" ry="9"/><circle cx="${x}" cy="148" r="10" fill="#f8fafb" stroke="${ink}" stroke-width="2"/><path d="M${x-4} 160L${x} 167L${x+4} 160Z"/></g>`;

  function draw() {
    const u = amount / 100;
    let plan = '', recorded = room(), requested = '', value = '';
    if (factor === 'coverage') {
      const shift = 90 * u, edge = 420 - 210 * u;
      plan = hatch('risk-wall-hatch') + rect(28, 52, 364, 22, '#f0f3f5', 'rx="3"') +
        rect(230, 52, shift, 22, 'url(#risk-wall-hatch)') +
        cone(140, 255, 50, 230, ink) + cone(140 + shift, 255, 50 + shift, 230 + shift, blue, true) +
        line(50, 70, 230, 70, ink, '', 4) + camera(140, 255, 0, ink, .65) + camera(140 + shift, 255, 0, blue);
      requested = hatch('risk-view-hatch') + `<g transform="translate(${-210*u} 0)">${room()}</g>` +
        rect(edge, 0, 210 * u, 260, 'url(#risk-view-hatch)') + line(edge, 0, edge, 260, red);
      value = u === 0 ? 'Recorded position' : `${Math.round(u * 100)}% of lateral move`;
    } else if (factor === 'resolution') {
      const zoom = 1 + 1.5 * u, half = 130 / zoom, cy = 70 + 190 / zoom;
      plan = rect(48, 52, 324, 22, '#f0f3f5', 'rx="3"') + cone(210, 260, 80, 340, ink) +
        cone(210, cy, 210-half, 210+half, blue, true) + line(210, 251, 210, cy, blue, 'stroke-dasharray="3 5"') +
        line(210-half, 70, 210+half, 70, blue, '', 4) + camera(210, 260, 0, ink, .65) + camera(210, cy, 0, blue);
      recorded += sampleGrid('risk-recorded-samples') + rect((420-420/zoom)/2, (260-260/zoom)/2, 420/zoom, 260/zoom, 'none', `stroke="${blue}" stroke-width="3"`);
      const wash = `rgb(${Math.round(102+143*u)},${Math.round(190+14*u)},${Math.round(180-83*u)})`;
      requested = `<g transform="translate(210 130) scale(${zoom}) translate(-210 -130)">${room()}${rect(0, 0, 420, 260, wash, 'opacity=".22"')}${sampleGrid('risk-requested-samples')}</g>`;
      value = `${zoom.toFixed(1)}× image magnification`;
    } else {
      const angle = u * Math.PI / 2, x = 210 + 120 * Math.sin(angle), y = 150 + 120 * Math.cos(angle);
      const dx = Math.cos(angle) * 48, dy = -Math.sin(angle) * 48;
      plan = `<path d="M210 270A120 120 0 0 0 330 150" fill="none" stroke="${blue}" stroke-opacity=".4" stroke-width="2" stroke-dasharray="4 5"/>` +
        `<path d="M210 270L162 150L258 150Z" fill="${ink}" fill-opacity=".025" stroke="${ink}" stroke-opacity=".35"/>` +
        `<path d="M${x} ${y}L${210-dx} ${150-dy}L${210+dx} ${150+dy}Z" fill="${blue}" fill-opacity=".05" stroke="${blue}" stroke-width="1.5" stroke-dasharray="5 4"/>` +
        topPerson(110, .15) + topPerson(310, .15) + topPerson(210) +
        `<text x="110" y="127" text-anchor="middle" fill="#737e87" font-size="14">Earlier</text><text x="310" y="127" text-anchor="middle" fill="#737e87" font-size="14">Later</text><text x="210" y="118" text-anchor="middle" fill="${ink}" font-size="14">Same instant</text>` +
        camera(210, 270, 0, ink, .65) + camera(x, y, -u*90, blue);
      recorded += `<g color="#81bdb9">${person(0)}</g>`;
      // The yellow region is an illustrative newly visible side, not a measured score.
      const edge = 258 - 48 * u;
      requested = room() + `<defs><clipPath id="risk-new-side">${rect(edge, 0, 420-edge, 260, 'white')}</clipPath></defs>` +
        `<g color="#81bdb9">${person(angle)}</g><g color="#e7bf55" clip-path="url(#risk-new-side)">${person(angle)}</g>`;
      value = `${Math.round(u*90)}° around the performer`;
    }
    $('risk-plan').innerHTML = plan;
    $('risk-recorded').innerHTML = recorded;
    $('risk-requested').innerHTML = requested;
    $('risk-value').textContent = value;
    range.value = String(Math.round(amount));
    range.setAttribute('aria-valuetext', value);
    $('risk-requested').setAttribute('aria-label', `${modes[factor].label}: ${value}. ${u === 0 ? 'The requested and recorded views match.' : modes[factor].cue}`);
  }

  function updateCue() {
    $('risk-cue').textContent = amount === 0 ? 'The cameras coincide: this view asks for no new evidence. Drag the slider to explore.' : modes[factor].cue;
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    animate.textContent = 'Animate';
    animate.setAttribute('aria-pressed', 'false');
    updateCue();
  }
  function tick(time) {
    if (previousTime) {
      amount += direction * (time - previousTime) / 65;
      if (amount >= 100 || amount <= 0) {
        amount = Math.max(0, Math.min(100, amount));
        direction *= -1;
      }
      draw();
    }
    previousTime = time;
    frame = requestAnimationFrame(tick);
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    stop();
    factor = button.dataset.factor;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    $('risk-explanation').textContent = modes[factor].description;
    $('risk-control-label').textContent = modes[factor].label;
    $('risk-endpoint').textContent = modes[factor].endpoint;
    draw();
    updateCue();
  }));
  range.addEventListener('input', () => {
    stop();
    amount = Number(range.value);
    draw();
    updateCue();
  });
  $('risk-reset').addEventListener('click', () => {
    stop();
    amount = 0;
    draw();
    updateCue();
  });
  animate.addEventListener('click', () => {
    if (frame) return stop();
    direction = amount >= 100 ? -1 : 1;
    animate.textContent = 'Pause';
    animate.setAttribute('aria-pressed', 'true');
    frame = requestAnimationFrame(tick);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  new IntersectionObserver(entries => { if (!entries[0].isIntersecting) stop(); }).observe(root);
  // Starts still for everyone, including reduced-motion users. Animation is opt-in.
  $('risk-explanation').textContent = modes[factor].description;
  $('risk-control-label').textContent = modes[factor].label;
  $('risk-endpoint').textContent = modes[factor].endpoint;
  draw();
  updateCue();
  $('risk-interactive').hidden = false;
})();
