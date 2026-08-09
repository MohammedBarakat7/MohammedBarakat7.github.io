// Home page hero: fade and drift the title panel out as the page scrolls
// under it, then reveal content blocks as they enter the viewport.
(function () {
  var hero = document.getElementById("hero");
  if (!hero) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Hero parallax fade ---
  if (!reduce) {
    var inner = hero.querySelector(".hero-inner");
    var ticking = false;

    function update() {
      var h = hero.offsetHeight || 1;
      var y = window.scrollY || window.pageYOffset || 0;
      var p = Math.min(y / h, 1);
      hero.style.opacity = String(1 - p * 1.15 < 0 ? 0 : 1 - p * 1.15);
      if (inner) inner.style.transform = "translateY(" + p * 60 + "px)";
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

    update();
  }

  // --- Smooth scroll from the hero cue to the content ---
  var cue = hero.querySelector(".hero-scroll");
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

  var targets = main.querySelectorAll("article > *:not(.profile), .post-header");
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
    el.style.transitionDelay = Math.min(i * 60, 240) + "ms";
    observer.observe(el);
  });

  // Failsafe: never leave content hidden if the observer misses anything.
  window.setTimeout(function () {
    Array.prototype.forEach.call(targets, function (el) {
      el.classList.add("is-visible");
    });
  }, 2500);
})();
