// Home page hero: masked word entrance on load, differential parallax on
// scroll, and reveal-on-enter for the content blocks below.
(function () {
  var hero = document.getElementById("hero");
  if (!hero) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      var inner = document.createElement("span");
      inner.textContent = word;
      inner.style.transitionDelay = i * 110 + "ms";
      mask.appendChild(inner);
      name.appendChild(mask);
    });
  }

  // Kick off the entrance on the next frame so transitions actually run.
  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () {
      hero.classList.add("is-ready");
    });
  });

  // --- Scroll-driven motion ---
  if (!reduce) {
    var ticking = false;

    function update() {
      var h = hero.offsetHeight || 1;
      var y = window.scrollY || window.pageYOffset || 0;
      var p = y / h;
      if (p > 1) p = 1;
      if (p < 0) p = 0;

      // Layers move at different rates, which is what reads as depth.
      if (name) {
        name.style.transform = "translateY(" + -p * 130 + "px) scale(" + (1 - p * 0.06) + ")";
        name.style.opacity = String(Math.max(1 - p * 1.5, 0));
      }
      if (tagline) {
        tagline.style.transform = "translateY(" + -p * 55 + "px)";
        tagline.style.opacity = String(Math.max(1 - p * 2, 0));
      }
      if (cue) {
        cue.style.opacity = String(Math.max(1 - p * 3, 0));
      }
      // The rule tracks scroll progress once the entrance has finished.
      if (rule && hero.classList.contains("is-settled")) {
        rule.style.width = 210 + p * 260 + "px";
        rule.style.maxWidth = "none";
        rule.style.opacity = String(Math.max(1 - p * 1.6, 0));
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

    // Hand the rule over to scroll control after its intro transition.
    window.setTimeout(function () {
      hero.classList.add("is-settled");
      if (rule) rule.style.transition = "opacity 0.3s ease";
      update();
    }, 1700);

    update();
  }

  // --- Smooth scroll from the cue into the content ---
  if (cue) {
    cue.addEventListener("click", function (e) {
      var target = document.getElementById("main-content");
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  // --- Reveal content blocks on entry ---
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
})();
