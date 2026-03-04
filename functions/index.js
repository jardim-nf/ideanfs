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

// --- FUNÇÃO 1: EMITIR NOTA COMPLETA E SALVAR NO BANCO ---
exports.emitirNotaPlugnotas = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Método não permitido. Use POST.');
    }

    try {
      const dadosFront = req.body;
      const idIntegracao = `ideianfe-${Date.now()}`;
      
      const payloadNFSe = [
        {
          "idIntegracao": idIntegracao, 
          "prestador": {
            "cpfCnpj": "52073286000139" // SEU CNPJ REAL (Fortaleza-CE)
          },
          "tomador": {
            "cpfCnpj": dadosFront.cpfCnpjTomador,
            "razaoSocial": dadosFront.razaoSocialTomador,
            "email": dadosFront.emailTomador,
            "inscricaoMunicipal": dadosFront.inscricaoMunicipalTomador || null,
            "endereco": {
              "cep": dadosFront.cepTomador,
              "logradouro": dadosFront.logradouroTomador,
              "numero": dadosFront.numeroTomador,
              "bairro": dadosFront.bairroTomador,
              "codigoCidade": "2304400", // CÓDIGO IBGE DE FORTALEZA-CE
              "estado": dadosFront.ufTomador
            }
          },
          "servico": {
            "codigo": dadosFront.codigoServico, 
            "discriminacao": dadosFront.descricaoServico,
            "iss": {
              "aliquota": dadosFront.aliquotaIss,
              "retido": dadosFront.reterIss
            },
            "valor": {
              "servico": dadosFront.valorServico,
              "deducoes": dadosFront.deducoes,
              "descontoCondicionado": dadosFront.descontoCondicionado,
              "descontoIncondicionado": dadosFront.descontoIncondicionado
            },
            "retencao": {
              "pis": { "valor": dadosFront.pis },
              "cofins": { "valor": dadosFront.cofins },
              "inss": { "valor": dadosFront.inss },
              "irrf": { "valor": dadosFront.ir }, 
              "csll": { "valor": dadosFront.csll }
            }
          }
        }
      ];

      // 1. Envia para o PlugNotas
      const response = await axios.post(
        "https://api.plugnotas.com.br/nfse",
        payloadNFSe,
        {
          headers: {
            "x-api-key": PLUGNOTAS_API_KEY,
            "Content-Type": "application/json"
          }
        }
      );

      // 2. Salva o Histórico no Firestore (Agora sem erro de undefined!)
      await db.collection("notas_emitidas").doc(idIntegracao).set({
        dadosFormulario: dadosFront,
        protocoloPlugnotas: response.data.documents && response.data.documents.length > 0 ? response.data.documents[0].protocol : (response.data.protocol || ""),
        status: "EM PROCESSAMENTO",
        dataEmissao: admin.firestore.FieldValue.serverTimestamp()
      });

      // 3. Devolve sucesso pro site (React)
      res.status(200).json({ sucesso: true, dados: response.data, idNota: idIntegracao });
      
    } catch (error) {
      console.error("Erro ao emitir:", error.response ? error.response.data : error.message);
      res.status(500).json({ sucesso: false, erro: error.response ? error.response.data : error.message });
    }
  });
});

// --- FUNÇÃO 2: CADASTRAR EMPRESA DE TESTE (SANDBOX) ---
exports.cadastrarEmpresaTeste = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const payloadEmpresa = {
        "cpfCnpj": "01001001000113",
        "razaoSocial": "EMPRESA DE TESTE IDEIANFE LTDA",
        "nomeFantasia": "IDEIANFE TESTES",
        "inscricaoMunicipal": "12345",
        "endereco": {
          "bairro": "Centro",
          "cep": "87020025",
          "codigoCidade": "4115200",
          "estado": "PR",
          "logradouro": "Rua de Teste",
          "numero": "123",
          "tipoLogradouro": "Rua"
        }
      };

      const response = await axios.post(
        "https://api.sandbox.plugnotas.com.br/empresas",
        payloadEmpresa,
        {
          headers: {
            "x-api-key": "2da392a6-79d2-4304-a8b7-959572c7e44d",
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
        "https://api.plugnotas.com.br/empresa", 
        payloadPlugnotas,
        {
          headers: {
            "x-api-key": PLUGNOTAS_API_KEY,
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

      res.status(200).json({ sucesso: true, mensagem: "Configurada com sucesso em Produção!", dadosPlugnotas: response.data });
    } catch (error) {
      console.error("Erro na API Empresa:", error.response ? error.response.data : error.message);
      res.status(500).json({ sucesso: false, erro: error.response ? error.response.data : error.message });
    }
  });
});