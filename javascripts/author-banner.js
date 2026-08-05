document$.subscribe(function () {
  var authorMeta = document.querySelector('meta[name="article-author"]');
  var dateMeta   = document.querySelector('meta[name="article-date"]');
  var sourceMeta = document.querySelector('meta[name="article-source"]');
  var article    = document.querySelector('.md-content__inner');

  if (!article) return;
  if (!authorMeta && !dateMeta && !sourceMeta) return;
  if (article.querySelector('.author-banner')) return;

  var parts = [];

  if (authorMeta) {
    parts.push('Автор: <strong>' + authorMeta.getAttribute('content') + '</strong>');
  }
  if (dateMeta) {
    parts.push('' + dateMeta.getAttribute('content'));
  }
  if (sourceMeta) {
    var url = sourceMeta.getAttribute('content');
    parts.push('Источник: <a href="' + url + '" target="_blank" rel="noopener">' + url + '</a>');
  }

  var banner = document.createElement('div');
  banner.className = 'author-banner';
  banner.innerHTML = parts.join(' · ');
  article.prepend(banner);
});
