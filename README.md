# 🎯 Akinator Geométrico - Sistema Especialista

Seja bem-vindo ao **Akinator Geométrico**, um Sistema Especialista (SE) desenvolvido para o domínio da **Geometria Euclidiana**. O software simula o processo de tomada de decisão de um perito humano por meio de questionamentos binários sucessivos, sendo capaz de classificar formas bidimensionais (planas) e tridimensionais (sólidos) através de uma base de conhecimento dinâmica.

---

## 🚀 Funcionalidades Clave

* **Motor de Advinhação Inteligente:** O sistema faz perguntas estratégicas para adivinhar a forma geométrica que você pensou.
* **Mecanismo de Aprendizado Ativo:** Caso você pense em uma forma que ainda não está cadastrada, você pode atuar como o "especialista", ensinando o nome e as características morfológicas da nova forma para o sistema.
* **Explicação do Raciocínio:** Ao acertar o palpite, o sistema exibe detalhadamente a árvore de decisões e as regras lógicas que utilizou para chegar àquela conclusão.
* **Painel Administrativo Completo:** Interface exclusiva para visualizar a base de dados atual, cadastrar manualmente novas regras/formas (2D e 3D) ou gerenciar/excluir o conhecimento existente.

---

## 🧠 Arquitetura Técnica & Inteligência Artificial

O projeto foi inteiramente construído em **JavaScript (ECMAScript 6)** puro, sem dependências externas, adotando conceitos clássicos de IA:

1. **Modelagem de Conhecimento (Regras de Produção):** A base é estruturada em objetos lógicos que validam propriedades como:
   * *Predicados de Dimensionalidade:* Segmentação inicial entre geometria plana (2D) e espacial (3D).
   * *Propriedades Morfológicas:* Presença de arestas retas, superfícies curvas ou faces planas.
   * *Análise Quantitativa e Simetria:* Cardinalidade de lados ($n$-lados) e igualdade entre faces/arestas.
2. **Motor de Inferência por Encadeamento para Frente (*Forward Chaining*):** O sistema utiliza os fatos fornecidos pelo usuário para acionar as regras de produção e deduzir novos fatos até alcançar o objetivo (a classificação final).
3. **Algoritmo de Seleção por Entropia (Otimização):** Para evitar perguntas redundantes e diminuir o tempo de resposta, o motor analisa os candidatos restantes na base e prioriza a pergunta com maior capacidade de poda do espaço de busca (busca binária conceitual).
4. **Tratamento de Conflitos:** Implementação de prioridade de validação quantitativa para diferenciar formas com atributos qualitativos idênticos (ex: diferenciar um *Quadrado* de um *Octógono Regular* exige a contagem exata de lados antes do diagnóstico).

---

## 💻 Interface do Usuário (UX)

O sistema conta com um visual moderno, clean e centralizado via CSS, dividido em três telas principais acessíveis pelo Menu:
* **Começar Jogo:** Inicia o fluxo dinâmico de perguntas ("Sim" ou "Não") até o palpite final.
* **Ver Base de Dados:** Exibe todos os polígonos e sólidos geométricos atualmente conhecidos pelo motor.
* **Painel Admin:** Permite a inserção guiada de novas formas preenchendo campos de tipagem estrita (evitando erros de execução no motor).

---

## 🛠️ Como Executar o Projeto

Como o sistema foi desenvolvido utilizando tecnologias web nativas, você não precisa instalar nenhuma dependência ou compilador. 

1. Faça o clone deste repositório:
   ```bash
   git clone [https://github.com/SEU-USUARIO/akinator-geometrico.git](https://github.com/SEU-USUARIO/akinator-geometrico.git)
