const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });

// Inicializa o Admin do Firebase (necessário para salvar dados no banco do Firebase depois do cadastro)
admin.initializeApp();
const db = admin.firestore();

// A sua chave do Sandbox do Plugnotas
const PLUGNOTAS_API_KEY = "2da392a6-79d2-4304-a8b7-959572c7e44d";

// --- FUNÇÃO 1: EMITIR NOTA COMPLETA ---
exports.emitirNotaPlugnotas = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Método não permitido. Use POST.');
    }

    try {
      const dadosFront = req.body;
      const payloadNFSe = [
        {
          "idIntegracao": `ideianfe-${Date.now()}`, 
          "prestador": {
            "cpfCnpj": "01001001000113" 
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
              "codigoCidade": "4115200", 
              "estado": dadosFront.ufTomador
            }
          },
          "servico": {
            "codigo": dadosFront.codigoServico,
            "discriminacao": dadosFront.descricaoServico,
            "cnae": "6204000",
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

      const response = await axios.post(
        "https://api.sandbox.plugnotas.com.br/nfse",
        payloadNFSe,
        {
          headers: {
            "x-api-key": PLUGNOTAS_API_KEY,
            "Content-Type": "application/json"
          }
        }
      );

      res.status(200).json({ sucesso: true, dados: response.data });
    } catch (error) {
      console.error("Erro ao emitir:", error.response ? error.response.data : error.message);
      res.status(500).json({ sucesso: false, erro: error.response ? error.response.data : error.message });
    }
  });
});

// --- FUNÇÃO 2: CADASTRAR EMPRESA DE TESTE ---
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
            "x-api-key": PLUGNOTAS_API_KEY,
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

// --- FUNÇÃO 3: NOVA! CADASTRAR A EMPRESA REAL DO SEU CLIENTE ---
exports.configurarMinhaEmpresa = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Use POST.');
    }

    try {
      // 1. Pega os dados que o React mandou da tela "Configuracoes.jsx"
      const dadosEmpresa = req.body.empresa;
      const tipoCertificado = req.body.tipoCertificado; // 'mei' ou 'proprio'

      // 2. Define o certificado (Procuração MEI vs Certificado Próprio)
      let idCertificadoPlugnotas = "";
      if (tipoCertificado === 'mei') {
        // Se for MEI, força o uso do SEU certificado Master no Plugnotas
        idCertificadoPlugnotas = "ID_DO_SEU_CERTIFICADO_A1_NO_PLUGNOTAS"; // Substituiremos pelo ID real depois
      } else {
        // Futuramente: Código para fazer upload do PFX e pegar ID novo.
        idCertificadoPlugnotas = "ID_TEMPORARIO_ATE_CRIAR_UPLOAD";
      }

      // 3. Monta o JSON oficial que a API do Plugnotas espera (Rota /empresa POST)
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
            codigoCidade: "4115200", // Fixo por enquanto, precisa vir da API do IBGE depois
            descricaoCidade: dadosEmpresa.cidade,
            estado: dadosEmpresa.uf,
            codigoPais: "1058", // Brasil
            descricaoPais: "Brasil"
          },
          nfse: {
            ativo: true,
            tipoContrato: 0
          }
        }
      ];

      // 4. Manda pro Plugnotas!
      const response = await axios.post(
        "https://api.sandbox.plugnotas.com.br/empresa", // ATENÇÃO: A rota correta para cadastro é /empresa, e não /empresas
        payloadPlugnotas,
        {
          headers: {
            "x-api-key": PLUGNOTAS_API_KEY,
            "Content-Type": "application/json"
          }
        }
      );

      // 5. Salva no Firebase Firestore para você ter o controle de quem já se configurou
      const cnpjLimpo = dadosEmpresa.cnpj.replace(/\D/g, '');
      await db.collection("empresas_configuradas").doc(cnpjLimpo).set({
        ...dadosEmpresa,
        tipoCertificado: tipoCertificado,
        idCertificadoUsado: idCertificadoPlugnotas,
        statusPlugnotas: "Ativo Sandbox",
        dataCadastro: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(200).json({ sucesso: true, mensagem: "Configurada com sucesso!", dadosPlugnotas: response.data });
    } catch (error) {
      console.error("Erro na API Empresa:", error.response ? error.response.data : error.message);
      res.status(500).json({ sucesso: false, erro: error.response ? error.response.data : error.message });
    }
  });
});