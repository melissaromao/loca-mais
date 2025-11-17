from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# Simulação de um banco de dados
# Adicione a chave 'foto' com o caminho da imagem de cada veículo
veiculos = {
    'compactos': [
        {'id': 1, 'nome': 'Fiat Mobi', 'opcionais': ['Ar condicionado', 'Vidros elétricos'], 'valor': 80.00, 'foto': 'mobi.jpg'},
        {'id': 2, 'nome': 'Renault Kwid', 'opcionais': ['Ar condicionado'], 'valor': 75.00, 'foto': 'kwid.jpg'},
    ],
    'suvs': [
        {'id': 3, 'nome': 'Jeep Renegade', 'opcionais': ['Ar condicionado', 'Multimídia', 'Direção elétrica'], 'valor': 150.00, 'foto': 'renegade.jpg'},
        {'id': 4, 'nome': 'Nissan Kicks', 'opcionais': ['Ar condicionado', 'Direção elétrica'], 'valor': 140.00, 'foto': 'kicks.jpg'},
    ],
    'esportivos': [
        {'id': 5, 'nome': 'Ford Mustang', 'opcionais': ['Motor V8', 'Câmbio automático', 'Bancos de couro'], 'valor': 350.00, 'foto': 'mustang.jpg'},
    ]
}

# (O resto do seu código Flask permanece o mesmo)
@app.route('/')
def index():
    # ...
    # Se você quiser fotos nas categorias, adicione-as aqui também.
    # Exemplo: categorias = {'compactos': {'foto': 'categoria_compactos.jpg'}, 'suvs': {'foto': 'categoria_suvs.jpg'}}
    # e depois ajuste o template index.html para usar isso.
    # Por enquanto, vamos manter a simplicidade e focar nas fotos dos veículos.
    categorias = veiculos.keys()
    return render_template('index.html', categorias=categorias)

@app.route('/categoria/<categoria_nome>')
def ver_categoria(categoria_nome):
    if categoria_nome in veiculos:
        lista_veiculos = veiculos[categoria_nome]
        return render_template('categoria.html', categoria=categoria_nome, veiculos=lista_veiculos)
    else:
        return "Categoria não encontrada", 404

@app.route('/checkout/<int:veiculo_id>')
def checkout(veiculo_id):
    veiculo_selecionado = None
    for categoria in veiculos.values():
        for veiculo in categoria:
            if veiculo['id'] == veiculo_id:
                veiculo_selecionado = veiculo
                break
        if veiculo_selecionado:
            break

    if veiculo_selecionado:
        return render_template('checkout.html', veiculo=veiculo_selecionado)
    else:
        return "Veículo não encontrado", 404


@app.route('/api/recommend', methods=['POST'])
def api_recommend():
    """Endpoint simples de recomendação baseado em regras.
    Recebe JSON com uma das formas:
      {"category": "suvs"}
      {"vehicle_id": 3}
    Retorna JSON com uma recomendação curta.
    """
    data = request.get_json() or {}

    # Se recebeu categoria: recomenda um veículo (ex.: o mais barato)
    if 'category' in data:
        cat = data.get('category')
        if cat in veiculos and len(veiculos[cat]) > 0:
            # recomendação simples: veículo mais barato
            recomendado = min(veiculos[cat], key=lambda v: v.get('valor', 0))
            return {
                'type': 'vehicle',
                'vehicle_id': recomendado['id'],
                'vehicle_name': recomendado['nome'],
                'message': f"Recomendamos {recomendado['nome']} nesta categoria."
            }
        else:
            return {'error': 'Categoria inválida ou sem veículos'}, 400

    # Se recebeu vehicle_id: recomenda um extra/opcional
    if 'vehicle_id' in data:
        vid = int(data.get('vehicle_id'))
        # encontrar veículo e categoria
        encontrado = None
        categoria = None
        for cat_name, lista in veiculos.items():
            for v in lista:
                if v['id'] == vid:
                    encontrado = v
                    categoria = cat_name
                    break
            if encontrado:
                break

        if not encontrado:
            return {'error': 'Veículo não encontrado'}, 404

        # regras simples por categoria
        if categoria == 'esportivos':
            extra = {
                'name': 'Seguro Premium (cobertura total)',
                'description': 'Proteção extra indicada para veículos de alta potência.',
                'price_per_day': 80.0
            }
        elif categoria == 'suvs':
            extra = {
                'name': 'GPS + Assento infantil',
                'description': 'Roteamento e conforto para famílias.',
                'price_per_day': 25.0
            }
        else:
            extra = {
                'name': 'Assento infantil',
                'description': 'Recomendado para segurança de crianças.',
                'price_per_day': 15.0
            }

        return {
            'type': 'extra',
            'vehicle_id': vid,
            'extra': extra,
            'message': f"Recomendação automática para {encontrado['nome']}: {extra['name']}"
        }

    return {'error': 'Parâmetros inválidos'}, 400

if __name__ == '__main__':
    app.run(debug=True)