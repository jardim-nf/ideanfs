// --- FUNÇÃO PARA CADASTRAR A EMPRESA DE TESTE NO PLUGNOTAS ---
exports.cadastrarEmpresaTeste = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Dados da nossa empresa fictícia (O CNPJ 01.001.001/0001-13)
      const payloadEmpresa = {
        "cpfCnpj": "01001001000113",
        "razaoSocial": "EMPRESA DE TESTE IDEIANFE LTDA",
        "nomeFantasia": "IDEIANFE TESTES",
        "inscricaoMunicipal": "12345",
        "endereco": {
          "bairro": "Centro",
          "cep": "87020025",
          "codigoCidade": "4115200", // Código do IBGE (Maringá-PR funciona bem no Sandbox)
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
            "x-api-key": PLUGNOTAS_API_KEY, // Ele vai usar a mesma chave que já configuramos
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