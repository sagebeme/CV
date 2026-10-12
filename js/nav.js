// Highlight the nav link for the section on screen. The page works without it.
const links = new Map(
  [...document.querySelectorAll('.site-nav a[href^="#"]')].map((a) => [a.getAttribute('href').slice(1), a])
);

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const a of links.values()) a.removeAttribute('aria-current');
      links.get(entry.target.id)?.setAttribute('aria-current', 'true');
    }
  },
  { rootMargin: '-45% 0px -50% 0px' }
);

for (const id of links.keys()) {
  const section = document.getElementById(id);
  if (section) observer.observe(section);
}
