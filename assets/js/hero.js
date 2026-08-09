// Home page hero.
// Load: each word rises out of a mask, the rule draws, the tagline lifts.
// Scroll: the stage is pinned and scroll position scrubs a sequence that
// drives the title toward the viewer until it passes out of frame, while the
// page content rises up behind it.
(function () {
  var hero = document.getElementById("hero");
  var stage = document.getElementById("hero-stage");
  if (!hero || !stage) return;

  document.body.classList.add("hero-enabled");

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var inner = hero.querySelector(".hero-inner");
  var name = hero.querySelector(".hero-name");
  var rule = hero.querySelector(".hero-rule");
  var tagline = hero.querySelector(".hero-tagline");
  var cue = hero.querySelector(".hero-scroll");

  // --- Split the name into masked words so each can rise independently ---
  if (name && !reduce) {
    var original = (name.textContent || "").trim();
    var words = original.split(/\s+/);
    name.textContent = "";
    // The visual split loses inter-word whitespace, so expose the intact
    // string to assistive tech and hide the decorative pieces from it.
    name.setAttribute("aria-label", original);
    words.forEach(function (word, i) {
      var mask = document.createElement("span");
      mask.className = "hero-word";
      mask.setAttribute("aria-hidden", "true");
      var span = document.createElement("span");
      span.textContent = word;
      span.style.transitionDelay = i * 110 + "ms";
      mask.appendChild(span);
      name.appendChild(mask);
    });
  }

  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () {
      hero.classList.add("is-ready");
    });
  });

  if (reduce) {
    initReveal();
    return;
  }

  // --- Scroll-scrubbed sequence over the pinned stage ---
  var ticking = false;
  var settled = false;

  // Ease so the first part of the scroll is gentle and the exit accelerates.
  function easeIn(t) {
    return t * t;
  }

  function update() {
    var rect = stage.getBoundingClientRect();
    var runway = stage.offsetHeight - window.innerHeight;
    var p = runway > 0 ? -rect.top / runway : 0;
    if (p < 0) p = 0;
    if (p > 1) p = 1;

    var e = easeIn(p);

    // The title accelerates toward the viewer and drifts up out of frame.
    if (name) {
      name.style.transform = "translate3d(0," + -e * 180 + "px," + e * 620 + "px) scale(" + (1 + e * 0.12) + ")";
      name.style.letterSpacing = -0.035 + e * 0.06 + "em";
      name.style.opacity = String(Math.max(1 - easeIn(p / 0.88), 0));
    }

    // Supporting layers leave earlier and slower, which sells the depth.
    if (tagline) {
      tagline.style.transform = "translate3d(0," + -p * 90 + "px,0)";
      tagline.style.opacity = String(Math.max(1 - p * 1.9, 0));
    }
    if (cue) {
      cue.style.opacity = String(Math.max(1 - p * 4, 0));
    }
    if (rule && settled) {
      rule.style.width = 210 + p * 900 + "px";
      rule.style.opacity = String(Math.max(1 - p * 1.9, 0));
    }
    // A slight lift on the whole group keeps it feeling like one object.
    if (inner) {
      inner.style.transform = "translate3d(0," + -p * 40 + "px,0)";
    }

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );

  window.addEventListener(
    "resize",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );

  // Hand the rule over to scroll control once its intro transition finishes.
  window.setTimeout(function () {
    settled = true;
    if (rule) rule.style.transition = "opacity 0.3s ease";
    update();
  }, 1700);

  update();

  // --- Smooth scroll from the cue into the content ---
  if (cue) {
    cue.addEventListener("click", function (e) {
      var target = document.getElementById("main-content");
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  initReveal();

  // --- Reveal content blocks on entry ---
  function initReveal() {
    if (reduce || !("IntersectionObserver" in window)) return;

    var main = document.getElementById("main-content");
    if (!main) return;

    var targets = main.querySelectorAll("article > *:not(.profile)");
    if (!targets.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    Array.prototype.forEach.call(targets, function (el, i) {
      el.classList.add("hero-reveal");
      el.style.transitionDelay = Math.min(i * 70, 280) + "ms";
      observer.observe(el);
    });

    // Failsafe: never leave content hidden if the observer misses anything.
    window.setTimeout(function () {
      Array.prototype.forEach.call(targets, function (el) {
        el.classList.add("is-visible");
      });
    }, 2500);
  }
})();
