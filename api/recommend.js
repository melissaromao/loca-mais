// Função serverless para Vercel replicando /api/recommend do app Flask
const veiculos = {
  compactos: [
    { id: 1, nome: 'Fiat Mobi', opcionais: ['Ar condicionado', 'Vidros elétricos'], valor: 80.0, foto: 'mobi.jpg' },
    { id: 2, nome: 'Renault Kwid', opcionais: ['Ar condicionado'], valor: 75.0, foto: 'kwid.jpg' }
  ],
  suvs: [
    { id: 3, nome: 'Jeep Renegade', opcionais: ['Ar condicionado', 'Multimídia', 'Direção elétrica'], valor: 150.0, foto: 'renegade.jpg' },
    { id: 4, nome: 'Nissan Kicks', opcionais: ['Ar condicionado', 'Direção elétrica'], valor: 140.0, foto: 'kicks.jpg' }
  ],
  esportivos: [
    { id: 5, nome: 'Ford Mustang', opcionais: ['Motor V8', 'Câmbio automático', 'Bancos de couro'], valor: 350.0, foto: 'mustang.jpg' }
  ]
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const data = req.body || {};

  if (data.category) {
    const cat = data.category;
    if (!veiculos[cat] || veiculos[cat].length === 0) {
      res.status(400).json({ error: 'Categoria inválida ou sem veículos' });
      return;
    }
    const recomendado = veiculos[cat].reduce((a, b) => (a.valor < b.valor ? a : b));
    res.json({
      type: 'vehicle',
      vehicle_id: recomendado.id,
      vehicle_name: recomendado.nome,
      message: `Recomendamos ${recomendado.nome} nesta categoria.`
    });
    return;
  }

  if (data.vehicle_id) {
    const vid = Number(data.vehicle_id);
    let encontrado = null;
    let categoria = null;
    for (const [catName, lista] of Object.entries(veiculos)) {
      const v = lista.find((x) => x.id === vid);
      if (v) {
        encontrado = v;
        categoria = catName;
        break;
      }
    }
    if (!encontrado) {
      res.status(404).json({ error: 'Veículo não encontrado' });
      return;
    }

    let extra;
    if (categoria === 'esportivos') {
      extra = { name: 'Seguro Premium (cobertura total)', description: 'Proteção extra indicada para veículos de alta potência.', price_per_day: 80.0 };
    } else if (categoria === 'suvs') {
      extra = { name: 'GPS + Assento infantil', description: 'Roteamento e conforto para famílias.', price_per_day: 25.0 };
    } else {
      extra = { name: 'Assento infantil', description: 'Recomendado para segurança de crianças.', price_per_day: 15.0 };
    }

    res.json({ type: 'extra', vehicle_id: vid, extra, message: `Recomendação automática para ${encontrado.nome}: ${extra.name}` });
    return;
  }

  res.status(400).json({ error: 'Parâmetros inválidos' });
};
