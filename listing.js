function getListingIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

function renderProductCard(product) {
  const actionLabel = getProductActionLabel(product);
  const variant = product.variant ? '<p class="listing-product-variant">' + escapeHtml(product.variant) + '</p>' : '';

  return (
    '<article class="listing-detail-card listing-product-card">' +
      '<img src="' + escapeHtml(getCardImage(product)) + '" onerror="this.onerror=null;this.src=\'' + IMAGE_PLACEHOLDER + '\'" alt="' + escapeHtml(product.name) + '" loading="lazy" />' +
      '<div class="listing-product-body">' +
        '<h3>' + escapeHtml(product.name) + '</h3>' +
        '<p>' + escapeHtml(product.setName) + '</p>' +
        variant +
        '<div class="listing-product-meta">' +
          '<span class="listing-type">' + escapeHtml(product.saleType) + '</span>' +
          '<span class="listing-status listing-status-' + escapeHtml(product.status) + '">' + escapeHtml(getStatusLabel(product.status)) + '</span>' +
        '</div>' +
        '<p class="listing-product-price">' + escapeHtml(product.priceLabel) + '</p>' +
        '<button class="btn btn-primary listing-product-action" type="button" data-product-id="' + escapeHtml(product.id) + '" data-action-label="' + escapeHtml(actionLabel) + '">' + escapeHtml(actionLabel) + '</button>' +
      '</div>' +
    '</article>'
  );
}

function renderListingPage() {
  const container = document.getElementById('listing-detail');
  if (!container) return;

  const listing = getListingById(getListingIdFromUrl());
  if (!listing) {
    container.innerHTML =
      '<div class="empty-state">' +
        '<p class="empty-state-title">Oppføringen finnes ikke</p>' +
        '<p class="empty-state-desc">Gå tilbake til forsiden og velg en annen oppføring.</p>' +
        '<a class="btn btn-secondary" href="index.html">Til forsiden</a>' +
      '</div>';
    return;
  }

  const products = getListingProducts(listing);
  const typeSummary = getSaleTypesSummary(listing);
  const productCountLabel = products.length === 1 ? '1 produkt' : products.length + ' produkter';

  container.innerHTML =
    '<a class="btn btn-secondary marketplace-back" href="index.html">Tilbake til oversikten</a>' +
    '<div class="listing-detail-header">' +
      '<div>' +
        '<p class="listing-seller">' + escapeHtml(listing.sellerName) + '</p>' +
        '<h1 class="listing-detail-title">' + escapeHtml(listing.title) + '</h1>' +
        '<p class="listing-meta-line">' + escapeHtml(productCountLabel + (typeSummary ? ' · ' + typeSummary : '')) + '</p>' +
      '</div>' +
      '<div class="listing-detail-meta">' +
        '<span class="listing-type">' + escapeHtml(listing.listingMode || 'single-products') + '</span>' +
        '<span class="listing-status listing-status-' + escapeHtml(listing.status) + '">' + escapeHtml(getStatusLabel(listing.status)) + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="listing-detail-grid">' +
      products.map(renderProductCard).join('') +
    '</div>';

  bindProductActions(listing, products);
}

function bindProductActions(listing, products) {
  document.querySelectorAll('.listing-product-action').forEach(button => {
    button.addEventListener('click', () => {
      const product = products.find(item => item.id === button.dataset.productId);
      if (!product) return;
      const message = button.dataset.actionLabel + ': ' + product.name;
      console.log(message, { listingId: listing.id, productId: product.id });
      alert(message);
    });
  });
}

document.addEventListener('DOMContentLoaded', renderListingPage);
