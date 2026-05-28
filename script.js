// ==========================
// BASE DE DADOS E PERGUNTAS
// ==========================
let respostas = {};
let formas = [];
let candidatos = [];
let historico = [];

const perguntasBase = [
    { chave: "is3D", texto: "A forma é 3D (sólida)?" },
    { chave: "temLados", texto: "Possui lados retos?", cond: r => r.is3D === false },
    { chave: "curvo", texto: "Possui curvas?", cond: r => r.is3D === false },
    { chave: "temFacesPlanas", texto: "Possui faces planas?", cond: r => r.is3D === true },
    { chave: "temArestas", texto: "Possui arestas?", cond: r => r.is3D === true },
    { chave: "tipoBase", texto: "Tem uma base circular?", cond: r => r.is3D === true },
    { chave: "temVerticeTopo", texto: "Possui uma ponta no topo (vértice)?", cond: r => r.is3D === true },
    { chave: "facesIguais", texto: "Todos os lados ou faces são iguais?", cond: r => r.is3D === true || r.temLados === true }
];

function carregarFormas() {
    const data = localStorage.getItem("formas");
    if (data) {
        formas = JSON.parse(data);
    } else {
        formas = [
            { nome: "Círculo ", is3D: false, temLados: false, curvo: true, facesIguais: true },
            { nome: "Quadrado ", is3D: false, temLados: true, curvo: false, lados: 4, lados4: true, facesIguais: true },
            { nome: "Triângulo ", is3D: false, temLados: true, curvo: false, lados: 3, lados3: true, facesIguais: true },
            { nome: "Cubo ", is3D: true, temFacesPlanas: true, temArestas: true, facesIguais: true }
        ];
        localStorage.setItem("formas", JSON.stringify(formas));
    }
    candidatos = [...formas];
}

// ==========================
// MOTOR DE INFERÊNCIA (CORRIGIDO)
// ==========================
function melhorPergunta() {
    let melhor = null;
    let melhorScore = -1;
    let perguntasDaVez = [...perguntasBase];
    
    // 1. Gera perguntas dinâmicas para cada número de lados na base
    candidatos.forEach(f => {
        if (f.lados) {
            const chaveLado = "lados" + f.lados;
            if (!perguntasDaVez.find(p => p.chave === chaveLado)) {
                perguntasDaVez.push({
                    chave: chaveLado,
                    texto: `Tem exatamente ${f.lados} lados?`,
                    cond: r => r.is3D === false && r.temLados === true
                });
            }
        }
    });

    // 2. TRAVA DE SEGURANÇA: Se houver formas com números de LADOS diferentes no páreo,
    // obriga a IA a perguntar os números de lados até sobrar apenas uma quantidade.
    const qtdLadosDiferentes = [...new Set(candidatos.filter(c => c.lados).map(c => c.lados))];
    
    if (qtdLadosDiferentes.length > 1) {
        // Busca a primeira pergunta de "ladosX" que ainda não foi respondida
        melhor = perguntasDaVez.find(p => 
            p.chave.startsWith("lados") && 
            p.chave !== "temLados" && 
            respostas[p.chave] === undefined
        );
        if (melhor) return melhor; // Força a pergunta de lados antes de qualquer palpite
    }

    // 3. Lógica de Entropia (Se não houver conflito de lados ou se já perguntou todos)
    perguntasDaVez.forEach(p => {
        if (respostas[p.chave] !== undefined) return;
        if (p.cond && !p.cond(respostas)) return;

        let sim = 0, nao = 0;
        candidatos.forEach(f => {
            if (f[p.chave] === true) sim++;
            else nao++;
        });

        const score = Math.min(sim, nao);
        if (score > melhorScore) {
            melhorScore = score;
            melhor = p;
        }
    });
    return melhor;
}

function responder(chave, valor) {
    respostas[chave] = valor;
    let textoFato = "";
    if (chave.startsWith("lados") && chave !== "temLados") {
        textoFato = `Tem exatamente ${chave.replace("lados","")} lados?`;
    } else {
        const p = perguntasBase.find(x => x.chave === chave);
        textoFato = p ? p.texto : chave;
    }
    historico.push({ texto: textoFato, resposta: valor });
    
    candidatos = candidatos.filter(f => {
        const valorForma = f[chave] !== undefined ? f[chave] : false;
        return valorForma === valor;
    });
    telaPergunta();
}

// ==========================
// TELAS DO SISTEMA
// ==========================
function render(html) { document.getElementById("app").innerHTML = html; }

function telaInicial() {
    respostas = {}; historico = []; candidatos = [...formas];
    render(`
        <div class="avatar"></div>
        <h1>Akinator Geométrico</h1>
        <button class="primary" onclick="telaPergunta()">Começar Jogo</button>
        <button class="secondary" onclick="telaVerFormas()">Ver Base de Dados</button>
        <button class="secondary" onclick="telaAdmin()">Painel Admin</button>
    `);
}

function telaPergunta() {
    // Se sobrar mais de uma forma e elas tiverem números de lados diferentes, 
    // a função melhorPergunta() acima vai forçar a pergunta de lados.
    if (candidatos.length <= 1) return telaPensando();
    const p = melhorPergunta();
    if (!p) return telaPensando();
    
    render(`
        <div class="avatar"></div>
        <h2>${p.texto}</h2>
        <button class="yes" onclick="responder('${p.chave}', true)">Sim</button>
        <button class="no" onclick="responder('${p.chave}', false)">Não</button>
    `);
}

function telaPensando() {
    render(`<div class="avatar"></div><h1>Analisando...</h1>`);
    setTimeout(telaResultado, 1200);
}

function telaResultado() {
    const r = candidatos[0];
    if (r) {
        render(`
            <div class="avatar"></div>
            <p>Eu acho que é um(a):</p>
            <h1>${r.nome}</h1>
            <button class="yes" onclick="acertou()">Correto!</button>
            <button class="no" onclick="errou()">Errado, vou ensinar</button>
        `);
    } else {
        render(`<div class="avatar">❌</div><h1>Não conheço!</h1><button class="primary" onclick="errou()">Ensinar nova forma</button>`);
    }
}

function acertou() {
    render(`<div class="avatar"></div><h1>Fácil demais!</h1><button class="primary" onclick="telaExplicacao()">Ver Raciocínio</button>`);
}

function errou() {
    render(`
        <div class="avatar"></div>
        <h1>Me ensine!</h1>
        <p>Qual era a forma?</p>
        <input id="nomeAprendido" placeholder="Ex: Losango">
        <button class="yes" onclick="salvarAprendizado()">Salvar Conhecimento</button>
        <button class="secondary" onclick="telaInicial()">Cancelar</button>
    `);
}

function salvarAprendizado() {
    const nome = document.getElementById("nomeAprendido").value;
    if(!nome) return;
    formas.push({ nome, ...respostas });
    localStorage.setItem("formas", JSON.stringify(formas));
    alert("Aprendi algo novo!");
    telaInicial();
}

function telaExplicacao() {
    const lista = historico.map(h => `<p>${h.resposta ? '✅' : '❌'} ${h.texto}</p>`).join("");
    render(`<h1>Explicação:</h1><div class="lista-detalhes">${lista}</div><button class="primary" onclick="telaInicial()">Reiniciar</button>`);
}

// ==========================
// MODO ADMIN COMPLETO
// ==========================
function telaAdmin() {
    render(`
        <div class="avatar">⚙️</div>
        <h1>Admin</h1>
        <button class="primary" onclick="telaAdicionarForma(null)">➕ Adicionar Forma</button>
        <button class="primary" onclick="telaGerenciarExclusao()">🗑️ Gerenciar / Excluir</button>
        <button class="secondary" onclick="telaInicial()">Voltar</button>
    `);
}

function telaAdicionarForma(tipoSelecionado = null) {
    if (tipoSelecionado === null) {
      render(`
        <div class="avatar"></div>
        <h1>Nova Regra</h1>
        <p>A forma que deseja cadastrar é plana ou sólida?</p>
        <div class="button-group-vertical">
          <button class="primary" onclick="telaAdicionarForma('2D')">2D (Plana / Polígono)</button>
          <button class="primary" onclick="telaAdicionarForma('3D')">3D (Sólido Geométrico)</button>
        </div>
        <button class="secondary" style="margin-top:20px;" onclick="telaAdmin()">Voltar ao Menu</button>
      `);
      return;
    }
  
    const campos3D = ["temFacesPlanas", "temArestas", "tipoBase", "temVerticeTopo", "facesIguais"];
    const campos2D = ["curvo", "facesIguais"]; 
    const camposParaExibir = tipoSelecionado === '3D' ? campos3D : campos2D;
  
    const camposHTML = camposParaExibir.map(chave => `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; background:#f8f9fa; padding:10px; border-radius:10px; border: 1px solid #e9ecef;">
        <label style="font-size:13px; font-weight:600; color:#444;">${traduzirChave(chave)}?</label>
        <select id="admin-${chave}" style="padding:5px; border-radius:5px; border:1px solid #ccc;">
          <option value="true">Sim</option>
          <option value="false" selected>Não</option>
        </select>
      </div>
    `).join("");
  
    render(`
      <div class="avatar">${tipoSelecionado === '3D' ? '🧊' : '📐'}</div>
      <h1>Cadastro ${tipoSelecionado}</h1>
      <div style="text-align:left; max-height:400px; overflow-y:auto; padding-right:10px; margin-bottom:20px;">
        <label style="font-size:12px; font-weight:bold; color:#666;">NOME DA FORMA:</label>
        <input id="nomeNovo" placeholder="Ex: Hexágono" style="width:100%; padding:12px; margin-top:5px; margin-bottom:15px; border:2px solid #6a11cb; border-radius:10px; font-size:16px;">
        
        <input type="hidden" id="admin-is3D" value="${tipoSelecionado === '3D'}">
        ${tipoSelecionado === '2D' ? `
          <div style="margin-bottom:15px; background:#e3f2fd; padding:15px; border-radius:12px; border:2px dashed #2575fc;">
            <label style="font-size:14px; font-weight:bold; color:#0d47a1;">Quantos lados possui?</label>
            <input type="number" id="admin-qtdLados" placeholder="0" style="width:70px; padding:8px; margin-left:10px; border-radius:8px; border:1px solid #2575fc; text-align:center;">
          </div>
        ` : ''}
        <p style="font-size:12px; font-weight:bold; color:#666; margin-bottom:10px;">OUTRAS CARACTERÍSTICAS:</p>
        ${camposHTML}
      </div>
      <button class="yes" style="width:100%; padding:15px;" onclick="salvarNovaForma('${tipoSelecionado}')">Salvar na Base de Conhecimento</button>
      <button class="secondary" style="width:100%; margin-top:10px;" onclick="telaAdicionarForma(null)">Voltar (Mudar tipo)</button>
    `);
}

function salvarNovaForma(tipo) {
    const nomeInput = document.getElementById("nomeNovo");
    if (!nomeInput || !nomeInput.value.trim()) return alert("Digite o nome da forma!");
    
    const nome = nomeInput.value.trim();
    const nova = { 
        nome: nome, 
        is3D: (tipo === '3D'),
        facesIguais: document.getElementById("admin-facesIguais") ? document.getElementById("admin-facesIguais").value === "true" : false
    };

    if (tipo === '2D') {
        const campoLados = document.getElementById("admin-qtdLados");
        const L = campoLados ? parseInt(campoLados.value) : 0;
        
        if (L > 0) {
            nova.temLados = true;
            nova["lados" + L] = true;
            nova.lados = L;
        } else {
            nova.temLados = false;
        }
        const campoCurvo = document.getElementById("admin-curvo");
        nova.curvo = campoCurvo ? campoCurvo.value === "true" : false;
    } 
    else {
        const campos3D = ["temFacesPlanas", "temArestas", "tipoBase", "temVerticeTopo"];
        campos3D.forEach(c => {
            const el = document.getElementById("admin-" + c);
            if (el) nova[c] = el.value === "true";
        });
    }

    formas.push(nova);
    localStorage.setItem("formas", JSON.stringify(formas));
    alert(`"${nome}" salvo com sucesso!`);
    telaAdmin();
}

function telaGerenciarExclusao() {
    const itens = formas.map((f, i) => {
        const criterios = Object.keys(f)
            .filter(k => f[k] === true && k !== "nome")
            .map(k => traduzirChave(k))
            .join(", ");

        return `
        <div style="display:flex; flex-direction:column; padding:10px; border-bottom:1px solid #eee; text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:bold;">${f.nome}</span>
                <button class="no" style="width:auto; padding:5px" onclick="confirmarExcluir(${i})">X</button>
            </div>
            <small style="color:#666;">${criterios}</small>
        </div>`;
    }).join("");
    render(`<h1>Gerenciar</h1><div class="lista-detalhes">${itens}</div><button class="secondary" onclick="telaAdmin()">Voltar</button>`);
}

function confirmarExcluir(i) {
    if (confirm("Excluir " + formas[i].nome + "?")) {
        formas.splice(i, 1);
        localStorage.setItem("formas", JSON.stringify(formas));
        telaGerenciarExclusao();
    }
}

function traduzirChave(c) {
    const m = { is3D: "3D", curvo: "Curva", facesIguais: "Lados/Faces Iguais", temFacesPlanas: "Faces Planas", temArestas: "Arestas", tipoBase: "Base Circular", temVerticeTopo: "Ponta", temLados: "Lados Retos" };
    if (c.startsWith("lados") && c !== "temLados") return c.replace("lados","") + " Lados";
    return m[c] || c;
}

function telaVerFormas() {
    const lista = formas.map(f => {
        const crit = Object.keys(f).filter(k => f[k] === true && k !== "nome").map(k => traduzirChave(k)).join(", ");
        return `<div class="secondary" style="font-size:12px; margin-bottom:5px; padding:10px; border:1px solid #ccc; border-radius:5px; text-align:left;">
            <strong>${f.nome}</strong><br><small>${crit}</small>
        </div>`;
    }).join("");
    render(`<h1>Base de Dados</h1><div class="lista-detalhes">${lista}</div><button class="primary" onclick="telaInicial()">Voltar</button>`);
}

carregarFormas();
telaInicial();