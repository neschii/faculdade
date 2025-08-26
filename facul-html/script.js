document.addEventListener('DOMContentLoaded', () => {
    const formProduto = document.getElementById('form-produto');
    const listaProdutosDiv = document.getElementById('lista-produtos');
    let produtos = JSON.parse(localStorage.getItem('produtosMercadoLivreOriginal')) || [];
    let produtoEditandoId = null;

    function renderizarProdutos() {
        listaProdutosDiv.innerHTML = '';

        if (produtos.length === 0) {
            listaProdutosDiv.innerHTML = '<p>Nenhum produto cadastrado ainda.</p>';
            return;
        }

        produtos.forEach(produto => {
            const card = document.createElement('div');
            card.classList.add('produto-card');

            const imagem = produto.fotoUrl
                ? `<img src="${produto.fotoUrl}" alt="Foto do Produto">`
                : `<div class="no-image">Sem Imagem</div>`;

            const preco = `R$ ${produto.preco.toFixed(2).replace('.', ',')}`;

            card.innerHTML = `
                ${imagem}
                <h3>${produto.nome}</h3>
                <p><strong>Descrição:</strong> ${produto.descricao}</p>
                <p><strong>Preço:</strong> ${preco}</p>
                <p><strong>Prazo de Entrega:</strong> ${produto.prazoEntrega} dias</p>
                <p>
                    <input type="checkbox" data-id="${produto.id}" class="disponivel" ${produto.disponivel ? 'checked' : ''}>
                    Disponível
                </p>
                <button data-id="${produto.id}" class="editar">Editar</button>
                <button data-id="${produto.id}" class="btn-excluir excluir">Excluir</button>
            `;
            listaProdutosDiv.appendChild(card);
        });

        document.querySelectorAll('.editar').forEach(btn => {
            btn.onclick = () => editarProduto(Number(btn.dataset.id));
        });

        document.querySelectorAll('.excluir').forEach(btn => {
            btn.onclick = () => excluirProduto(Number(btn.dataset.id));
        });

        document.querySelectorAll('.disponivel').forEach(chk => {
            chk.onchange = () => toggleDisponivel(Number(chk.dataset.id), chk.checked);
        });
    }

    formProduto.onsubmit = (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const descricao = document.getElementById('descricao').value;
        const preco = parseFloat(document.getElementById('preco').value);
        const entrega = document.querySelector('input[name="entrega"]:checked');
        const foto = document.getElementById('fotoProduto').files[0];

        if (!nome || !descricao || isNaN(preco) || !entrega) return;

        const salvar = (fotoUrl) => {
            if (produtoEditandoId !== null) {
                const index = produtos.findIndex(p => p.id === produtoEditandoId);
                produtos[index] = {
                    ...produtos[index],
                    nome,
                    descricao,
                    preco,
                    prazoEntrega: entrega.value,
                    fotoUrl: fotoUrl || produtos[index].fotoUrl
                };
            } else {
                produtos.push({
                    id: Date.now(),
                    nome,
                    descricao,
                    preco,
                    prazoEntrega: entrega.value,
                    fotoUrl,
                    disponivel: true
                });
            }

            localStorage.setItem('produtosMercadoLivreOriginal', JSON.stringify(produtos));
            produtoEditandoId = null;
            formProduto.reset();
            renderizarProdutos();
        };

        if (foto) {
            const reader = new FileReader();
            reader.onload = e => salvar(e.target.result);
            reader.readAsDataURL(foto);
        } else {
            salvar('');
        }
    };

    function editarProduto(id) {
        const p = produtos.find(p => p.id === id);
        if (!p) return;
        document.getElementById('nome').value = p.nome;
        document.getElementById('descricao').value = p.descricao;
        document.getElementById('preco').value = p.preco;
        const entrega = document.querySelector(`input[name="entrega"][value="${p.prazoEntrega}"]`);
        if (entrega) entrega.checked = true;
        produtoEditandoId = id;
    }

    function excluirProduto(id) {
        produtos = produtos.filter(p => p.id !== id);
        localStorage.setItem('produtosMercadoLivreOriginal', JSON.stringify(produtos));
        renderizarProdutos();
    }

    function toggleDisponivel(id, status) {
        const p = produtos.find(p => p.id === id);
        if (p) {
            p.disponivel = status;
            localStorage.setItem('produtosMercadoLivreOriginal', JSON.stringify(produtos));
        }
    }

    renderizarProdutos();
});
