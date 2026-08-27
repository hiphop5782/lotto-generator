(() => {
  const track = document.getElementById('reviewsTrack');
  if (!track) return;

  const escapeHtml = value => String(value).replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);

  fetch('reviews.json', { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error(`reviews.json: ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data.reviews) || !data.reviews.length) {
        throw new Error('테스트 데이터 형식이 올바르지 않습니다.');
      }
      const reviews = data.reviews.slice(0, 200);
      let current = 0;
      const render = () => {
        const review = reviews[current];
        track.classList.remove('is-visible');
        window.setTimeout(() => {
          track.innerHTML = `<article class="review-card"><div class="review-meta"><span>USER</span><b>${escapeHtml(review.author)}</b></div><h3>${escapeHtml(review.title)}</h3><p>${escapeHtml(review.content)}</p></article>`;
          track.classList.add('is-visible');
        }, 180);
      };
      render();
      window.setInterval(() => { current = (current + 1) % reviews.length; render(); }, Math.max(data.interval || 2600, 1200));
    })
    .catch(() => {
      track.innerHTML = '<p class="reviews-error">메시지는 웹 서버에서 실행할 때 표시됩니다.</p>';
    });
})();
