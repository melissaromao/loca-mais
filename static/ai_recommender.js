async function fetchRecommendation(payload) {
  try {
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    return { error: 'Network error' };
  }
}

// Usado em categoria.html: solicita recomendação para a categoria e mostra banner
async function showCategoryRecommendation(category) {
  const container = document.getElementById('ai-category-recommendation');
  if (!container) return;
  container.innerHTML = `<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div>`;

  const data = await fetchRecommendation({ category });
  if (data && data.type === 'vehicle') {
    container.innerHTML = `
      <div class="alert alert-info d-flex justify-content-between align-items-center" role="alert">
        <div>
          <strong class="me-2">Sugestão AI:</strong> ${data.message}
        </div>
        <div>
          <a href="/checkout/${data.vehicle_id}" class="btn btn-sm btn-primary">Ir para checkout</a>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `<div class="alert alert-secondary">Nenhuma sugestão disponível.</div>`;
  }
}

// Usado em checkout.html: solicita recomendação de extra para o veículo e mostra card
async function showCheckoutRecommendation(vehicleId) {
  const container = document.getElementById('mensagemLocal');
  if (!container) return;
  container.innerHTML = '';

  const data = await fetchRecommendation({ vehicle_id: vehicleId });
  if (data && data.type === 'extra') {
    const extra = data.extra;
    container.innerHTML = `
      <div class="card mt-3 shadow-sm">
        <div class="card-body">
          <h6 class="card-title">Recomendação</h6>
          <p class="card-text mb-1"><strong>${extra.name}</strong> — ${extra.description}</p>
          <p class="text-success mb-2">R$ ${extra.price_per_day.toFixed(2)} / dia</p>
          <div class="d-flex gap-2">
            <button id="addExtraBtn" class="btn btn-outline-primary btn-sm">Adicionar extra</button>
            <button id="ignoreExtraBtn" class="btn btn-outline-secondary btn-sm">Ignorar</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('addExtraBtn').addEventListener('click', () => {
      // comportamento simples: mostra modal de confirmação pequena
      const btn = document.getElementById('addExtraBtn');
      btn.disabled = true;
      btn.innerText = 'Adicionado';
      const info = document.createElement('div');
      info.className = 'mt-2 text-success';
      info.innerText = 'Extra adicionado ao seu pedido.';
      container.querySelector('.card-body').appendChild(info);
    });

    document.getElementById('ignoreExtraBtn').addEventListener('click', () => {
      container.innerHTML = '<div class="alert alert-secondary">Você optou por não adicionar o extra.</div>';
    });
  }
}

// auto-init helpers — invocados diretamente nos templates
window.AIRecommender = {
  showCategoryRecommendation,
  showCheckoutRecommendation
};

// Renderiza recomendação dentro do card do veículo (usado em categoria.html)
async function showInlineVehicleRecommendation(elOrId) {
  let el = null;
  if (typeof elOrId === 'string' || typeof elOrId === 'number') {
    el = document.getElementById(String(elOrId));
  } else {
    el = elOrId;
  }
  if (!el) return;

  const vid = el.dataset && el.dataset.vehicleId ? parseInt(el.dataset.vehicleId) : null;
  if (!vid) return;

  el.innerHTML = `<div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">...</span></div>`;
  const data = await fetchRecommendation({ vehicle_id: vid });
  if (data && data.type === 'extra') {
    const extra = data.extra;
    el.innerHTML = `
      <div class="alert alert-warning p-2 mb-0 small d-flex justify-content-between align-items-center">
        <div>
          <strong>${extra.name}</strong>
          <div class="text-muted small">${extra.description}</div>
        </div>
        <div class="text-end">
          <div class="text-success small">R$ ${extra.price_per_day.toFixed(2)}/dia</div>
          <button class="btn btn-sm btn-outline-primary mt-1" data-action="add-extra">Adicionar</button>
        </div>
      </div>
    `;

    const addBtn = el.querySelector('[data-action="add-extra"]');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        addBtn.disabled = true;
        addBtn.innerText = 'Adicionado';
        const info = document.createElement('div');
        info.className = 'mt-1 text-success small';
        info.innerText = 'Extra adicionado ao seu pedido.';
        el.querySelector('.alert').appendChild(info);
      });
    }
  } else {
    el.innerHTML = '';
  }
}

// adicionar ao objeto público
window.AIRecommender.showInlineVehicleRecommendation = showInlineVehicleRecommendation;

// helper para inicializar todos os contêineres com a classe `ai-vehicle-reco`
function initInlineVehicleRecommendations() {
  const nodes = document.querySelectorAll('.ai-vehicle-reco');
  nodes.forEach(n => {
    try { showInlineVehicleRecommendation(n); } catch (e) { /* ignore */ }
  });
}

window.AIRecommender.initInlineVehicleRecommendations = initInlineVehicleRecommendations;
