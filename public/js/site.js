/* site.js: renderiza categorias e checkout usando public/data/vehicles.json */

function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function loadVehicles() {
  const res = await fetch('/data/vehicles.json');
  return await res.json();
}

function formatPrice(v) {
  return v.toFixed(2).replace('.', ',');
}

async function renderCategoryPage(category) {
  const root = document.getElementById('category-root');
  if (!root) return;
  root.innerHTML = '<div class="text-center py-4">Carregando...</div>';
  const data = await loadVehicles();
  const veiculos = data[category] || [];
  if (veiculos.length === 0) {
    root.innerHTML = `<div class="alert alert-warning">Nenhum veículo encontrado para a categoria ${category}.</div>`;
    return;
  }

  const row = document.createElement('div');
  row.className = 'row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4';

  veiculos.forEach(v => {
    const col = document.createElement('div');
    col.className = 'col';

    const card = document.createElement('div');
    card.className = 'card h-100 shadow-sm';

    const img = document.createElement('img');
    img.className = 'veiculo-img card-img-top';
    img.src = '/static/img/' + v.foto;
    img.alt = v.nome;

    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column';

    const title = document.createElement('h5');
    title.className = 'card-title mb-2';
    title.innerText = v.nome;

    const priceWrap = document.createElement('p');
    priceWrap.className = 'mb-2';
    priceWrap.innerHTML = `<small class="text-muted">Valor diário por apenas:</small><div class="fs-5 text-success">R$ ${formatPrice(v.valor)}</div>`;

    body.appendChild(title);
    body.appendChild(priceWrap);

    if (v.opcionais && v.opcionais.length > 0) {
      const ops = document.createElement('div');
      ops.className = 'mb-3';
      ops.innerHTML = '<small class="text-muted">Opcionais inclusos:</small>';
      const ul = document.createElement('ul');
      ul.className = 'small mb-0';
      v.opcionais.forEach(o => { const li = document.createElement('li'); li.innerText = o; ul.appendChild(li); });
      ops.appendChild(ul);
      body.appendChild(ops);
    }

    // contêiner para recomendação inline
    const reco = document.createElement('div');
    reco.className = 'mt-2 ai-vehicle-reco';
    reco.dataset.vehicleId = v.id;

    body.appendChild(reco);

    const footer = document.createElement('div');
    footer.className = 'mt-auto';
    footer.innerHTML = `<a href="/checkout.html?vehicle_id=${v.id}" class="btn btn-success w-100">Alugar</a>`;

    body.appendChild(footer);

    card.appendChild(img);
    card.appendChild(body);
    col.appendChild(card);
    row.appendChild(col);
  });

  root.innerHTML = '';
  root.appendChild(row);

  // chamar recomendador AI
  if (window.AIRecommender) {
    window.AIRecommender.showCategoryRecommendation(category);
    window.AIRecommender.initInlineVehicleRecommendations();
  }
}

async function renderCheckoutPage(vehicleId) {
  const container = document.getElementById('checkout-root');
  if (!container) return;
  container.innerHTML = '<div class="text-center py-4">Carregando...</div>';
  const data = await loadVehicles();
  let found = null;
  for (const cat of Object.values(data)) {
    const f = cat.find(v => v.id === Number(vehicleId));
    if (f) { found = f; break; }
  }
  if (!found) {
    container.innerHTML = '<div class="alert alert-danger">Veículo não encontrado.</div>';
    return;
  }

  const card = document.createElement('div');
  card.className = 'card h-100 shadow-sm';
  card.innerHTML = `
    <img src="/static/img/${found.foto}" alt="Foto do ${found.nome}" class="checkout-img card-img-top">
    <div class="card-body d-flex flex-column">
      <h5 class="card-title mb-2">${found.nome}</h5>
      <p class="mb-2"><small class="text-muted">Valor diário por apenas:</small>
        <div class="fs-5 text-success">R$ ${formatPrice(found.valor)}</div>
      </p>
      ${found.opcionais && found.opcionais.length > 0 ? '<div class="mb-3"><small class="text-muted">Opcionais inclusos:</small><ul class="small mb-0">' + found.opcionais.map(o => `<li>${o}</li>`).join('') + '</ul></div>' : '<p class="text-muted mb-3">Nenhum opcional adicional selecionado.</p>'}
      <p class="text-muted mb-3">Veículo em bom estado, higienizado e pronto para uso. Motor econômico e conforto para viagens curtas e médias.</p>
      <div class="mt-auto">
        <button type="button" class="btn btn-success w-100" data-bs-toggle="modal" data-bs-target="#sucessoModal">Confirmar Aluguel</button>
      </div>
    </div>
  `;

  container.innerHTML = '';
  container.appendChild(card);

  // espaço para recomendação do AI
  const msgLocal = document.getElementById('mensagemLocal');
  if (msgLocal) msgLocal.innerHTML = '';

  if (window.AIRecommender) {
    window.AIRecommender.showCheckoutRecommendation(found.id);
  }
}

// inicializadores convenientes
window.Site = {
  renderCategoryPage,
  renderCheckoutPage,
  getParam
};
