// Pune Explorer landing page. All motion is CSS (styles.css); this file only wires the two controls.
(function () {
  'use strict';

  // Opened from a home-screen icon installed from this address before the app moved to
  // app.puneexplorer.dev: go to the app, which offers to install it again from its new address.
  var installed = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  if (installed) {
    location.replace('https://app.puneexplorer.dev/?install=1');
    return;
  }

  // Deccan / Classic switch: swaps the phone image, its alt text and the paragraph.
  var LOOKS = {
    deccan: { src: '/img/screens/home.jpg', height: 1298, alt: 'Home screen in the Deccan theme', text: 'Deccan uses Paithani plum, haldi gold and Marathi labels, taken from Pune’s wadas and the Sahyadri forts.' },
    classic: { src: '/img/screens/classic.jpg', height: 1221, alt: 'Home screen in the Classic theme', text: 'Classic is plain emerald and white, for people who want the map and nothing else. Switch any time in Profile.' }
  };
  var buttons = document.querySelectorAll('button[data-look]');
  var img = document.getElementById('look-img');
  var text = document.getElementById('look-text');
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var look = LOOKS[b.getAttribute('data-look')];
      buttons.forEach(function (o) {
        var on = o === b;
        o.setAttribute('aria-pressed', on ? 'true' : 'false');
        o.style.background = on ? 'var(--pe-paper)' : 'transparent';
        o.style.color = on ? 'var(--pe-ink)' : 'var(--pe-paper)';
      });
      img.src = look.src;
      img.height = look.height;
      img.alt = look.alt;
      text.textContent = look.text;
    });
  });

  // Android waitlist: the API is served on this origin under /api (Caddy), so no CORS is involved.
  var form = document.getElementById('waitlist');
  var status = document.getElementById('waitlist-status');
  function say(state, message) {
    status.setAttribute('data-state', state);
    status.textContent = message;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    say('busy', 'Saving…');
    fetch('/api/v1/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email.value.trim() })
    })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          say('ok', 'You’re on the list. We’ll email you once, on launch day.');
        } else if (res.status === 429) {
          say('error', 'Too many tries. Please wait a few minutes and try again.');
        } else if (res.status === 400) {
          say('error', 'That email address doesn’t look right. Please check it.');
        } else {
          say('error', 'Couldn’t save that right now. Please try again later.');
        }
      })
      .catch(function () {
        say('error', 'You seem to be offline. Please try again when you’re connected.');
      })
      .then(function () {
        submit.disabled = false;
      });
  });
})();
