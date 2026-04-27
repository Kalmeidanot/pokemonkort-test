const LISTING_TYPES = [
  'Fastprisannonse',
  'Claim-salg',
  'Auksjon',
  'Auksjon uten minstepris',
  'Lynauksjon'
];

const IMAGE_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420">' +
    '<rect width="300" height="420" rx="18" fill="#F0ECE7"/>' +
    '<rect x="34" y="34" width="232" height="352" rx="14" fill="#FFFFFF" stroke="#D6D3D1" stroke-width="4"/>' +
    '<text x="150" y="206" text-anchor="middle" font-family="Arial" font-size="22" fill="#846C64">Kortbilde</text>' +
    '<text x="150" y="238" text-anchor="middle" font-family="Arial" font-size="16" fill="#846C64">kommer</text>' +
    '</svg>'
  );

const MOCK_LISTINGS = [
  {
    id: 'listing-1',
    sellerName: 'Testselger',
    title: 'Base Set singles fra Testselger',
    status: 'active',
    listingMode: 'single-products',
    cards: [
      {
        id: 'product-1',
        name: 'Alakazam',
        setName: 'Base Set',
        variant: 'Unlimited',
        image: 'images/cards/base1/unlimited/001-alakazam.png',
        saleType: 'Fastprisannonse',
        priceLabel: '350 kr',
        status: 'active'
      },
      {
        id: 'product-2',
        name: 'Blastoise',
        setName: 'Base Set',
        variant: 'Shadowless',
        image: 'images/cards/base1/shadowless/002-blastoise.png',
        saleType: 'Auksjon',
        priceLabel: 'Nåværende bud: 850 kr',
        status: 'active'
      },
      {
        id: 'product-3',
        name: 'Charizard',
        setName: 'Base Set',
        variant: 'Unlimited',
        image: 'images/cards/base1/unlimited/004-charizard.png',
        saleType: 'Auksjon uten minstepris',
        priceLabel: 'Nåværende bud: 1 650 kr',
        status: 'active'
      }
    ]
  },
  {
    id: 'listing-2',
    sellerName: 'KortKari',
    title: 'Startere fra Scarlet & Violet 151',
    status: 'active',
    listingMode: 'single-products',
    cards: [
      {
        id: 'product-4',
        name: 'Bulbasaur',
        setName: 'Scarlet & Violet 151',
        variant: '',
        image: 'images/cards/sv151/large/001-bulbasaur.png',
        saleType: 'Fastprisannonse',
        priceLabel: '150 kr',
        status: 'active'
      },
      {
        id: 'product-5',
        name: 'Charmander',
        setName: 'Scarlet & Violet 151',
        variant: '',
        image: 'images/cards/sv151/large/004-charmander.png',
        saleType: 'Fastprisannonse',
        priceLabel: '175 kr',
        status: 'active'
      },
      {
        id: 'product-6',
        name: 'Squirtle',
        setName: 'Scarlet & Violet 151',
        variant: '',
        image: 'images/cards/sv151/large/007-squirtle.png',
        saleType: 'Claim-salg',
        priceLabel: 'Claim: 160 kr',
        status: 'active'
      }
    ]
  },
  {
    id: 'listing-3',
    sellerName: 'ClaimMorten',
    title: 'Reverse holo claim-kveld',
    status: 'active',
    listingMode: 'single-products',
    cards: [
      {
        id: 'product-7',
        name: 'Caterpie',
        setName: 'Scarlet & Violet 151',
        variant: 'Reverse holo',
        image: 'images/cards/sv151/large/010-caterpie.png',
        saleType: 'Claim-salg',
        priceLabel: 'Claim: 45 kr',
        status: 'active'
      },
      {
        id: 'product-8',
        name: 'Metapod',
        setName: 'Scarlet & Violet 151',
        variant: 'Reverse holo',
        image: 'images/cards/sv151/large/011-metapod.png',
        saleType: 'Claim-salg',
        priceLabel: 'Claim: 45 kr',
        status: 'active'
      }
    ]
  },
  {
    id: 'listing-4',
    sellerName: 'AuksjonAnna',
    title: 'Shadowless grail preview',
    status: 'active',
    listingMode: 'single-products',
    cards: [
      {
        id: 'product-9',
        name: 'Blastoise',
        setName: 'Base Set',
        variant: 'Shadowless',
        image: 'images/cards/base1/shadowless/002-blastoise.png',
        saleType: 'Auksjon uten minstepris',
        priceLabel: 'Nåværende bud: 1 100 kr',
        status: 'active'
      }
    ]
  },
  {
    id: 'listing-5',
    sellerName: 'LynLars',
    title: 'Special art lynauksjon',
    status: 'active',
    listingMode: 'single-products',
    cards: [
      {
        id: 'product-10',
        name: 'Venusaur ex',
        setName: 'Scarlet & Violet 151',
        variant: 'Special art',
        image: 'images/cards/sv151/large/003-venusaur-ex.png',
        saleType: 'Lynauksjon',
        priceLabel: 'Nåværende bud: 340 kr',
        status: 'active'
      },
      {
        id: 'product-11',
        name: 'Charizard ex',
        setName: 'Scarlet & Violet 151',
        variant: 'Special art',
        image: 'images/cards/sv151/large/006-charizard-ex.png',
        saleType: 'Lynauksjon',
        priceLabel: 'Nåværende bud: 520 kr',
        status: 'active'
      },
      {
        id: 'product-12',
        name: 'Blastoise ex',
        setName: 'Scarlet & Violet 151',
        variant: 'Special art',
        image: 'images/cards/sv151/large/009-blastoise-ex.png',
        saleType: 'Lynauksjon',
        priceLabel: 'Nåværende bud: 410 kr',
        status: 'active'
      }
    ]
  },
  {
    id: 'listing-6',
    sellerName: 'RetroRune',
    title: 'Base Set Trainer-singles',
    status: 'ended',
    listingMode: 'single-products',
    cards: [
      {
        id: 'product-13',
        name: 'Computer Search',
        setName: 'Base Set',
        variant: 'Unlimited',
        image: 'images/cards/base1/unlimited/071-computer-search.png',
        saleType: 'Fastprisannonse',
        priceLabel: '120 kr',
        status: 'ended'
      },
      {
        id: 'product-14',
        name: 'Professor Oak',
        setName: 'Base Set',
        variant: 'Unlimited',
        image: 'images/cards/base1/unlimited/088-professor-oak.png',
        saleType: 'Fastprisannonse',
        priceLabel: '100 kr',
        status: 'ended'
      }
    ]
  },
  {
    id: 'listing-7',
    sellerName: 'PromoPer',
    title: 'Mew ex promoauksjon',
    status: 'ended',
    listingMode: 'single-products',
    cards: [
      {
        id: 'product-15',
        name: 'Mew ex',
        setName: 'Promo',
        variant: '',
        image: '',
        saleType: 'Auksjon',
        priceLabel: 'Sluttbud: 780 kr',
        status: 'ended'
      }
    ]
  }
];

let currentListingType = 'all';
let currentListingStatus = 'active';
let carouselIndexes = {};

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initMarketplaceFilters() {
  const typeSelect = document.getElementById('listing-type-filter');
  const statusSelect = document.getElementById('listing-status-filter');

  if (typeSelect) {
    typeSelect.innerHTML =
      '<option value="all">Alle</option>' +
      LISTING_TYPES.map(type => '<option value="' + escapeHtml(type) + '">' + escapeHtml(type) + '</option>').join('');
    typeSelect.value = currentListingType;
    typeSelect.addEventListener('change', () => {
      currentListingType = typeSelect.value;
      renderMarketplaceListings();
    });
  }

  if (statusSelect) {
    statusSelect.value = currentListingStatus;
    statusSelect.addEventListener('change', () => {
      currentListingStatus = statusSelect.value;
      renderMarketplaceListings();
    });
  }
}

function getVisibleListings() {
  return MOCK_LISTINGS.filter(listing => {
    const products = getListingProducts(listing);
    const matchesType = currentListingType === 'all' || products.some(product => product.saleType === currentListingType);
    const matchesStatus = listing.status === currentListingStatus;
    return matchesType && matchesStatus;
  });
}

function getStatusLabel(status) {
  return status === 'ended' ? 'Avsluttet' : 'Aktiv';
}

function getListingById(listingId) {
  return MOCK_LISTINGS.find(listing => listing.id === listingId);
}

function getListingProducts(listing) {
  return Array.isArray(listing.cards) ? listing.cards : [];
}

function getCarouselIndex(listing) {
  const cardCount = getListingProducts(listing).length || 1;
  return (carouselIndexes[listing.id] || 0) % cardCount;
}

function getCardImage(card) {
  return card.image || IMAGE_PLACEHOLDER;
}

function getSaleTypesSummary(listing) {
  const types = [...new Set(getListingProducts(listing).map(product => product.saleType).filter(Boolean))];
  return types.join(' / ');
}

function extractNumericPrice(priceLabel) {
  const match = String(priceLabel || '').replace(/\s/g, '').match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

function getFromPriceLabel(listing) {
  const prices = getListingProducts(listing)
    .map(product => extractNumericPrice(product.priceLabel))
    .filter(price => Number.isFinite(price));

  if (!prices.length) return '';
  return 'Fra ' + Math.min(...prices).toLocaleString('no-NO') + ' kr';
}

function getProductActionLabel(product) {
  if (product.saleType === 'Fastprisannonse') return 'Kjøp';
  if (product.saleType === 'Claim-salg') return 'Claim';
  return 'Legg inn bud';
}

function renderCarousel(listing) {
  const products = getListingProducts(listing);
  const activeIndex = getCarouselIndex(listing);
  const activeCard = products[activeIndex] || {};
  const dots = products.map((card, index) => {
    const activeClass = index === activeIndex ? ' active' : '';
    return '<button class="carousel-dot' + activeClass + '" type="button" data-listing-id="' + escapeHtml(listing.id) + '" data-carousel-index="' + index + '" aria-label="Vis ' + escapeHtml(card.name) + '"></button>';
  }).join('');
  const controls = products.length > 1
    ? '<button class="carousel-nav carousel-prev" type="button" data-listing-id="' + escapeHtml(listing.id) + '" data-direction="-1" aria-label="Forrige kort">‹</button>' +
      '<button class="carousel-nav carousel-next" type="button" data-listing-id="' + escapeHtml(listing.id) + '" data-direction="1" aria-label="Neste kort">›</button>' +
      '<div class="carousel-dots">' + dots + '</div>'
    : '';

  return (
    '<div class="listing-carousel">' +
      '<img src="' + escapeHtml(getCardImage(activeCard)) + '" onerror="this.onerror=null;this.src=\'' + IMAGE_PLACEHOLDER + '\'" alt="' + escapeHtml(activeCard.name || 'Kortbilde') + '" loading="lazy" />' +
      controls +
    '</div>'
  );
}

function renderMarketplaceListings() {
  const grid = document.getElementById('marketplace-listings');
  if (!grid) return;

  const listings = getVisibleListings();
  grid.innerHTML = '';

  if (listings.length === 0) {
    grid.innerHTML =
      '<div class="empty-state">' +
      '<p class="empty-state-title">Ingen oppføringer funnet</p>' +
      '<p class="empty-state-desc">Prøv et annet filter.</p>' +
      '</div>';
    return;
  }

  listings.forEach(listing => {
    const products = getListingProducts(listing);
    const productCountLabel = products.length === 1 ? '1 produkt' : products.length + ' produkter';
    const typesSummary = getSaleTypesSummary(listing);
    const fromPrice = getFromPriceLabel(listing);
    const article = document.createElement('article');
    article.className = 'listing-card';
    article.innerHTML =
      renderCarousel(listing) +
      '<div class="listing-card-header">' +
      '<span class="listing-type">' + escapeHtml(productCountLabel) + '</span>' +
      '<span class="listing-status listing-status-' + escapeHtml(listing.status) + '">' + escapeHtml(getStatusLabel(listing.status)) + '</span>' +
      '</div>' +
      '<p class="listing-seller">' + escapeHtml(listing.sellerName) + '</p>' +
      '<h3 class="listing-title">' + escapeHtml(listing.title) + '</h3>' +
      '<p class="listing-meta-line">' + escapeHtml(typesSummary) + '</p>' +
      (fromPrice ? '<p class="listing-price">' + escapeHtml(fromPrice) + '</p>' : '') +
      '<button class="btn btn-secondary listing-action" type="button" data-listing-id="' + escapeHtml(listing.id) + '">Se oppføring</button>';
    grid.appendChild(article);
  });

  bindMarketplaceActions();
}

function bindMarketplaceActions() {
  document.querySelectorAll('.listing-action').forEach(button => {
    button.addEventListener('click', () => {
      window.location.href = 'listing.html?id=' + encodeURIComponent(button.dataset.listingId);
    });
  });

  document.querySelectorAll('.carousel-nav').forEach(button => {
    button.addEventListener('click', () => {
      const listing = getListingById(button.dataset.listingId);
      if (!listing) return;
      const products = getListingProducts(listing);
      const direction = Number(button.dataset.direction) || 1;
      const nextIndex = getCarouselIndex(listing) + direction + products.length;
      carouselIndexes[listing.id] = nextIndex % products.length;
      renderMarketplaceListings();
    });
  });

  document.querySelectorAll('.carousel-dot').forEach(button => {
    button.addEventListener('click', () => {
      carouselIndexes[button.dataset.listingId] = Number(button.dataset.carouselIndex) || 0;
      renderMarketplaceListings();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMarketplaceFilters();
  renderMarketplaceListings();
});
