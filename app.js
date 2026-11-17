/* Alinhavo — protótipo navegável (dados fictícios, salvos só no navegador de quem usa) */
(() => {
  "use strict";

  /* ================= Utilidades ================= */
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const brl = (n) => (n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const brlK = (n) => Math.abs(n) >= 1000 ? "R$ " + (n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " mil" : brl(n);
  const int = (n) => Math.round(n ?? 0).toLocaleString("pt-BR");
  const uid = () => Math.random().toString(36).slice(2, 9);
  const DAY = 86400000;
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const d = (offset) => new Date(today().getTime() + offset * DAY).toISOString().slice(0, 10);
  const parse = (iso) => { const [y, m, dd] = iso.split("-").map(Number); return new Date(y, m - 1, dd); };
  const daysFrom = (iso) => Math.round((parse(iso) - today()) / DAY);
  const dataBR = (iso) => parse(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
  const quando = (iso) => {
    const n = daysFrom(iso);
    if (n === 0) return "hoje";
    if (n === 1) return "amanhã";
    if (n === -1) return "ontem";
    return n > 0 ? `em ${n} dias` : `há ${-n} dias`;
  };

  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento: segue em memória */ } },
  };

  /* ================= Ícones ================= */
  const P = {
    inicio: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    producao: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/>',
    oficinas: '<path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/>',
    almox: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    custo: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 6h6M9 11h.01M12 11h.01M15 11h.01M9 15h.01M12 15h.01M15 15h.01M9 18h6"/>',
    vendas: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 9M22 21a7 7 0 0 0-4-6.3"/>',
    financeiro: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z"/><circle cx="16" cy="14.5" r="1.3"/>',
    colecoes: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    equipe: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17a4 4 0 0 1 8 0"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    swap: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
    truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  };
  const icon = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ""}</svg>`;
  const LOGO = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="15" fill="#fff"/><path d="M43 19 C 60 30, 22 36, 33 53" fill="none" stroke="#c8553d" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="4.5 4.5"/><line x1="16" y1="50" x2="46" y2="15" stroke="#2b3a67" stroke-width="4.2" stroke-linecap="round"/><ellipse cx="43.2" cy="18.3" rx="1.3" ry="3" transform="rotate(40 43.2 18.3)" fill="#fff"/></svg>`;
  const LOGO_DARK = LOGO.replace('fill="#fff"/>', 'fill="#2b3a67"/>').replace('stroke="#2b3a67"', 'stroke="#fff"').replace('fill="#fff"/></svg>', 'fill="#2b3a67"/></svg>');

  /* ================= Dados de exemplo ================= */
  const ETAPAS = ["Corte", "Costura (oficina)", "Beneficiamento", "Acabamento", "Pronto p/ venda"];

  function seed() {
    const oficinas = [
      { id: "of1", nome: "Oficina Dona Socorro", endereco: "R. Frei Cirilo, 210 — Messejana", contato: "(85) 9 8811-2040", costureiras: 6 },
      { id: "of2", nome: "Ateliê Mãos de Ouro", endereco: "Av. Godofredo Maciel, 1500 — Maraponga", contato: "(85) 9 9701-3321", costureiras: 4 },
      { id: "of3", nome: "Costura Irmãs Lima", endereco: "R. Pernambuco, 88 — Pici", contato: "(85) 9 8620-7712", costureiras: 3 },
    ];
    return {
      versao: 2,
      empresa: "Confecção Flor de Lis",
      ops: [
        { id: uid(), ref: "OP-1042", produto: "Blusa Básica Malha", qtd: 1200, etapa: 0, prazo: d(9) },
        { id: uid(), ref: "OP-1041", produto: "Vestido Midi Linho", qtd: 300, etapa: 1, prazo: d(5), oficina: "of1" },
        { id: uid(), ref: "OP-1039", produto: "Calça Wide Leg Sarja", qtd: 450, etapa: 1, prazo: d(2), oficina: "of2" },
        { id: uid(), ref: "OP-1038", produto: "Bermuda Jeans", qtd: 600, etapa: 2, prazo: d(4) },
        { id: uid(), ref: "OP-1036", produto: "Camisa Viscose Estampada", qtd: 250, etapa: 3, prazo: d(1) },
        { id: uid(), ref: "OP-1033", produto: "Blusa Básica Malha", qtd: 1500, etapa: 4, prazo: d(-2) },
      ],
      oficinas,
      remessas: [
        { id: uid(), oficina: "of1", op: "OP-1041", pecas: 300, valorPeca: 6.5, saida: d(-6), retorno: d(1), entregue: false, pago: false },
        { id: uid(), oficina: "of2", op: "OP-1039", pecas: 450, valorPeca: 5.0, saida: d(-8), retorno: d(-1), entregue: false, pago: false },
        { id: uid(), oficina: "of3", op: "OP-1036", pecas: 250, valorPeca: 4.2, saida: d(-15), retorno: d(-5), entregue: true, pago: false },
        { id: uid(), oficina: "of1", op: "OP-1033", pecas: 1500, valorPeca: 3.0, saida: d(-25), retorno: d(-12), entregue: true, pago: true },
      ],
      materiais: [
        { id: "m1", nome: "Malha PV preta", tipo: "Tecido", un: "kg", qtd: 38, minimo: 80, custo: 32, fornecedor: "Têxtil Nordeste", ultimaSaida: d(-1) },
        { id: "m2", nome: "Linho misto cru", tipo: "Tecido", un: "m", qtd: 410, minimo: 150, custo: 24.9, fornecedor: "Linhos SP", ultimaSaida: d(-6) },
        { id: "m3", nome: "Sarja bege", tipo: "Tecido", un: "m", qtd: 320, minimo: 120, custo: 18.5, fornecedor: "Têxtil Nordeste", ultimaSaida: d(-4) },
        { id: "m4", nome: "Viscose floral (coleção passada)", tipo: "Tecido", un: "m", qtd: 540, minimo: 0, custo: 16.8, fornecedor: "Estamparia Sol", ultimaSaida: d(-118) },
        { id: "m5", nome: "Botão madrepérola 12mm", tipo: "Aviamento", un: "un", qtd: 6200, minimo: 2000, custo: 0.18, fornecedor: "Aviamentos Ceará", ultimaSaida: d(-3) },
        { id: "m6", nome: "Zíper invisível 20cm", tipo: "Aviamento", un: "un", qtd: 140, minimo: 500, custo: 0.95, fornecedor: "Aviamentos Ceará", ultimaSaida: d(-2) },
        { id: "m7", nome: "Renda guipir off-white", tipo: "Aviamento", un: "m", qtd: 260, minimo: 0, custo: 7.4, fornecedor: "Rendas Aracati", ultimaSaida: d(-96) },
        { id: "m8", nome: "Tag + etiqueta de marca", tipo: "Embalagem", un: "un", qtd: 9000, minimo: 3000, custo: 0.3, fornecedor: "Gráfica Pontual", ultimaSaida: d(-1) },
      ],
      movimentos: [
        { id: uid(), data: d(-1), material: "m1", tipo: "saida", qtd: 54, resp: "Josué (corte)", op: "OP-1042" },
        { id: uid(), data: d(-2), material: "m6", tipo: "saida", qtd: 450, resp: "Josué (corte)", op: "OP-1039" },
        { id: uid(), data: d(-3), material: "m5", tipo: "entrada", qtd: 5000, resp: "Lúcia (almoxarifado)", op: "NF 33.812" },
        { id: uid(), data: d(-6), material: "m2", tipo: "saida", qtd: 390, resp: "Josué (corte)", op: "OP-1041" },
      ],
      clientes: [
        { id: uid(), nome: "Loja Flor de Lis — Shopping Iguatemi", tipo: "Loja própria", cidade: "Fortaleza", compras: 412000, ultima: d(-2) },
        { id: uid(), nome: "Loja Flor de Lis — Centro", tipo: "Loja própria", cidade: "Fortaleza", compras: 268000, ultima: d(-1) },
        { id: uid(), nome: "Boutique Maré Alta", tipo: "Lojista (atacado)", cidade: "Natal", compras: 121000, ultima: d(-9) },
        { id: uid(), nome: "Moda Sertão Multimarcas", tipo: "Lojista (atacado)", cidade: "Juazeiro do Norte", compras: 88000, ultima: d(-14) },
        { id: uid(), nome: "Armazém da Moda", tipo: "Lojista (atacado)", cidade: "Teresina", compras: 54000, ultima: d(-33) },
        { id: uid(), nome: "Vitrine Lu Modas", tipo: "Lojista (atacado)", cidade: "Sobral", compras: 31000, ultima: d(-21) },
        { id: uid(), nome: "Bazar Estilo", tipo: "Lojista (atacado)", cidade: "Mossoró", compras: 17500, ultima: d(-58) },
        { id: uid(), nome: "Feira da José Avelino (avulso)", tipo: "Varejo", cidade: "Fortaleza", compras: 9800, ultima: d(-40) },
      ],
      produtos: [
        { ref: "BL-104", nome: "Blusa Básica Malha", vendidas30: 2900, estoque: 1800 },
        { ref: "VS-221", nome: "Vestido Midi Linho", vendidas30: 520, estoque: 140 },
        { ref: "CL-310", nome: "Calça Wide Leg Sarja", vendidas30: 610, estoque: 380 },
        { ref: "BM-118", nome: "Bermuda Jeans", vendidas30: 230, estoque: 1150 },
        { ref: "CM-075", nome: "Camisa Viscose Estampada", vendidas30: 90, estoque: 860 },
      ],
      contas: [
        { id: uid(), desc: "Oficina Irmãs Lima — OP-1036", cat: "Oficina", tipo: "pagar", valor: 1050, venc: d(1), pago: false },
        { id: uid(), desc: "Têxtil Nordeste — NF 8.120 (malha)", cat: "Fornecedor", tipo: "pagar", valor: 7840, venc: d(3), pago: false },
        { id: uid(), desc: "Folha de pagamento", cat: "Funcionários", tipo: "pagar", valor: 18600, venc: d(13), pago: false },
        { id: uid(), desc: "DAS — Simples Nacional", cat: "Impostos", tipo: "pagar", valor: 6120, venc: d(3), pago: false },
        { id: uid(), desc: "Aluguel do galpão", cat: "Fixo", tipo: "pagar", valor: 4500, venc: d(-1), pago: false },
        { id: uid(), desc: "Boutique Maré Alta — pedido 552", cat: "Venda atacado", tipo: "receber", valor: 9600, venc: d(2), pago: false },
        { id: uid(), desc: "Moda Sertão — boleto 2/3", cat: "Venda atacado", tipo: "receber", valor: 7300, venc: d(6), pago: false },
        { id: uid(), desc: "Lojas próprias — cartões (D+30)", cat: "Varejo", tipo: "receber", valor: 22400, venc: d(10), pago: false },
        { id: uid(), desc: "Armazém da Moda — boleto vencido", cat: "Venda atacado", tipo: "receber", valor: 3900, venc: d(-12), pago: false },
      ],
      fluxo: [
        { mes: "Jun", entra: 61000, sai: 58000 },
        { mes: "Jul", entra: 58500, sai: 60200 },
        { mes: "Ago", entra: 64000, sai: 57300 },
        { mes: "Set", entra: 70200, sai: 63800 },
        { mes: "Out", entra: 67800, sai: 69100 },
        { mes: "Nov", entra: 73500, sai: 64400 },
      ],
      colecoes: [
        { nome: "Alto Verão 27", cor: "#c8553d", fases: [["Criação", 0, 1], ["Compra", 1, 2], ["Produção", 2, 4], ["Lançamento", 4, 5]] },
        { nome: "Resort 27", cor: "#2b3a67", fases: [["Criação", 2, 4], ["Compra", 4, 5], ["Produção", 5, 7], ["Lançamento", 7, 8]] },
        { nome: "Inverno Nordeste 27", cor: "#2f7d55", fases: [["Criação", 4, 6], ["Compra", 6, 7], ["Produção", 7, 9], ["Lançamento", 9, 10]] },
        { nome: "Natal / Réveillon 27", cor: "#b7791f", fases: [["Criação", 7, 8], ["Compra", 8, 9], ["Produção", 9, 11], ["Lançamento", 11, 12]] },
      ],
      equipe: [
        { nome: "Josué Almeida", funcao: "Cortador", setor: "Corte", origem: "Corte", treino: 100 },
        { nome: "Lúcia Ferreira", funcao: "Almoxarife", setor: "Almoxarifado", origem: "Almoxarifado", treino: 100 },
        { nome: "Raimunda Sousa", funcao: "Revisora", setor: "Acabamento", origem: "Acabamento", treino: 90 },
        { nome: "Ana Paula Costa", funcao: "Vendedora", setor: "Acabamento", origem: "Vendas", treino: 35 },
        { nome: "Marcos Vieira", funcao: "Estoquista", setor: "Expedição", origem: "Loja", treino: 60 },
        { nome: "Débora Lins", funcao: "Modelista", setor: "Desenvolvimento", origem: "Desenvolvimento", treino: 100 },
      ],
      custo: {
        produto: "Blusa Básica Malha (BL-104)",
        preco: 10,
        itens: [
          ["Malha PV (0,45 m)", 4.05],
          ["Linha e aviamentos", 0.35],
          ["Tag + etiqueta", 0.30],
          ["Embalagem", 0.30],
          ["Costura na oficina", 3.00],
        ],
        desperdicio: 15, impostos: 4, maoObra: 0.30, fixos: 0.24, frete: 0.10, volume: 100000,
      },
    };
  }

  let S = store.get("alinhavo:data");
  if (!S || S.versao !== 2) { S = seed(); store.set("alinhavo:data", S); }
  const save = () => store.set("alinhavo:data", S);

  /* ================= Cálculos ================= */
  const oficinaNome = (id) => (S.oficinas.find((o) => o.id === id) || {}).nome || "—";
  const parados = () => S.materiais.filter((m) => -daysFrom(m.ultimaSaida) >= 60 && m.qtd > 0);
  const capitalParado = () => parados().reduce((s, m) => s + m.qtd * m.custo, 0);
  const abaixoMin = () => S.materiais.filter((m) => m.minimo > 0 && m.qtd < m.minimo);
  const abertas = (tipo) => S.contas.filter((c) => c.tipo === tipo && !c.pago);
  const soma = (arr, k) => arr.reduce((s, x) => s + x[k], 0);

  function custoReal(c = S.custo) {
    const tecido = c.itens[0][1];
    const visivel = c.itens.reduce((s, i) => s + i[1], 0);
    const desperdicio = tecido * (c.desperdicio / 100);
    const impostos = c.preco * (c.impostos / 100);
    const ocultos = desperdicio + impostos + c.maoObra + c.fixos + c.frete;
    const total = visivel + ocultos;
    return {
      visivel, desperdicio, impostos, ocultos, total,
      lucroAchado: c.preco - visivel,
      lucroReal: c.preco - total,
      precoSugerido: (visivel + desperdicio + c.maoObra + c.fixos + c.frete) / (1 - c.impostos / 100 - 0.15), // margem-alvo 15%
    };
  }

  function curvaABC() {
    const lista = [...S.clientes].sort((a, b) => b.compras - a.compras);
    const total = soma(lista, "compras");
    let acc = 0;
    return lista.map((c) => {
      acc += c.compras;
      const p = acc / total;
      return { ...c, share: c.compras / total, classe: p <= 0.8 || acc === c.compras ? "A" : p <= 0.95 ? "B" : "C" };
    });
  }

  /* ================= Rotas ================= */
  const ROUTES = [
    { id: "inicio", label: "Início", icon: "inicio", render: viewInicio },
    { id: "producao", label: "Produção", icon: "producao", render: viewProducao },
    { id: "oficinas", label: "Oficinas", icon: "oficinas", render: viewOficinas },
    { id: "almox", label: "Almoxarifado", short: "Estoque", icon: "almox", render: viewAlmox },
    { id: "custo", label: "Custo real", icon: "custo", render: viewCusto },
    { id: "vendas", label: "Vendas e clientes", short: "Vendas", icon: "vendas", render: viewVendas },
    { id: "financeiro", label: "Financeiro", icon: "financeiro", render: viewFinanceiro },
    { id: "colecoes", label: "Coleções", icon: "colecoes", render: viewColecoes },
    { id: "equipe", label: "Equipe", icon: "equipe", render: viewEquipe },
  ];
  const BOTTOM = ["inicio", "producao", "custo", "almox"];

  const navHTML = (cur) => ROUTES.map((r) => `<a href="#/${r.id}" class="${r.id === cur ? "active" : ""}">${icon(r.icon)}<span>${r.label}</span></a>`).join("");

  function render() {
    const id = (location.hash.replace(/^#\/?/, "") || "inicio").split("?")[0];
    const route = ROUTES.find((r) => r.id === id) || ROUTES[0];
    closeDrawer();
    $("#nav").innerHTML = navHTML(route.id);
    $("#bottomnav").innerHTML =
      BOTTOM.map((b) => { const r = ROUTES.find((x) => x.id === b); return `<a href="#/${r.id}" class="${r.id === route.id ? "active" : ""}">${icon(r.icon)}<span>${r.short || r.label}</span></a>`; }).join("") +
      `<button type="button" data-act="drawer" class="${BOTTOM.includes(route.id) ? "" : "active"}">${icon("menu")}<span>Mais</span></button>`;
    $("#view").innerHTML = route.render();
    document.title = `${route.label} · Alinhavo`;
    window.scrollTo(0, 0);
    if (route.id === "custo") bindCusto();
  }

  const head = (title, sub, actions = "") => `<div class="page-head"><div><h1>${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ""}</div>${actions ? `<div style="display:flex;gap:8px;flex-wrap:wrap">${actions}</div>` : ""}</div>`;
  const kpi = (label, value, hint = "", cls = "") => `<div class="card kpi ${cls}"><div class="label">${label}</div><div class="value">${value}</div>${hint ? `<div class="hint">${hint}</div>` : ""}</div>`;
  const alertBox = (cls, title, text, ic = "alert") => `<div class="alert ${cls}">${icon(ic)}<div><b>${title}</b><span class="muted small">${text}</span></div></div>`;

  /* ---------- Início ---------- */
  function viewInicio() {
    const emProd = S.ops.filter((o) => o.etapa < 4);
    const naOficina = S.remessas.filter((r) => !r.entregue);
    const receber = soma(abertas("receber"), "valor");
    const pagar = soma(abertas("pagar"), "valor");
    const cr = custoReal();

    const alerts = [];
    naOficina.forEach((r) => {
      const n = daysFrom(r.retorno);
      if (n < 0) alerts.push(alertBox("bad", `${oficinaNome(r.oficina)} atrasou ${-n} dia(s)`, ` ${int(r.pecas)} peças da ${esc(r.op)} deviam ter voltado ${dataBR(r.retorno)}.`, "truck"));
      else if (n <= 1) alerts.push(alertBox("warn", `Retirar na ${oficinaNome(r.oficina)} ${quando(r.retorno)}`, ` ${int(r.pecas)} peças da ${esc(r.op)}.`, "truck"));
    });
    abaixoMin().forEach((m) => alerts.push(alertBox("warn", `${m.nome} abaixo do mínimo`, ` Tem ${int(m.qtd)} ${m.un}, mínimo ${int(m.minimo)} ${m.un}. Fornecedor: ${esc(m.fornecedor)}.`, "almox")));
    parados().forEach((m) => alerts.push(alertBox("", `${m.nome} parado há ${-daysFrom(m.ultimaSaida)} dias`, ` ${brl(m.qtd * m.custo)} de dinheiro imobilizado no almoxarifado.`, "info")));

    return `
      ${head(`Olá, ${esc(S.empresa)}`, "Tudo o que precisa de atenção hoje, em um lugar só.")}
      <div class="grid g4">
        ${kpi("Peças em produção", int(soma(emProd, "qtd")), `${emProd.length} ordens abertas`)}
        ${kpi("Peças nas oficinas", int(soma(naOficina, "pecas")), `${naOficina.length} remessas fora`)}
        ${kpi("Dinheiro parado no estoque", brlK(capitalParado()), "material sem uso há +60 dias")}
        ${kpi("Saldo previsto", brlK(receber - pagar), `receber ${brlK(receber)} · pagar ${brlK(pagar)}`)}
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-head"><h2>O que você quer fazer?</h2></div>
        <div class="quick">
          <button class="btn" data-act="novaOP">${icon("producao")}Nova ordem de produção</button>
          <button class="btn" data-act="mov">${icon("swap")}Entrada / saída de material</button>
          <button class="btn" data-act="novaRemessa">${icon("truck")}Enviar peças para oficina</button>
          <a class="btn" href="#/custo">${icon("custo")}Quanto eu lucro por peça?</a>
        </div>
      </div>

      <div class="grid g2" style="margin-top:16px">
        <div class="card">
          <div class="card-head"><h2>Atenção hoje</h2><span class="tag ${alerts.length ? "warn" : "ok"}">${alerts.length} aviso(s)</span></div>
          ${alerts.length ? alerts.join("") : `<div class="empty">Nada pendente. Tudo em ordem!</div>`}
        </div>
        <div class="stack">
          <div class="card">
            <div class="card-head"><h2>Lucro real da peça mais vendida</h2><a href="#/custo" class="small">Ver ficha</a></div>
            <p class="muted small">${esc(S.custo.produto)} · vendida a ${brl(S.custo.preco)}</p>
            <div class="compare" style="margin-top:12px">
              <div class="box thought"><div class="small muted">Você acha que lucra</div><div class="big">${brl(cr.lucroAchado)}</div></div>
              <div class="box real"><div class="small muted">Lucro real</div><div class="big">${brl(cr.lucroReal)}</div></div>
            </div>
          </div>
          <div class="card">
            <div class="card-head"><h2>Produção por etapa</h2><a href="#/producao" class="small">Abrir</a></div>
            ${ETAPAS.map((e, i) => {
              const q = soma(S.ops.filter((o) => o.etapa === i), "qtd");
              const max = Math.max(...ETAPAS.map((_, j) => soma(S.ops.filter((o) => o.etapa === j), "qtd")), 1);
              return `<div style="margin:8px 0"><div class="list-row" style="padding:0 0 4px;border:0"><span class="small">${e}</span><b class="small num">${int(q)} pç</b></div><div class="bar"><i style="width:${(q / max) * 100}%"></i></div></div>`;
            }).join("")}
          </div>
        </div>
      </div>`;
  }

  /* ---------- Produção ---------- */
  function viewProducao() {
    return `
      ${head("Produção", "Cada ordem anda da esquerda para a direita. Um toque em “Avançar” e pronto.", `<button class="btn primary" data-act="novaOP">${icon("plus")}Nova ordem</button>`)}
      <div class="kanban">
        ${ETAPAS.map((e, i) => {
          const ops = S.ops.filter((o) => o.etapa === i);
          return `<div class="col">
            <div class="col-head"><span>${e}</span><span class="tag">${ops.length}</span></div>
            ${ops.map((o) => {
              const n = daysFrom(o.prazo);
              const st = i === 4 ? `<span class="tag ok">concluída</span>` : n < 0 ? `<span class="tag bad">atrasada</span>` : n <= 2 ? `<span class="tag warn">prazo ${quando(o.prazo)}</span>` : `<span class="tag">prazo ${dataBR(o.prazo)}</span>`;
              return `<div class="op">
                <div class="row"><span class="ref">${esc(o.ref)}</span>${st}</div>
                <div class="meta">${esc(o.produto)} · <b class="num">${int(o.qtd)}</b> peças${o.oficina && i === 1 ? `<br>${esc(oficinaNome(o.oficina))}` : ""}</div>
                ${i < 4 ? `<button class="btn sm" data-act="avancar" data-id="${o.id}">Avançar ${icon("arrow")}</button>` : ""}
              </div>`;
            }).join("") || `<div class="empty">Vazio</div>`}
          </div>`;
        }).join("")}
      </div>
      <div class="card" style="margin-top:16px">
        ${alertBox("", "Por que isso evita prejuízo?", " Sem ficha e sem etapa registrada, ninguém sabe onde está cada lote. Aqui cada peça tem dono, prazo e etapa — e o atraso aparece antes de virar problema com o lojista.", "info")}
      </div>`;
  }

  /* ---------- Oficinas ---------- */
  function viewOficinas() {
    const cards = S.oficinas.map((o) => {
      const rs = S.remessas.filter((r) => r.oficina === o.id);
      const fora = rs.filter((r) => !r.entregue);
      const aPagar = rs.filter((r) => r.entregue && !r.pago).reduce((s, r) => s + r.pecas * r.valorPeca, 0);
      return `<div class="card">
        <h3>${esc(o.nome)}</h3>
        <p class="muted small" style="margin-top:2px">${esc(o.endereco)}<br>${esc(o.contato)} · ${o.costureiras} costureiras</p>
        <div class="divider"></div>
        <div class="list-row" style="border:0;padding:2px 0"><span class="small muted">Peças com ela agora</span><b class="num">${int(soma(fora, "pecas"))}</b></div>
        <div class="list-row" style="border:0;padding:2px 0"><span class="small muted">A pagar</span><b class="num">${brl(aPagar)}</b></div>
      </div>`;
    }).join("");

    const rows = [...S.remessas].sort((a, b) => a.entregue - b.entregue || a.retorno.localeCompare(b.retorno)).map((r) => {
      const n = daysFrom(r.retorno);
      const status = r.entregue
        ? (r.pago ? `<span class="tag ok">entregue · pago</span>` : `<span class="tag accent">entregue · pagar</span>`)
        : n < 0 ? `<span class="tag bad">atrasada ${-n}d</span>` : `<span class="tag warn">volta ${quando(r.retorno)}</span>`;
      const act = !r.entregue
        ? `<button class="btn sm" data-act="entregue" data-id="${r.id}">Recebi as peças</button>`
        : !r.pago ? `<button class="btn sm primary" data-act="pagarRemessa" data-id="${r.id}">Marcar pago</button>` : "";
      return `<tr>
        <td><b>${esc(oficinaNome(r.oficina))}</b><div class="small muted">${esc(r.op)}</div></td>
        <td class="hide-sm">${dataBR(r.saida)}</td>
        <td>${dataBR(r.retorno)}</td>
        <td class="r num">${int(r.pecas)}</td>
        <td class="r num hide-sm">${brl(r.valorPeca)}</td>
        <td class="r num"><b>${brl(r.pecas * r.valorPeca)}</b></td>
        <td>${status}</td>
        <td class="r">${act}</td>
      </tr>`;
    }).join("");

    return `
      ${head("Oficinas de costura", "Quando as peças saíram, quando voltam, quantas são e quanto pagar.", `<button class="btn primary" data-act="novaRemessa">${icon("plus")}Enviar peças</button>`)}
      <div class="grid g3">${cards}</div>
      <div class="card" style="margin-top:16px">
        <div class="card-head"><h2>Remessas</h2></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Oficina / OP</th><th class="hide-sm">Saiu</th><th>Volta</th><th class="r">Peças</th><th class="r hide-sm">R$/peça</th><th class="r">Total</th><th>Status</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
      </div>`;
  }

  /* ---------- Almoxarifado ---------- */
  function viewAlmox() {
    const total = S.materiais.reduce((s, m) => s + m.qtd * m.custo, 0);
    const rows = S.materiais.map((m) => {
      const parado = -daysFrom(m.ultimaSaida);
      const pct = m.minimo ? Math.min(100, (m.qtd / (m.minimo * 2)) * 100) : 100;
      const st = m.minimo && m.qtd < m.minimo ? `<span class="tag bad">comprar</span>` : parado >= 60 ? `<span class="tag warn">parado ${parado}d</span>` : `<span class="tag ok">ok</span>`;
      return `<tr>
        <td><b>${esc(m.nome)}</b><div class="small muted">${esc(m.tipo)} · ${esc(m.fornecedor)}</div></td>
        <td style="min-width:120px"><div class="num"><b>${int(m.qtd)}</b> ${m.un}</div>${m.minimo ? `<div class="bar ${m.qtd < m.minimo ? "bad" : ""}" style="margin-top:4px"><i style="width:${pct}%"></i></div>` : ""}</td>
        <td class="r num hide-sm">${brl(m.qtd * m.custo)}</td>
        <td>${st}</td>
        <td class="r"><button class="btn sm" data-act="mov" data-id="${m.id}" aria-label="Movimentar">${icon("swap")}<span class="hide-sm">Movimentar</span></button></td>
      </tr>`;
    }).join("");
    const movs = S.movimentos.slice(0, 8).map((v) => {
      const m = S.materiais.find((x) => x.id === v.material) || {};
      return `<div class="list-row">
        <div><b class="small">${v.tipo === "entrada" ? "Entrada" : "Saída"} · ${esc(m.nome)}</b><div class="small muted">${esc(v.resp)} · ${esc(v.op)} · ${dataBR(v.data)}</div></div>
        <span class="tag ${v.tipo === "entrada" ? "ok" : ""} num">${v.tipo === "entrada" ? "+" : "−"}${int(v.qtd)} ${m.un || ""}</span>
      </div>`;
    }).join("");

    return `
      ${head("Almoxarifado", "Tecidos, aviamentos e embalagens: o que tem, o que falta e o que está parado.", `<button class="btn primary" data-act="mov">${icon("swap")}Entrada / saída</button>`)}
      <div class="grid g4">
        ${kpi("Valor em estoque", brlK(total))}
        ${kpi("Dinheiro parado", brlK(capitalParado()), "sem uso há +60 dias")}
        ${kpi("Itens para comprar", abaixoMin().length, "abaixo do mínimo")}
        ${kpi("Movimentações", S.movimentos.length, "todas com responsável")}
      </div>
      <div class="grid g2 split" style="margin-top:16px">
        <div class="card">
          <div class="card-head"><h2>Materiais</h2></div>
          <div class="table-wrap"><table>
            <thead><tr><th>Material</th><th>Quantidade</th><th class="r hide-sm">Valor</th><th>Status</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table></div>
        </div>
        <div class="stack">
          <div class="card">
            ${alertBox("ok", "Toda saída tem nome e destino", " Nenhum tecido sai sem responsável e sem ordem de produção. Fica fácil perceber sumiço de material.", "shield")}
          </div>
          <div class="card">
            <div class="card-head"><h2>Últimas movimentações</h2></div>
            ${movs || `<div class="empty">Sem movimentações</div>`}
          </div>
        </div>
      </div>`;
  }

  /* ---------- Custo real ---------- */
  function viewCusto() {
    const c = S.custo;
    const slider = (key, label, min, max, step, fmt) => `
      <div class="slider-row">
        <label for="s-${key}" class="small">${label}</label><span class="val" data-val="${key}">${fmt(c[key])}</span>
        <input type="range" id="s-${key}" data-key="${key}" min="${min}" max="${max}" step="${step}" value="${c[key]}">
      </div>`;
    return `
      ${head("Custo real da peça", "Ficha técnica + ficha financeira. Mexa nos controles e veja o lucro de verdade.")}
      <div class="grid g2 split-c">
        <div class="stack">
          <div class="card">
            <div class="card-head"><h2>Ficha técnica</h2><span class="tag">${esc(c.produto)}</span></div>
            ${c.itens.map((i) => `<div class="list-row"><span class="small">${esc(i[0])}</span><b class="num small">${brl(i[1])}</b></div>`).join("")}
            <div class="list-row"><b>Custo que todo mundo vê</b><b class="num" id="cvis"></b></div>
          </div>
          <div class="card">
            <div class="card-head"><h2>O que costuma ficar de fora</h2></div>
            ${slider("desperdicio", "Desperdício de tecido (risco, rebarba, costura mal feita)", 0, 30, 1, (v) => v + "%")}
            ${slider("impostos", "Impostos sobre a venda", 0, 15, 0.5, (v) => String(v).replace(".", ",") + "%")}
            ${slider("maoObra", "Mão de obra interna por peça (corte, revisão)", 0, 1.5, 0.01, brl)}
            ${slider("fixos", "Custos fixos por peça (aluguel, energia)", 0, 1.5, 0.01, brl)}
            ${slider("frete", "Frete por peça", 0, 1, 0.01, brl)}
          </div>
        </div>
        <div class="stack">
          <div class="card">
            <div class="card-head"><h2>Resultado por peça</h2></div>
            <div class="slider-row" style="border:0;padding-top:0">
              <label for="s-preco" class="small">Preço de venda</label><span class="val" data-val="preco">${brl(c.preco)}</span>
              <input type="range" id="s-preco" data-key="preco" min="8" max="16" step="0.1" value="${c.preco}">
            </div>
            <div class="compare">
              <div class="box thought"><div class="small muted">Lucro que você imagina</div><div class="big" id="lAchado"></div><div class="small muted">preço − custo visível</div></div>
              <div class="box real"><div class="small muted">Lucro real</div><div class="big" id="lReal"></div><div class="small muted" id="lPct"></div></div>
            </div>
            <div class="breakdown" id="brk"></div>
            <div class="legend" id="leg"></div>
          </div>
          <div class="card">
            <div class="card-head"><h2>No fim do mês</h2></div>
            <div class="slider-row" style="border:0;padding-top:0">
              <label for="s-volume" class="small">Peças vendidas por mês</label><span class="val" data-val="volume">${int(c.volume)}</span>
              <input type="range" id="s-volume" data-key="volume" min="1000" max="150000" step="1000" value="${c.volume}">
            </div>
            <div class="grid g2" style="gap:12px">
              <div class="card kpi" style="box-shadow:none"><div class="label">Lucro que você imagina</div><div class="value" id="mAchado"></div></div>
              <div class="card kpi" style="box-shadow:none;border-color:var(--accent)"><div class="label">Lucro real</div><div class="value" id="mReal" style="color:var(--accent)"></div></div>
            </div>
            <div id="sug" style="margin-top:12px"></div>
          </div>
          <div class="card">
            ${alertBox("", "Caso real de um cliente", " Produzia por R$ 8 e vendia por R$ 10: achava que lucrava R$ 2 por peça (R$ 200 mil/mês em 100 mil peças). Com o sistema e a ficha completa, o lucro real era R$ 0,35 por peça.", "info")}
          </div>
        </div>
      </div>`;
  }

  function bindCusto() {
    const update = () => {
      const c = S.custo, r = custoReal();
      $("#cvis").textContent = brl(r.visivel);
      $("#lAchado").textContent = brl(r.lucroAchado);
      $("#lReal").textContent = brl(r.lucroReal);
      $("#lPct").textContent = `${((r.lucroReal / c.preco) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% do preço`;
      $("#mAchado").textContent = brlK(r.lucroAchado * c.volume);
      $("#mReal").textContent = brlK(r.lucroReal * c.volume);
      const parts = [
        ["Custo visível", r.visivel, "#2b3a67"],
        ["Desperdício", r.desperdicio, "#c8553d"],
        ["Impostos", r.impostos, "#b7791f"],
        ["Mão de obra + fixos + frete", c.maoObra + c.fixos + c.frete, "#8a8f9c"],
        [r.lucroReal >= 0 ? "Lucro" : "Prejuízo", Math.abs(r.lucroReal), r.lucroReal >= 0 ? "#2f7d55" : "#b83a3a"],
      ];
      const tot = parts.reduce((s, p) => s + p[1], 0) || 1;
      $("#brk").innerHTML = parts.map((p) => `<i style="width:${(p[1] / tot) * 100}%;background:${p[2]}" title="${p[0]}: ${brl(p[1])}"></i>`).join("");
      $("#leg").innerHTML = parts.map((p) => `<span style="--c:${p[2]}">${p[0]} ${brl(p[1])}</span>`).join("");
      $("#sug").innerHTML = r.lucroReal < 0
        ? alertBox("bad", "Você está pagando para vender", ` Para ter 15% de margem real, o preço deveria ser ${brl(r.precoSugerido)}.`)
        : r.lucroReal / c.preco < 0.1
          ? alertBox("warn", "Margem apertada", ` Para 15% de margem real, o preço sugerido é ${brl(r.precoSugerido)} — ou reduza o desperdício.`)
          : alertBox("ok", "Margem saudável", ` Lucro real de ${brl(r.lucroReal)} por peça.`, "check");
    };
    $("#view").querySelectorAll("input[type=range]").forEach((inp) => {
      inp.addEventListener("input", () => {
        const k = inp.dataset.key, v = Number(inp.value);
        S.custo[k] = v;
        const out = $(`[data-val="${k}"]`);
        if (out) out.textContent = k === "desperdicio" ? v + "%" : k === "impostos" ? String(v).replace(".", ",") + "%" : k === "volume" ? int(v) : brl(v);
        update();
        save();
      });
    });
    update();
  }

  /* ---------- Vendas e clientes ---------- */
  function viewVendas() {
    const abc = curvaABC();
    const cls = { A: "ok", B: "warn", C: "" };
    const rows = abc.map((c) => `<tr>
      <td><b>${esc(c.nome)}</b><div class="small muted">${esc(c.tipo)} · ${esc(c.cidade)}</div></td>
      <td class="r num">${brlK(c.compras)}</td>
      <td class="r num hide-sm">${(c.share * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</td>
      <td class="hide-sm">${quando(c.ultima)}</td>
      <td><span class="tag ${cls[c.classe]}">Curva ${c.classe}</span></td>
    </tr>`).join("");
    const cont = (k) => abc.filter((c) => c.classe === k);
    const prods = S.produtos.map((p) => {
      const cobertura = Math.round((p.estoque / p.vendidas30) * 30);
      const cortar = Math.max(0, Math.round(p.vendidas30 * 1.2 - p.estoque));
      const dec = cobertura < 25 ? `<span class="tag ok">produzir ${int(Math.ceil(cortar / 50) * 50)} pç</span>` : cobertura > 90 ? `<span class="tag bad">segurar produção</span>` : `<span class="tag">estoque ok</span>`;
      return `<tr>
        <td><b>${esc(p.nome)}</b><div class="small muted">${esc(p.ref)}</div></td>
        <td class="r num">${int(p.vendidas30)}</td>
        <td class="r num hide-sm">${int(p.estoque)}</td>
        <td class="r num">${cobertura} dias</td>
        <td>${dec}</td>
      </tr>`;
    }).join("");
    return `
      ${head("Vendas e clientes", "Quem compra mais, quem sumiu e o que vale a pena produzir.")}
      <div class="grid g3">
        ${kpi("Clientes curva A", cont("A").length, `${brlK(soma(cont("A"), "compras"))} — 80% do faturamento`)}
        ${kpi("Clientes curva B", cont("B").length, brlK(soma(cont("B"), "compras")))}
        ${kpi("Clientes curva C", cont("C").length, brlK(soma(cont("C"), "compras")))}
      </div>
      <div class="card" style="margin-top:16px">
        <div class="card-head"><h2>O que produzir agora</h2><span class="small muted">vendas dos últimos 30 dias × estoque</span></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Produto</th><th class="r">Vendidas</th><th class="r hide-sm">Estoque</th><th class="r">Dura</th><th>Decisão</th></tr></thead>
          <tbody>${prods}</tbody>
        </table></div>
        <div style="margin-top:12px">${alertBox("warn", "Moda é cíclica", " Peça parada vira prejuízo. A Camisa Viscose tem estoque para mais de 9 meses: não corte mais, faça promoção.", "info")}</div>
      </div>
      <div class="card">
        <div class="card-head"><h2>Clientes — curva ABC</h2><span class="small muted">compras nos últimos 12 meses</span></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Cliente</th><th class="r">Compras</th><th class="r hide-sm">Fatia</th><th class="hide-sm">Última compra</th><th>Classe</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
      </div>`;
  }

  /* ---------- Financeiro ---------- */
  function viewFinanceiro() {
    const receber = abertas("receber"), pagar = abertas("pagar");
    const lista = (arr, tipo) => arr.sort((a, b) => a.venc.localeCompare(b.venc)).map((c) => {
      const n = daysFrom(c.venc);
      const tag = n < 0 ? `<span class="tag bad">venceu ${quando(c.venc)}</span>` : n <= 3 ? `<span class="tag warn">${quando(c.venc)}</span>` : `<span class="tag">${dataBR(c.venc)}</span>`;
      return `<div class="list-row">
        <div style="min-width:0"><b class="small">${esc(c.desc)}</b><div class="small muted">${esc(c.cat)} · ${tag}</div></div>
        <div style="text-align:right;flex:none"><b class="num">${brl(c.valor)}</b><br><button class="btn sm ghost" data-act="baixa" data-id="${c.id}">${tipo === "pagar" ? "Paguei" : "Recebi"}</button></div>
      </div>`;
    }).join("") || `<div class="empty">Nada em aberto</div>`;

    // gráfico de barras SVG
    const W = 560, H = 200, pad = 28, max = Math.max(...S.fluxo.flatMap((f) => [f.entra, f.sai]));
    const bw = (W - pad * 2) / S.fluxo.length;
    const bars = S.fluxo.map((f, i) => {
      const x = pad + i * bw, hE = (f.entra / max) * (H - 50), hS = (f.sai / max) * (H - 50);
      const saldo = f.entra - f.sai;
      return `<rect x="${x + bw * 0.14}" y="${H - 24 - hE}" width="${bw * 0.32}" height="${hE}" rx="4" fill="#2f7d55"/>
        <rect x="${x + bw * 0.5}" y="${H - 24 - hS}" width="${bw * 0.32}" height="${hS}" rx="4" fill="#c8553d"/>
        <text x="${x + bw / 2}" y="${H - 8}" text-anchor="middle" font-size="12" fill="#5b6170">${f.mes}</text>
        <text x="${x + bw / 2}" y="${H - 30 - Math.max(hE, hS)}" text-anchor="middle" font-size="11" font-weight="600" fill="${saldo >= 0 ? "#2f7d55" : "#b83a3a"}">${saldo >= 0 ? "+" : "−"}${Math.round(Math.abs(saldo) / 1000)}k</text>`;
    }).join("");

    return `
      ${head("Financeiro", "Contas a pagar, a receber e o caixa do mês — sem planilha.")}
      <div class="grid g4">
        ${kpi("A receber", brlK(soma(receber, "valor")), `${receber.length} lançamentos`)}
        ${kpi("A pagar", brlK(soma(pagar, "valor")), `${pagar.length} lançamentos`)}
        ${kpi("Saldo previsto", brlK(soma(receber, "valor") - soma(pagar, "valor")))}
        ${kpi("Vencidos", S.contas.filter((c) => !c.pago && daysFrom(c.venc) < 0).length, "precisam de ação")}
      </div>
      <div class="card" style="margin-top:16px">
        <div class="card-head"><h2>Fluxo de caixa — últimos 6 meses</h2><div class="legend"><span style="--c:#2f7d55">Entradas</span><span style="--c:#c8553d">Saídas</span></div></div>
        <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Entradas e saídas por mês">${bars}</svg>
      </div>
      <div class="grid g2" style="margin-top:16px">
        <div class="card"><div class="card-head"><h2>A pagar</h2><span class="small muted">fornecedores, oficinas, funcionários, impostos</span></div>${lista(pagar, "pagar")}</div>
        <div class="card"><div class="card-head"><h2>A receber</h2></div>${lista(receber, "receber")}</div>
      </div>`;
  }

  /* ---------- Coleções ---------- */
  function viewColecoes() {
    const base = today(); base.setDate(1);
    const meses = Array.from({ length: 12 }, (_, i) => { const m = new Date(base); m.setMonth(base.getMonth() + i); return m.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""); });
    const op = [1, 0.75, 0.55, 0.9];
    const rows = S.colecoes.map((c) => `
      <div class="tl-row">
        <div class="name">${esc(c.nome)}</div>
        ${c.fases.map((f, i) => `<div class="tl-seg" style="grid-column:${f[1] + 2} / ${f[2] + 2};background:${c.cor};opacity:${op[i]}" title="${f[0]}">${f[0]}</div>`).join("")}
      </div>`).join("");
    const prox = S.colecoes[0];
    return `
      ${head("Cronograma de coleções", "Quando criar, comprar, produzir e lançar cada coleção.")}
      <div class="card">
        <div class="timeline">
          <div class="tl-months"><span></span>${meses.map((m) => `<span>${m}</span>`).join("")}</div>
          ${rows}
        </div>
        <div class="legend" style="margin-top:14px"><span style="--c:#8a8f9c">Criação → Compra de insumos → Produção → Lançamento</span></div>
      </div>
      <div class="grid g2" style="margin-top:16px">
        <div class="card">
          ${alertBox("warn", `Compra de insumos da ${esc(prox.nome)} começa no próximo mês`, " Compre só o que a ficha técnica pede. Tecido comprado “a mais” vira dinheiro parado quando a coleção passa.")}
        </div>
        <div class="card">
          ${alertBox("", "Coleção passada ainda no estoque", ` ${brl(capitalParado())} em material da coleção anterior está parado. Dá para reaproveitar em peças básicas.`, "info")}
        </div>
      </div>`;
  }

  /* ---------- Equipe ---------- */
  function viewEquipe() {
    const fora = S.equipe.filter((e) => e.setor !== e.origem);
    const rows = S.equipe.map((e, i) => `<tr>
      <td><b>${esc(e.nome)}</b><div class="small muted">${esc(e.funcao)}</div></td>
      <td>${esc(e.setor)}${e.setor !== e.origem ? `<div class="small" style="color:var(--warn)">veio de ${esc(e.origem)}</div>` : ""}</td>
      <td style="min-width:130px"><div class="bar ${e.treino < 50 ? "bad" : e.treino < 80 ? "warn" : ""}"><i style="width:${e.treino}%"></i></div><div class="small muted num" style="margin-top:3px">${e.treino}% treinado</div></td>
      <td class="r">${e.treino < 100 ? `<button class="btn sm" data-act="treino" data-id="${i}">+ etapa concluída</button>` : `<span class="tag ok">pronto</span>`}</td>
    </tr>`).join("");
    return `
      ${head("Equipe", "Quem faz o quê — e quem ainda está aprendendo o setor.")}
      <div class="grid g3">
        ${kpi("Colaboradores", S.equipe.length)}
        ${kpi("Fora do setor de origem", fora.length, "precisam de treinamento")}
        ${kpi("Vagas em aberto", 2, "costureira · cortador")}
      </div>
      <div class="card" style="margin-top:16px">
        ${fora.map((e) => alertBox("warn", `${esc(e.nome)} (${esc(e.origem.toLowerCase())}) está ajudando em ${esc(e.setor.toLowerCase())}`, ` Treinamento em ${e.treino}%. Até completar, as tarefas dela ficam com revisão de um colega do setor.`)).join("")}
      </div>
      <div class="card">
        <div class="card-head"><h2>Time e treinamento</h2></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Pessoa</th><th>Setor atual</th><th>Treinamento</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
      </div>`;
  }

  /* ================= Modais e ações ================= */
  function modal(html, onSubmit) {
    const bg = document.createElement("div");
    bg.className = "modal-bg";
    bg.innerHTML = `<form class="modal">${html}</form>`;
    document.body.appendChild(bg);
    const close = () => bg.remove();
    bg.addEventListener("click", (e) => { if (e.target === bg || e.target.closest("[data-close]")) close(); });
    const form = $("form", bg);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      if (onSubmit(data) !== false) close();
    });
    const first = form.querySelector("input, select");
    if (first && window.matchMedia("(min-width: 761px)").matches) first.focus();
    return close;
  }

  function toast(msg) {
    document.querySelectorAll(".toast").forEach((t) => t.remove());
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }

  const field = (name, label, input) => `<div class="field"><label for="f-${name}">${label}</label>${input}</div>`;
  const inp = (name, attrs = "") => `<input id="f-${name}" name="${name}" ${attrs}>`;
  const sel = (name, opts) => `<select id="f-${name}" name="${name}">${opts.map((o) => `<option value="${esc(o[0])}">${esc(o[1])}</option>`).join("")}</select>`;
  const actions = (label) => `<div class="actions"><button type="button" class="btn" data-close>Cancelar</button><button class="btn primary">${label}</button></div>`;

  function nextRef() {
    const n = Math.max(...S.ops.map((o) => Number(o.ref.replace(/\D/g, "")) || 0)) + 1;
    return "OP-" + n;
  }

  const ACTIONS = {
    drawer() {
      if ($(".drawer")) return closeDrawer();
      const dr = document.createElement("div");
      dr.className = "drawer";
      const cur = (location.hash.replace(/^#\/?/, "") || "inicio");
      dr.innerHTML = `<nav class="nav">${navHTML(cur)}</nav><div class="divider"></div><button class="btn sm" data-act="reset" style="width:100%">Restaurar dados de exemplo</button>`;
      document.body.appendChild(dr);
    },
    reset() {
      S = seed(); save(); closeDrawer(); render(); toast("Dados de exemplo restaurados");
    },
    novaOP() {
      modal(`<h2>Nova ordem de produção</h2><p class="muted small">Só o essencial. O resto o sistema calcula.</p>
        <div class="form-grid" style="margin-top:14px">
          ${field("produto", "Produto", sel("produto", S.produtos.map((p) => [p.nome, `${p.nome} (${p.ref})`])))}
          ${field("qtd", "Quantidade de peças", inp("qtd", 'type="number" min="1" required value="300" inputmode="numeric"'))}
          ${field("prazo", "Prazo de entrega", inp("prazo", `type="date" required value="${d(14)}"`))}
        </div>${actions("Criar ordem")}`, (f) => {
        const ref = nextRef();
        S.ops.unshift({ id: uid(), ref, produto: f.produto, qtd: Number(f.qtd), etapa: 0, prazo: f.prazo });
        save(); location.hash = "#/producao"; render(); toast(`${ref} criada no Corte`);
      });
    },
    avancar(id) {
      const o = S.ops.find((x) => x.id === id);
      if (!o) return;
      if (o.etapa === 0) {
        // ao sair do corte, pergunta a oficina
        modal(`<h2>${esc(o.ref)} vai para a oficina</h2><p class="muted small">${esc(o.produto)} · ${int(o.qtd)} peças</p>
          <div class="form-grid" style="margin-top:14px">
            ${field("oficina", "Oficina", sel("oficina", S.oficinas.map((x) => [x.id, x.nome])))}
            ${field("valorPeca", "Valor por peça (R$)", inp("valorPeca", 'type="number" step="0.10" min="0" value="4.50" required inputmode="decimal"'))}
            ${field("retorno", "Volta quando?", inp("retorno", `type="date" value="${d(7)}" required`))}
          </div>${actions("Enviar")}`, (f) => {
          o.etapa = 1; o.oficina = f.oficina;
          S.remessas.unshift({ id: uid(), oficina: f.oficina, op: o.ref, pecas: o.qtd, valorPeca: Number(f.valorPeca), saida: d(0), retorno: f.retorno, entregue: false, pago: false });
          save(); render(); toast(`${o.ref} enviada para ${oficinaNome(f.oficina)}`);
        });
        return;
      }
      if (o.etapa === 1) {
        const r = S.remessas.find((x) => x.op === o.ref && !x.entregue);
        if (r) return ACTIONS.entregue(r.id);
      }
      o.etapa = Math.min(4, o.etapa + 1);
      save(); render(); toast(`${o.ref} → ${ETAPAS[o.etapa]}`);
    },
    novaRemessa() {
      const disponiveis = S.ops.filter((o) => o.etapa === 0);
      modal(`<h2>Enviar peças para oficina</h2><p class="muted small">Registre a saída para saber quando cobrar o retorno.</p>
        <div class="form-grid" style="margin-top:14px">
          ${field("oficina", "Oficina", sel("oficina", S.oficinas.map((x) => [x.id, x.nome])))}
          ${field("op", "Ordem de produção", disponiveis.length ? sel("op", disponiveis.map((o) => [o.id, `${o.ref} — ${o.produto} (${int(o.qtd)})`])) : inp("opTxt", 'placeholder="Ex.: OP-1050" required'))}
          ${disponiveis.length ? "" : field("pecas", "Peças", inp("pecas", 'type="number" min="1" value="200" required'))}
          ${field("valorPeca", "Valor por peça (R$)", inp("valorPeca", 'type="number" step="0.10" min="0" value="4.50" required inputmode="decimal"'))}
          ${field("retorno", "Volta quando?", inp("retorno", `type="date" value="${d(7)}" required`))}
        </div>${actions("Registrar envio")}`, (f) => {
        let ref, pecas;
        if (f.op) { const o = S.ops.find((x) => x.id === f.op); o.etapa = 1; o.oficina = f.oficina; ref = o.ref; pecas = o.qtd; }
        else { ref = f.opTxt; pecas = Number(f.pecas); }
        S.remessas.unshift({ id: uid(), oficina: f.oficina, op: ref, pecas, valorPeca: Number(f.valorPeca), saida: d(0), retorno: f.retorno, entregue: false, pago: false });
        save(); location.hash = "#/oficinas"; render(); toast(`${int(pecas)} peças enviadas para ${oficinaNome(f.oficina)}`);
      });
    },
    entregue(id) {
      const r = S.remessas.find((x) => x.id === id);
      r.entregue = true;
      const o = S.ops.find((x) => x.ref === r.op && x.etapa === 1);
      if (o) o.etapa = 2;
      S.contas.push({ id: uid(), desc: `${oficinaNome(r.oficina)} — ${r.op}`, cat: "Oficina", tipo: "pagar", valor: r.pecas * r.valorPeca, venc: d(7), pago: false, remessa: r.id });
      save(); render(); toast("Peças recebidas · pagamento lançado no financeiro");
    },
    pagarRemessa(id) {
      const r = S.remessas.find((x) => x.id === id);
      r.pago = true;
      const c = S.contas.find((x) => x.remessa === id || (x.cat === "Oficina" && x.desc.includes(r.op) && !x.pago));
      if (c) c.pago = true;
      save(); render(); toast("Pagamento registrado");
    },
    mov(id) {
      modal(`<h2>Entrada / saída de material</h2><p class="muted small">Toda movimentação fica registrada com nome e destino.</p>
        <div class="form-grid" style="margin-top:14px">
          ${field("material", "Material", sel("material", S.materiais.map((m) => [m.id, `${m.nome} (${int(m.qtd)} ${m.un})`])))}
          ${field("tipo", "Tipo", sel("tipo", [["saida", "Saída para produção"], ["entrada", "Entrada (compra)"]]))}
          ${field("qtd", "Quantidade", inp("qtd", 'type="number" min="0.01" step="any" required inputmode="decimal"'))}
          ${field("resp", "Quem está movimentando", inp("resp", 'required placeholder="Nome e setor"'))}
          ${field("op", "Destino / documento", inp("op", 'required placeholder="OP-1042 ou NF"'))}
        </div>${actions("Registrar")}`, (f) => {
        const m = S.materiais.find((x) => x.id === f.material);
        const q = Number(f.qtd);
        if (f.tipo === "saida" && q > m.qtd) { toast(`Só há ${int(m.qtd)} ${m.un} em estoque`); return false; }
        m.qtd = +(m.qtd + (f.tipo === "entrada" ? q : -q)).toFixed(2);
        if (f.tipo === "saida") m.ultimaSaida = d(0);
        S.movimentos.unshift({ id: uid(), data: d(0), material: m.id, tipo: f.tipo, qtd: q, resp: f.resp, op: f.op });
        save(); render(); toast(`${f.tipo === "entrada" ? "Entrada" : "Saída"} de ${int(q)} ${m.un} registrada`);
      });
      if (id) { const s = $("#f-material"); if (s) s.value = id; }
    },
    baixa(id) {
      const c = S.contas.find((x) => x.id === id);
      c.pago = true;
      if (c.remessa) { const r = S.remessas.find((x) => x.id === c.remessa); if (r) r.pago = true; }
      save(); render(); toast(c.tipo === "pagar" ? "Conta paga" : "Valor recebido");
    },
    treino(i) {
      const e = S.equipe[Number(i)];
      e.treino = Math.min(100, e.treino + 15);
      if (e.treino >= 100) { e.origem = e.setor; }
      save(); render(); toast(e.treino >= 100 ? `${e.nome} concluiu o treinamento` : `${e.nome}: ${e.treino}% treinado`);
    },
  };

  function closeDrawer() { const dr = $(".drawer"); if (dr) dr.remove(); }

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act]");
    if (el && ACTIONS[el.dataset.act]) { e.preventDefault(); ACTIONS[el.dataset.act](el.dataset.id); return; }
    if ($(".drawer") && !e.target.closest(".drawer") && !e.target.closest(".bottomnav")) closeDrawer();
  });
  $("#resetBtn").addEventListener("click", () => ACTIONS.reset());
  document.querySelectorAll('[data-icon="logo"]').forEach((el) => (el.outerHTML = LOGO));
  window.addEventListener("hashchange", render);

  /* ================= Boas-vindas ================= */
  function welcome() {
    if (store.get("alinhavo:visto")) return;
    store.set("alinhavo:visto", true);
    modal(`<div class="welcome">
      <div class="welcome-hero">${LOGO_DARK}<div><h2>Bem-vindo ao Alinhavo</h2><p class="muted small">Gestão simples para confecções</p></div></div>
      <p>Este é um <b>protótipo navegável</b>. Pode clicar em tudo: os dados são fictícios e o que você alterar fica salvo só no seu aparelho.</p>
      <ul>
        <li><b>Custo real</b> — descubra quanto você lucra de verdade por peça.</li>
        <li><b>Produção e oficinas</b> — onde está cada lote e quando ele volta.</li>
        <li><b>Almoxarifado</b> — o que falta, o que sobra e quem retirou.</li>
      </ul>
    </div><div class="actions"><button class="btn primary" style="width:100%">Começar a explorar</button></div>`, () => { store.set("alinhavo:visto", true); });
  }

  render();
  welcome();
})();
