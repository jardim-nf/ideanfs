const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });

// Inicializa o Admin do Firebase
admin.initializeApp();
const db = admin.firestore();

// ✨ CONFIGURAÇÃO CRÍTICA: Ignora campos 'undefined' para evitar o Erro 500 no Firestore
db.settings({ ignoreUndefinedProperties: true });

// 🚨 SUA CHAVE DE PRODUÇÃO DO PLUGNOTAS
const PLUGNOTAS_API_KEY = "7a1c5954ca39092ba5fd7b390755c5fa";

// 💡 CONTROLE DE AMBIENTE (Mude para false se quiser testar no Sandbox)
const IS_PRODUCTION = true; 

// --- FUNÇÃO 1: EMISSÃO DA NOTA ---
exports.emitirNotaPlugnotas = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const dadosFront = req.body;
      const idIntegracao = dadosFront.idIntegracao || `ideianfe-${Date.now()}`;
      
      const payloadNFSe = [{
        "idIntegracao": idIntegracao,
        "prestador": { "cpfCnpj": "52073286000139" }, 
        "emitente": { "tipo": 1, "codigoCidade": "2304400" }, 
        "tomador": {
          "cpfCnpj": dadosFront.cpfCnpjTomador,
          "razaoSocial": dadosFront.razaoSocialTomador,
          "email": dadosFront.emailTomador,
          "endereco": {
            "codigoCidade": dadosFront.codigoCidadeTomador,
            "cep": dadosFront.cepTomador,
            "logradouro": dadosFront.logradouroTomador,
            "numero": dadosFront.numeroTomador || "S/N",
            "bairro": dadosFront.bairroTomador,
            "estado": dadosFront.ufTomador,
            "tipoLogradouro": "Rua"
          }
        },
        "cidadePrestacao": { "codigo": "2304400" },
        "servico": [{
          "codigo": dadosFront.codigoServico, 
          "codigoTributacao": "001",
          "codigoCidadeIncidencia": "2304400",
          "discriminacao": dadosFront.descricaoServico,
          "iss": { 
            "tipoTributacao": 6, 
            "exigibilidade": 1, 
            "aliquota": 0, 
            "retido": false 
          },
          "valor": { "servico": dadosFront.valorServico || 0 }
        }]
      }];

      console.log(`🚀 [ID: ${idIntegracao}] Enviando para PlugNotas (${IS_PRODUCTION ? 'PROD' : 'SANDBOX'})...`);

      const response = await axios.post(
        `${BASE_URL}/nfse`,
        payloadNFSe,
        { headers: { "X-API-KEY": PLUGNOTAS_API_KEY, "Content-Type": "application/json" } }
      );

      const plugnotasId = response.data.documents[0].id;

      await db.collection("notas_emitidas").doc(idIntegracao).set({
        id: idIntegracao,
        plugnotasId: plugnotasId,
        dadosFormulario: dadosFront,
        status: "PROCESSANDO",
        dataEmissao: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      res.status(200).json({ sucesso: true, id: idIntegracao });
    } catch (error) {
      console.error("❌ Erro:", error.response?.data || error.message);
      res.status(500).json({ sucesso: false, erro: error.response?.data || error.message });
    }
  });
});


// --- FUNÇÃO 2: CADASTRAR EMPRESA DE TESTE (SANDBOX) ---
exports.cadastrarEmpresaTeste = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const payloadEmpresa = [
        {
          "cpfCnpj": "52073286000139",
          "razaoSocial": "Empresa Teste Sandbox",
          "endereco": {
            "codigoCidade": "2304400"
          }
        }
      ];

      const response = await axios.post(
        "https://api.sandbox.plugnotas.com.br/empresas", // Mantido fixo no sandbox como no original
        payloadEmpresa,
        {
          headers: {
            "X-API-KEY": PLUGNOTAS_API_KEY, // Variável padronizada
            "Content-Type": "application/json"
          }
        }
      );

      res.status(200).json({ sucesso: true, mensagem: "Empresa cadastrada com sucesso no Plugnotas!", dados: response.data });
    } catch (error) {
      console.error("Erro ao cadastrar empresa:", error.response ? error.response.data : error.message);
      res.status(500).json({ sucesso: false, erro: error.response ? error.response.data : error.message });
    }
  });
});


// --- FUNÇÃO 3: CADASTRAR A EMPRESA REAL DO SEU CLIENTE (PRODUÇÃO) ---
exports.configurarMinhaEmpresa = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Use POST.');
    }

    try {
      const dadosEmpresa = req.body.empresa;
      const tipoCertificado = req.body.tipoCertificado;

      let idCertificadoPlugnotas = "";
      if (tipoCertificado === 'mei') {
        idCertificadoPlugnotas = "ID_DO_SEU_CERTIFICADO_A1_NO_PLUGNOTAS";
      } else {
        idCertificadoPlugnotas = "ID_TEMPORARIO_ATE_CRIAR_UPLOAD";
      }

      const payloadPlugnotas = [
        {
          cpfCnpj: dadosEmpresa.cnpj.replace(/\D/g, ''),
          razaoSocial: dadosEmpresa.razaoSocial,
          nomeFantasia: dadosEmpresa.nomeFantasia || dadosEmpresa.razaoSocial,
          regimeTributario: Number(dadosEmpresa.regimeTributario),
          simplesNacional: (dadosEmpresa.regimeTributario === '1' || dadosEmpresa.regimeTributario === '5'),
          certificado: idCertificadoPlugnotas,
          endereco: {
            cep: dadosEmpresa.cep.replace(/\D/g, ''),
            logradouro: dadosEmpresa.logradouro,
            numero: dadosEmpresa.numero,
            bairro: dadosEmpresa.bairro,
            codigoCidade: "2304400",
            descricaoCidade: dadosEmpresa.cidade,
            estado: dadosEmpresa.uf,
            codigoPais: "1058",
            descricaoPais: "Brasil"
          },
          nfse: {
            ativo: true,
            tipoContrato: 0
          }
        }
      ];

      const response = await axios.post(
        `${BASE_URL}/empresa`,
        payloadPlugnotas,
        {
          headers: {
            "X-API-KEY": PLUGNOTAS_API_KEY,
            "Content-Type": "application/json"
          }
        }
      );

      const cnpjLimpo = dadosEmpresa.cnpj.replace(/\D/g, '');
      await db.collection("empresas_configuradas").doc(cnpjLimpo).set({
        ...dadosEmpresa,
        tipoCertificado: tipoCertificado,
        idCertificadoUsado: idCertificadoPlugnotas,
        statusPlugnotas: "Ativo Produção",
        dataCadastro: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(200).json({ sucesso: true, mensagem: "Configurada com sucesso!", dadosPlugnotas: response.data });
    } catch (error) {
      console.error("Erro na API Empresa:", error.response ? error.response.data : error.message);
      res.status(500).json({ sucesso: false, erro: error.response ? error.response.data : error.message });
    }
  });
});


// --- FUNÇÃO 4: CONSULTAR STATUS, PDF e XML DA NOTA ---
exports.consultarNotaPlugnotas = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { idIntegracao } = req.body;
      if (!idIntegracao) return res.status(400).json({ sucesso: false, erro: "ID não informado." });

      const docSnap = await db.collection("notas_emitidas").doc(idIntegracao).get();
      const notaSalva = docSnap.data();

      if (!notaSalva || !notaSalva.plugnotasId) {
        return res.status(200).json({ 
          sucesso: false, 
          situacao: "SEM_ID", 
          erro: "Esta nota não possui ID de sincronização." 
        });
      }

      const response = await axios.get(
        `${BASE_URL}/nfse/${notaSalva.plugnotasId}`,
        { headers: { "X-API-KEY": PLUGNOTAS_API_KEY } }
      );

      const notaPlugnotas = Array.isArray(response.data) ? response.data[0] : response.data;
      const statusNovo = notaPlugnotas.situacao;

      await db.collection("notas_emitidas").doc(idIntegracao).set({
        status: statusNovo,
        linkPdf: notaPlugnotas.pdf || null,
        linkXml: notaPlugnotas.xml || null,
        dataAtualizacao: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      res.status(200).json({ 
        sucesso: true, 
        situacao: statusNovo,
        pdf: notaPlugnotas.pdf,
        xml: notaPlugnotas.xml
      });
    } catch (error) {
      console.error("❌ Erro ao consultar:", error.response?.data || error.message);
      res.status(500).json({ sucesso: false, erro: error.response?.data || error.message });
    }
  });
});


// --- FUNÇÃO 5: WEBHOOK DO PLUGNOTAS (ATUALIZAÇÃO AUTOMÁTICA) ---
exports.webhookPlugnotas = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Apenas POST permitido.');
    }

    try {
      const dadosWebhook = req.body;
      console.log("🔔 Webhook Recebido:", JSON.stringify(dadosWebhook));

      const idIntegracao = dadosWebhook.idIntegracao;

      if (!idIntegracao) {
        console.error("❌ Webhook ignorado: idIntegracao ausente.");
        return res.status(400).send("Faltando idIntegracao.");
      }

      const statusNovo = dadosWebhook.situacao; 
      const linkPdf = dadosWebhook.pdf || null;
      const linkXml = dadosWebhook.xml || null;
      const mensagemErro = dadosWebhook.mensagemRetorno || null;

      await db.collection("notas_emitidas").doc(idIntegracao).set({
        status: statusNovo,
        linkPdf: linkPdf,
        linkXml: linkXml,
        erroRejeicao: mensagemErro,
        dataAtualizacaoWebhook: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log(`✅ Firebase Atualizado! Nota [${idIntegracao}] mudou para: ${statusNovo}`);

      res.status(200).send("Webhook recebido e processado!");

    } catch (error) {
      console.error("❌ Erro interno no Webhook:", error);
      res.status(500).send("Erro interno ao processar o Webhook.");
    }
  });
});


// --- FUNÇÃO 6: CANCELAR A NOTA ---
exports.cancelarNotaPlugnotas = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { plugnotasId, idIntegracao, motivo } = req.body;
      
      if (!plugnotasId) return res.status(400).json({ sucesso: false, erro: "ID da PlugNotas ausente. Sincronize a nota primeiro." });

      console.log(`🗑️ Cancelando nota PlugNotas ID: ${plugnotasId}`);

      const response = await axios.post(
        `${BASE_URL}/nfse/cancelar/${plugnotasId}`,
        { codigo: "1", motivo: motivo || "Cancelamento solicitado pelo emissor" },
        { headers: { "X-API-KEY": PLUGNOTAS_API_KEY, "Content-Type": "application/json" } }
      );

      await db.collection("notas_emitidas").doc(idIntegracao).set({
        status: "CANCELAMENTO_SOLICITADO",
        dataCancelamento: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      res.status(200).json({ sucesso: true, mensagem: "Cancelamento em processamento!" });
    } catch (error) {
      console.error("❌ Erro ao cancelar:", error.response?.data || error.message);
      res.status(500).json({ sucesso: false, erro: error.response?.data || error.message });
    }
  });
});