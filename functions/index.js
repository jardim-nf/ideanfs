const functions = require("firebase-functions");
const axios = require("axios");
const cors = require("cors")({ origin: true });

// ATENÇÃO: Coloque sua chave do Sandbox do Plugnotas aqui
const PLUGNOTAS_API_KEY = "7a1c5954ca39092ba5fd7b390755c5fa";

exports.emitirNotaPlugnotas = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Garante que a requisição é um POST
    if (req.method !== 'POST') {
      return res.status(405).send('Método não permitido. Use POST.');
    }

    try {
      // Recebemos os dados limpos do React
      const dadosFront = req.body;

      // Montamos o JSON exato que a documentação do Plugnotas exige
      const payloadNFSe = [
        {
          "idIntegracao": `ideianfe-${Date.now()}`, 
          
          "prestador": {
            // CNPJ gerador de teste para o Sandbox
            "cnpj": "01001001000113" 
          },
          
          "tomador": {
            "cpfCnpj": dadosFront.cpfCnpjTomador,
            "razaoSocial": dadosFront.razaoSocialTomador,
            "email": dadosFront.emailTomador,
            // Endereço genérico obrigatório para o teste passar
            "endereco": {
              "bairro": "Centro",
              "cep": "87020025",
              "codigoCidade": "4115200", 
              "estado": "PR",
              "logradouro": "Rua Teste",
              "numero": "123",
              "tipoLogradouro": "Rua"
            }
          },
          
          "servico": {
            "codigo": dadosFront.codigoServico,
            "discriminacao": dadosFront.descricaoServico,
            "cnae": "6204000",
            "iss": {
              "aliquota": Number(dadosFront.aliquotaIss),
              "retido": dadosFront.reterIss
            },
            "valor": {
              "servico": dadosFront.valorServico
            }
          }
        }
      ];

      // Dispara pra API do Plugnotas (Sandbox)
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

      // Devolve o sucesso para o front
      res.status(200).json({ sucesso: true, dados: response.data });

    } catch (error) {
      console.error("Erro ao emitir:", error.response ? error.response.data : error.message);
      res.status(500).json({ sucesso: false, erro: error.response ? error.response.data : error.message });
    }
  });
});