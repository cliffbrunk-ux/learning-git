/* ============================================================
   Learning Git — animations
   Each concept gets a paused GSAP timeline, built once, played
   when it scrolls into view and replayable on demand.

   Note on graceful degradation: every element starts fully
   visible in the markup. Hidden states are applied by GSAP at
   build time, so if GSAP fails to load the page still reads
   correctly — it just doesn't move.
   ============================================================ */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!window.gsap) return;

  gsap.defaults({ ease: 'power2.out', duration: 0.5 });

  /* ── helpers ─────────────────────────────────────────────── */

  // Animate a path as if it were being drawn.
  function draw(tl, el, duration, position) {
    if (!el) return tl;
    var len = el.getTotalLength();
    tl.fromTo(el,
      { strokeDasharray: len, strokeDashoffset: len },
      { strokeDashoffset: 0, duration: duration || 0.6, ease: 'power1.inOut' },
      position
    );
    return tl;
  }

  // Fade + grow a dashed wire from one end (dashes rule out drawing).
  function wire(tl, el, origin, duration, position) {
    if (!el) return tl;
    tl.fromTo(el,
      { opacity: 0, scaleX: 0, scaleY: 0, svgOrigin: origin },
      { opacity: 1, scaleX: 1, scaleY: 1, duration: duration || 0.45 },
      position
    );
    return tl;
  }

  // Pop a node into place.
  function pop(tl, els, position, stagger) {
    if (!els || !els.length) return tl;
    tl.fromTo(els,
      { opacity: 0, scale: 0.2, transformOrigin: '50% 50%' },
      { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)',
        stagger: stagger === undefined ? 0.12 : stagger },
      position
    );
    return tl;
  }

  function rise(tl, els, position, stagger) {
    if (!els || !els.length) return tl;
    tl.fromTo(els,
      { opacity: 0, y: '+=14' },
      { opacity: 1, y: '-=14', duration: 0.45,
        stagger: stagger === undefined ? 0.09 : stagger },
      position
    );
    return tl;
  }

  /* ── one builder per concept ─────────────────────────────── */

  var builders = {

    repository: function (q) {
      var tl = gsap.timeline({ paused: true });
      gsap.set(q('.v-gitdir, .v-snap, .v-spine, .v-caption'), { opacity: 0 });

      tl.from(q('.v-folder'), { opacity: 0, scale: 0.94, transformOrigin: '50% 50%' });
      rise(tl, q('.v-file'), '-=0.15');
      pop(tl, q('.v-gitdir'), '+=0.1');
      wire(tl, q('.v-spine'), '300 158', 0.5, '-=0.1');
      pop(tl, q('.v-snap'), '-=0.25', 0.22);
      tl.to(q('.v-caption'), { opacity: 1 }, '-=0.1');
      return tl;
    },

    clone: function (q) {
      var tl = gsap.timeline({ paused: true });
      var packets = q('.v-packet');

      gsap.set(q('.v-wire, .v-cmd, .v-arrived, .v-caption'), { opacity: 0 });
      gsap.set(packets, { opacity: 0, x: 250, y: 140 });

      tl.from(q('.v-remote'), { opacity: 0, x: -18 })
        .from(q('.v-local'), { opacity: 0, x: 18 }, '-=0.35');
      wire(tl, q('.v-wire'), '240 140', 0.45, '-=0.1');
      tl.to(q('.v-cmd'), { opacity: 1 }, '-=0.3');

      tl.to(packets, {
        opacity: 1, duration: 0.15, stagger: 0.16
      }, '-=0.1');
      tl.to(packets, {
        x: 384, duration: 0.75, ease: 'power1.inOut', stagger: 0.16
      }, '<');
      tl.to(packets, {
        opacity: 0, duration: 0.15, stagger: 0.16
      }, '-=0.45');

      rise(tl, q('.v-arrived rect'), '-=0.3', 0.07);
      tl.to(q('.v-arrived'), { opacity: 1, duration: 0.01 }, '<')
        .to(q('.v-caption'), { opacity: 1 }, '-=0.1');
      return tl;
    },

    branch: function (q) {
      var tl = gsap.timeline({ paused: true });
      var main = q('.v-c--main');
      var feat = q('.v-c--feat');

      gsap.set(q('.v-fork, .v-forklabel, .v-mainlabel, .v-caption'), { opacity: 0 });

      draw(tl, q('.v-mainline')[0], 0.7);
      pop(tl, [main[0], main[1]], '-=0.35', 0.18);
      tl.to(q('.v-mainlabel'), { opacity: 1 }, '-=0.2');

      tl.to(q('.v-fork'), { opacity: 1, duration: 0.01 });
      draw(tl, q('.v-fork')[0], 0.7, '<');
      pop(tl, feat, '-=0.3', 0.2);
      tl.to(q('.v-forklabel'), { opacity: 1 }, '-=0.3');

      // main keeps moving in parallel — that's the whole point
      pop(tl, [main[2], main[3]], '-=0.5', 0.2);
      tl.to(q('.v-caption'), { opacity: 1 }, '-=0.1');
      return tl;
    },

    commit: function (q) {
      var tl = gsap.timeline({ paused: true });
      var files = q('.v-cf');

      gsap.set(q('.v-snapshot, .v-msg, .v-add, .v-commitcmd, .v-unstaged'), { opacity: 0 });
      gsap.set(q('.v-stagebox, .v-arrow1, .v-arrow2'), { opacity: 0 });

      rise(tl, files, 0, 0.1);
      tl.to(q('.v-stagebox'), { opacity: 1 }, '-=0.15');
      wire(tl, q('.v-arrow1'), '152 120', 0.35, '-=0.1');
      tl.to(q('.v-add'), { opacity: 1 }, '-=0.2');

      // only two of the three get staged — that is what the staging area is for
      tl.to(files[0], { x: 252, y: 92, duration: 0.6, ease: 'power2.inOut' }, '-=0.1')
        .to(files[1], { x: 252, y: 120, duration: 0.6, ease: 'power2.inOut' }, '<0.12')
        .to(files[2], { opacity: 0.3, duration: 0.4 }, '<')
        .to(q('.v-unstaged'), { opacity: 1 }, '<0.2');

      wire(tl, q('.v-arrow2'), '410 120', 0.35, '+=0.1');
      tl.to(q('.v-commitcmd'), { opacity: 1 }, '-=0.2');

      pop(tl, q('.v-snapshot'), '-=0.1');
      rise(tl, q('.v-msg'), '-=0.15');
      return tl;
    },

    pushpull: function (q) {
      var tl = gsap.timeline({ paused: true });

      gsap.set(q('.v-rc--new, .v-rc--mate, .v-lc--mate, .v-lc--new'), { opacity: 0 });
      gsap.set(q('.v-uparrow, .v-downarrow, .v-pushlabel, .v-pulllabel'), { opacity: 0 });

      pop(tl, q('.v-lc--new'), 0);
      wire(tl, q('.v-uparrow'), '256 180', 0.5, '-=0.1');
      tl.to(q('.v-pushlabel'), { opacity: 1 }, '-=0.35');
      pop(tl, q('.v-rc--new'), '-=0.1');

      // a teammate pushes something of their own
      pop(tl, q('.v-rc--mate'), '+=0.3');
      wire(tl, q('.v-downarrow'), '384 104', 0.5, '-=0.1');
      tl.to(q('.v-pulllabel'), { opacity: 1 }, '-=0.35');
      pop(tl, q('.v-lc--mate'), '-=0.1');
      return tl;
    },

    diff: function (q) {
      var tl = gsap.timeline({ paused: true });

      gsap.set(q('.v-sign'), { opacity: 0 });
      gsap.set(q('.v-scan'), { opacity: 0 });

      rise(tl, q('.v-dl'), 0, 0.07);
      rise(tl, q('.v-dr'), '<0.1', 0.07);

      tl.to(q('.v-scan'), { opacity: 0.6, duration: 0.2 })
        .fromTo(q('.v-scan'),
          { attr: { x1: 42, x2: 42 } },
          { attr: { x1: 598, x2: 598 }, duration: 0.9, ease: 'power1.inOut' }, '<')
        .to(q('.v-scan'), { opacity: 0, duration: 0.3 }, '-=0.15');

      // fromTo, not from: `from` would capture the opacity:0 that rise()
      // left behind and animate straight back to invisible.
      tl.fromTo(q('.v-dl--del'),
        { opacity: 0.25, scaleX: 0.3, transformOrigin: '0% 50%' },
        { opacity: 1, scaleX: 1, duration: 0.4, stagger: 0.12 }, '-=0.7');
      tl.fromTo(q('.v-dr--add'),
        { opacity: 0.25, scaleX: 0.3, transformOrigin: '0% 50%' },
        { opacity: 1, scaleX: 1, duration: 0.4, stagger: 0.12 }, '<0.1');

      pop(tl, q('.v-sign'), '-=0.2', 0.15);
      return tl;
    },

    merge: function (q) {
      var tl = gsap.timeline({ paused: true });

      gsap.set(q('.v-fork, .v-join, .v-mergecommit'), { opacity: 0 });

      draw(tl, q('.v-mainline')[0], 0.6);
      pop(tl, q('.v-c--main'), '-=0.3', 0.15);

      tl.to(q('.v-fork'), { opacity: 1, duration: 0.01 });
      draw(tl, q('.v-fork')[0], 0.55, '<');
      pop(tl, q('.v-c--feat'), '-=0.25', 0.18);

      tl.to(q('.v-join'), { opacity: 1, duration: 0.01 }, '+=0.15');
      draw(tl, q('.v-join')[0], 0.6, '<');
      pop(tl, q('.v-mergecommit'), '-=0.15');
      tl.fromTo(q('.v-mergecommit circle'),
        { scale: 1, transformOrigin: '50% 50%' },
        { scale: 1.18, duration: 0.28, yoyo: true, repeat: 1, ease: 'sine.inOut' });
      return tl;
    },

    rebase: function (q) {
      var tl = gsap.timeline({ paused: true });
      var moving = q('.v-rc-move');

      gsap.set(q('.v-ghost, .v-newbase, .v-caption'), { opacity: 0 });
      gsap.set(q('.v-oldbase'), { opacity: 0 });

      draw(tl, q('.v-mainline')[0], 0.6);
      pop(tl, q('.v-c--main'), '-=0.3', 0.12);

      tl.to(q('.v-oldbase'), { opacity: 0.5, duration: 0.4 }, '-=0.1');
      pop(tl, moving, '-=0.2', 0.15);

      // leave a dashed trace where the commits used to sit
      tl.to(q('.v-ghost'), { opacity: 1, duration: 0.3 }, '+=0.25')
        .to(q('.v-oldbase'), { opacity: 0.18, duration: 0.4 }, '<');

      // lift, carry across, set down on the new base
      tl.to(moving, { y: 68, duration: 0.35, stagger: 0.08 }, '-=0.1')
        .to(moving[0], { x: 470, duration: 0.75, ease: 'power2.inOut' }, '-=0.1')
        .to(moving[1], { x: 534, duration: 0.75, ease: 'power2.inOut' }, '<0.08')
        .to(moving, { y: 112, duration: 0.35, stagger: 0.08 }, '-=0.25');

      tl.to(q('.v-newbase'), { opacity: 1, duration: 0.01 }, '-=0.55');
      draw(tl, q('.v-newbase')[0], 0.6, '<');
      tl.to(q('.v-caption'), { opacity: 1 }, '-=0.1');
      return tl;
    },

    conflict: function (q) {
      var tl = gsap.timeline({ paused: true });

      gsap.set(q('.v-carrow, .v-clash, .v-resolvearrow, .v-choose'), { opacity: 0 });
      gsap.set(q('.v-resolved'), { opacity: 0, scale: 0.9, transformOrigin: '50% 50%' });

      tl.from(q('.v-side--a'), { opacity: 0, x: -20 })
        .from(q('.v-side--b'), { opacity: 0, x: 20 }, '<');

      tl.to(q('.v-carrow'), { opacity: 1, duration: 0.01 });
      draw(tl, q('.v-carrow')[0], 0.5, '<');
      draw(tl, q('.v-carrow')[1], 0.5, '<');

      pop(tl, q('.v-clash'), '-=0.15');
      // the shudder is the point: Git has stopped and is waiting for you
      tl.to(q('.v-clash'), {
        x: 5, duration: 0.07, repeat: 5, yoyo: true, ease: 'none'
      }).to(q('.v-clash'), { x: 0, duration: 0.07 });

      // the markers stay on screen — resolving is a choice made beside them,
      // not a magic replacement
      tl.to(q('.v-resolvearrow'), { opacity: 1, duration: 0.01 }, '+=0.35');
      draw(tl, q('.v-resolvearrow')[0], 0.35, '<');
      tl.to(q('.v-choose'), { opacity: 1 }, '-=0.2');
      tl.to(q('.v-resolved'), { opacity: 1, scale: 1, duration: 0.45,
        ease: 'back.out(1.8)' }, '-=0.1');
      return tl;
    },

    pr: function (q) {
      var tl = gsap.timeline({ paused: true });

      gsap.set(q('.v-review, .v-mergebtn'), { opacity: 0 });

      tl.from(q('.v-prcard'), { opacity: 0, y: 18, duration: 0.55 });
      rise(tl, q('.v-review'), '-=0.15', 0.35);
      pop(tl, q('.v-mergebtn'), '+=0.2');
      tl.fromTo(q('.v-mergebtn rect'),
        { scale: 1, transformOrigin: '50% 50%' },
        { scale: 1.06, duration: 0.35, yoyo: true, repeat: 1, ease: 'sine.inOut' });
      return tl;
    },

    issue: function (q) {
      var tl = gsap.timeline({ paused: true });

      gsap.set(q('.v-chip, .v-link, .v-closed'), { opacity: 0 });

      tl.from(q('.v-issuecard'), { opacity: 0, y: 18, duration: 0.55 });
      pop(tl, q('.v-chip'), '-=0.1', 0.14);
      rise(tl, q('.v-link'), '+=0.15');
      pop(tl, q('.v-closed'), '+=0.25');
      return tl;
    }
  };

  /* ── wire everything up ──────────────────────────────────── */

  var timelines = [];

  document.querySelectorAll('.viz').forEach(function (svg) {
    var build = builders[svg.dataset.viz];
    if (!build) return;

    var tl = build(gsap.utils.selector(svg));
    timelines.push(tl);

    if (reduced) {
      tl.progress(1);
      return;
    }

    var stage = svg.closest('.stage');
    var button = stage && stage.querySelector('.replay');
    if (button) {
      button.addEventListener('click', function () { tl.restart(); });
    }

    var played = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !played) {
          played = true;
          tl.play();
          io.disconnect();
        }
      });
    }, { threshold: 0.35 });

    io.observe(svg);
  });

  /* ── highlight the nav chip for the section you're reading ── */

  var links = {};
  document.querySelectorAll('.chipnav a').forEach(function (a) {
    links[a.getAttribute('href').slice(1)] = a;
  });

  var current = null;
  var navIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var link = links[entry.target.id];
      if (!link || link === current) return;
      if (current) current.removeAttribute('aria-current');
      link.setAttribute('aria-current', 'true');
      current = link;
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  document.querySelectorAll('.concept').forEach(function (s) { navIO.observe(s); });
})();
