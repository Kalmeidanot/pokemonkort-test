function getListingIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

const PRODUCT_FILTERS = [
  { value: 'all', label: 'Alle' },
  { value: 'Fastprisannonse', label: 'Fastpris' },
  { value: 'Claim-salg', label: 'Claim' },
  { value: 'Auksjon', label: 'Auksjon' },
  { value: 'Auksjon uten minstepris', label: 'Auksjon uten minstepris' },
  { value: 'Lynauksjon', label: 'Lynauksjon' },
  { value: 'ended', label: 'Avsluttet' }
];

let currentProductFilter = 'all';

function getVisibleProducts(products) {
  if (currentProductFilter === 'all') return products;
  if (currentProductFilter === 'ended') return products.filter(product => product.status === 'ended');
  return products.filter(product => product.saleType === currentProductFilter && product.status !== 'ended');
}

function renderProductFilters() {
  return (
    '<div class="listing-product-filters" role="tablist" aria-label="Filtrer produkter i salgsbordet">' +
      PRODUCT_FILTERS.map(filter => {
        const activeClass = filter.value === currentProductFilter ? ' active' : '';
        return '<button class="listing-filter-tab' + activeClass + '" type="button" data-product-filter="' + escapeHtml(filter.value) + '">' + escapeHtml(filter.label) + '</button>';
      }).join('') +
    '</div>'
  );
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
        '<p class="empty-state-title">Salgsbordet finnes ikke</p>' +
        '<p class="empty-state-desc">Gå tilbake til forsiden og velg et annet salgsbord.</p>' +
        '<a class="btn btn-secondary" href="index.html">Til forsiden</a>' +
      '</div>';
    return;
  }

  const products = getListingProducts(listing);
  const visibleProducts = getVisibleProducts(products);
  const typeSummary = getSaleTypesSummary(listing);
  const productCountLabel = products.length === 1 ? '1 produkt' : products.length + ' produkter';

  container.innerHTML =
    '<a class="btn btn-secondary marketplace-back" href="index.html">Tilbake til oversikten</a>' +
    '<div class="listing-detail-header">' +
      '<div>' +
        '<p class="listing-seller">' + escapeHtml(listing.sellerName) + '</p>' +
        '<h1 class="listing-detail-title">Salgsbord: ' + escapeHtml(listing.title) + '</h1>' +
        '<p class="listing-meta-line">' + escapeHtml(productCountLabel + (typeSummary ? ' · ' + typeSummary : '')) + '</p>' +
      '</div>' +
      '<div class="listing-detail-meta">' +
        '<span class="listing-type">Salgsbord</span>' +
        '<span class="listing-status listing-status-' + escapeHtml(listing.status) + '">' + escapeHtml(getStatusLabel(listing.status)) + '</span>' +
      '</div>' +
    '</div>' +
    renderProductFilters() +
    '<div class="listing-detail-grid">' +
      (visibleProducts.length
        ? visibleProducts.map(renderProductCard).join('')
        : '<div class="empty-state"><p class="empty-state-title">Ingen produkter funnet</p><p class="empty-state-desc">Velg et annet filter.</p></div>') +
    '</div>';

  bindProductFilters();
  bindProductActions(listing, products);
}

function bindProductFilters() {
  document.querySelectorAll('.listing-filter-tab').forEach(button => {
    button.addEventListener('click', () => {
      currentProductFilter = button.dataset.productFilter || 'all';
      renderListingPage();
    });
  });
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
