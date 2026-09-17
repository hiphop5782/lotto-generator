(() => {
  const slots = [...document.querySelectorAll('[data-ticket-ad]')];
  const requested = new WeakSet();

  function requestAd(slot) {
    if (requested.has(slot) || slot.getBoundingClientRect().width < 300) return;
    // Insert only visible units, so AdSense never selects a hidden mobile/desktop unit.
    const unit = document.createElement('ins');
    unit.className = 'adsbygoogle';
    unit.style.cssText = 'display:block;width:300px;height:250px';
    unit.dataset.adClient = 'ca-pub-3737135009848849';
    // Reuse the existing display ad unit; no account-side setup is required.
    unit.dataset.adSlot = '5213473237';
    unit.dataset.fullWidthResponsive = 'false';
    slot.appendChild(unit);
    requested.add(slot);
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      // Leave the reserved space intact if the provider is blocked or unavailable.
      console.warn('Ticket ad could not initialize:', error.message);
    }
  }

  const loadObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) requestAd(entry.target); });
  }, { threshold: 0 });
  slots.forEach(slot => loadObserver.observe(slot));
})();
