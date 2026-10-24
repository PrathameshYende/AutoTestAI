/* GSAP animation helpers. Every function takes a root element and only
   animates what is inside it, so screens stay independent.

   Markup hooks:
     .a-up       fade + rise in, staggered
     .a-fade     fade in
     .a-left     slide in from the left
     .a-bar      grow vertically from the bottom (chart bars)
     .a-fill     grow horizontally from the left (progress bars)
     .a-pop      scale in with a small overshoot
     .a-line     draw an SVG stroke
     .a-log      terminal lines typed in one after another
     [data-count] number counter: data-count="1248" data-decimals="1" data-suffix="%" */
(function () {
  var gsap = window.gsap;
  gsap.config({ nullTargetWarn: false });
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fmt(v, decimals) {
    return Number(v).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  function counters(root) {
    root.querySelectorAll("[data-count]").forEach(function (el) {
      var end = parseFloat(el.getAttribute("data-count"));
      var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduce || isNaN(end)) { el.textContent = fmt(end, dec) + suffix; return; }
      var obj = { v: 0 };
      gsap.to(obj, {
        v: end, duration: 1.4, ease: "power3.out", delay: 0.15,
        onUpdate: function () { el.textContent = fmt(obj.v, dec) + suffix; }
      });
    });
  }

  function pageIntro(root) {
    if (!root || !gsap) return function () {};
    var ctx = gsap.context(function () {
      if (reduce) { counters(root); return; }
      var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      // stagger(each, maxTotal): keeps long lists from dragging the intro out.
      var st = function (each, max) { return function (n) { return Math.min(each, max / Math.max(n, 1)); }; };
      var q = function (sel) { return root.querySelectorAll(sel); };
      var up = q(".a-up"), fade = q(".a-fade"), left = q(".a-left"), pop = q(".a-pop"), bar = q(".a-bar"), fill = q(".a-fill");
      tl.from(up, { y: 18, autoAlpha: 0, duration: 0.6, stagger: st(0.045, 0.6)(up.length) })
        .from(fade, { autoAlpha: 0, duration: 0.6, stagger: st(0.04, 0.5)(fade.length) }, 0.1)
        .from(left, { x: -24, autoAlpha: 0, duration: 0.5, stagger: st(0.05, 0.5)(left.length) }, 0.15)
        .from(pop, { scale: 0.85, autoAlpha: 0, duration: 0.5, stagger: st(0.04, 0.4)(pop.length), ease: "back.out(1.8)" }, 0.2)
        .from(bar, { scaleY: 0, transformOrigin: "50% 100%", duration: 0.9, stagger: st(0.05, 0.5)(bar.length), ease: "power4.out" }, 0.25)
        .from(fill, { scaleX: 0, transformOrigin: "0% 50%", duration: 1.1, stagger: st(0.06, 0.5)(fill.length), ease: "power2.out" }, 0.3);

      root.querySelectorAll(".a-line").forEach(function (p) {
        if (!p.getTotalLength) return;
        var len = p.getTotalLength();
        gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", delay: 0.4 });
      });

      var logs = root.querySelectorAll(".a-log");
      if (logs.length) gsap.from(logs, { autoAlpha: 0, x: -8, duration: 0.35, stagger: Math.min(0.12, 1 / logs.length), delay: 0.4, ease: "power1.out" });

      counters(root);
    }, root);
    return function () { ctx.revert(); };
  }

  // Re-run bars + fills when chart data changes (range toggles, tabs).
  function refreshBars(root) {
    if (!root || reduce) return;
    gsap.fromTo(root.querySelectorAll(".a-bar"), { scaleY: 0, transformOrigin: "50% 100%" },
      { scaleY: 1, duration: 0.7, stagger: 0.04, ease: "power3.out" });
  }

  function staggerIn(nodes) {
    if (!nodes || reduce) return;
    gsap.fromTo(nodes, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: Math.min(0.04, 0.4 / Math.max(nodes.length, 1)), ease: "power2.out" });
  }

  function expand(el) {
    if (!el || reduce) return;
    gsap.fromTo(el, { height: 0, autoAlpha: 0 }, { height: "auto", autoAlpha: 1, duration: 0.45, ease: "power2.out" });
  }

  // Shell entrance — sidebar links + topbar, run once per shell mount.
  function shellIntro(root) {
    if (!root || reduce) return function () {};
    var ctx = gsap.context(function () {
      gsap.from(root.querySelectorAll(".sb-link, .sb-new"), { x: -16, autoAlpha: 0, duration: 0.45, stagger: 0.025, ease: "power2.out" });
      gsap.from(root.querySelectorAll(".topbar > *"), { y: -10, autoAlpha: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" });
    }, root);
    return function () { ctx.revert(); };
  }

  // Ambient glows drifting behind dark hero areas.
  function drift(nodes) {
    if (!nodes || reduce) return;
    nodes.forEach(function (n, i) {
      gsap.to(n, { x: "random(-40, 40)", y: "random(-30, 30)", duration: 6 + i * 2, repeat: -1, yoyo: true, ease: "sine.inOut" });
    });
  }

  // Simulated pointer moving to a target (live runner viewports).
  function pointer(el, target) {
    if (!el || !target || reduce) return;
    gsap.killTweensOf(el);
    gsap.timeline({ repeat: -1, repeatDelay: 1.2 })
      .set(el, { x: 0, y: 0, autoAlpha: 1 })
      .to(el, { x: target.x, y: target.y, duration: 1.4, ease: "power2.inOut" })
      .to(el, { scale: 0.8, duration: 0.12, yoyo: true, repeat: 1 })
      .to(el, { autoAlpha: 0, duration: 0.4, delay: 0.6 });
  }

  function press(el) {
    if (!el || reduce) return;
    gsap.fromTo(el, { scale: 0.96 }, { scale: 1, duration: 0.35, ease: "back.out(3)" });
  }

  window.Anim = {
    pageIntro: pageIntro, refreshBars: refreshBars, staggerIn: staggerIn, expand: expand,
    shellIntro: shellIntro, drift: drift, pointer: pointer, press: press, counters: counters
  };
})();
