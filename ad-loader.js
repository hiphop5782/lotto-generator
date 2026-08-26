(() => {
  const FALLBACK_PUBLISHER = 'pub-3737135009848849';

  async function getPublisherId() {
    try {
      const response = await fetch('ads.txt', { cache: 'no-store' });
      if (!response.ok) throw new Error(`ads.txt: ${response.status}`);
      const match = (await response.text()).match(/google\.com\s*,\s*(pub-\d+)/i);
      return match?.[1] || FALLBACK_PUBLISHER;
    } catch {
      // file:// 미리보기에서는 fetch가 막힐 수 있으므로 현재 ads.txt 값을 사용한다.
      return FALLBACK_PUBLISHER;
    }
  }

  async function initializeAdsense() {
    const publisher = await getPublisherId();
    const client = `ca-${publisher}`;
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    document.head.appendChild(script);

    const unit = document.querySelector('#adSlotTop .adsbygoogle');
    const placeholder = document.querySelector('#adSlotTop .ad-placeholder');
    const slot = unit?.dataset.adSlot?.trim();
    if (!unit || !/^\d+$/.test(slot || '')) return;

    unit.dataset.adClient = client;
    unit.hidden = false;
    placeholder?.remove();
    script.addEventListener('load', () => {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }, { once: true });
  }

  initializeAdsense();
})();
