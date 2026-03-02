const functions = require("firebase-functions");
const axios = require("axios");
const cors = require("cors")({ origin: true });

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

      // JSON Completo (Modo Enterprise)
// Montamos o JSON exato que a documentação do Plugnotas exige no Modo Completo
      const payloadNFSe = [
        {
          "idIntegracao": `ideianfe-${Date.now()}`, 
          "prestador": {
            // CORREÇÃO 1: A chave correta é cpfCnpj (e não cnpj)
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
              // CORREÇÃO 2: Transformando em objetos e corrigindo "ir" para "irrf"
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