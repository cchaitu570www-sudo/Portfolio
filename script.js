const blocks = document.querySelectorAll('.reveal');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.18 });

  blocks.forEach((block, i) => {
    block.style.transitionDelay = `${Math.min(i * 70, 210)}ms`;
    observer.observe(block);
  });
} else {
  blocks.forEach((block) => block.classList.add('in'));
}
