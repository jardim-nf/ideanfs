import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Importações do Firestore:
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; 

export default function CadastroProdutos() {
  const navigate = useNavigate();
  const [produtosSalvos, setProdutosSalvos] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const [formData, setFormData] = useState({
    nomeServico: '',
    valorPadrao: '',
    descricao: '',
    codigoServico: '',
    aliquotaIss: ''
  });

  // 1. BUSCAR PRODUTOS/SERVIÇOS DO BANCO
  const buscarProdutosDoBanco = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "produtos"));
      const lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setProdutosSalvos(lista);
    } catch (error) {
      console.error("Erro ao buscar produtos: ", error);
    }
  };

  useEffect(() => {
    buscarProdutosDoBanco();
  }, []);

  // 2. MÁSCARA DE MOEDA E ATUALIZAÇÃO DOS CAMPOS
  const handleChange = (e) => {
    let { name, value } = e.target;

    // Máscara de dinheiro (R$) para o Valor Padrão
    if (name === 'valorPadrao') {
      let numerico = value.replace(/\D/g, '');
      let formatado = (Number(numerico) / 100).toFixed(2);
      if (formatado === '0.00') {
        value = '';
      } else {
        value = formatado.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. SALVAR NO FIRESTORE
  const handleSalvarProduto = async (e) => {
    e.preventDefault();
    setCarregando(true);
    
    try {
      // Salva na coleção "produtos"
      await addDoc(collection(db, "produtos"), formData);
      
      alert('Serviço salvo com sucesso!');
      
      // Limpa o formulário e atualiza a tabela
      setFormData({
        nomeServico: '', valorPadrao: '', descricao: '', codigoServico: '', aliquotaIss: ''
      });
      buscarProdutosDoBanco(); 

    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert('Erro ao salvar o serviço.');
    } finally {
      setCarregando(false);
    }
  };

  // 4. EXCLUIR DO FIRESTORE
  const handleRemoverProduto = async (id) => {
    if(window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await deleteDoc(doc(db, "produtos", id));
        buscarProdutosDoBanco(); // Atualiza a tabela
      } catch (error) {
        console.error("Erro ao deletar:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* FORMULÁRIO DE CADASTRO */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
          <button onClick={() => navigate('/dashboard')} className="text-blue-600 font-bold mb-6 hover:text-blue-800 transition-colors">
            ← Voltar para o Menu
          </button>
          
          <h2 className="text-2xl font-extrabold text-gray-800 mb-6 border-l-4 border-blue-600 pl-3">
            Novo Serviço / Produto
          </h2>
          
          <form onSubmit={handleSalvarProduto} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Serviço</label>
                <input type="text" name="nomeServico" value={formData.nomeServico} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Desenvolvimento Web" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-1">Valor Padrão (R$)</label>
                <input type="text" name="valorPadrao" value={formData.valorPadrao} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0,00" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-bold text-gray-700 mb-1">Descrição Detalhada Padrão</label>
                <textarea rows="3" name="descricao" value={formData.descricao} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Essa descrição sairá na nota fiscal..."></textarea>
              </div>
            </div>

            <div className="bg-gray-50 p-5 border border-gray-200 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Cód. Serviço LC 116 (Ex: 01.01)</label>
                <input type="text" name="codigoServico" value={formData.codigoServico} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="01.01" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Alíquota ISS (%)</label>
                <input type="number" step="0.01" name="aliquotaIss" value={formData.aliquotaIss} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="3.00" />
              </div>
            </div>

            <button type="submit" disabled={carregando} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg mt-4 hover:bg-blue-700 shadow-md transition-colors w-full md:w-auto">
              {carregando ? 'Salvando no Banco...' : 'Salvar Serviço'}
            </button>
          </form>
        </div>

        {/* LISTA DE PRODUTOS CADASTRADOS */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
          <h2 className="text-xl font-extrabold text-gray-800 mb-6 border-l-4 border-green-500 pl-3">
            Serviços Cadastrados ({produtosSalvos.length})
          </h2>

          {produtosSalvos.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
              <p>Nenhum serviço cadastrado no banco de dados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-sm">
                    <th className="p-4 border-b">Nome do Serviço</th>
                    <th className="p-4 border-b">Código (LC 116)</th>
                    <th className="p-4 border-b">ISS (%)</th>
                    <th className="p-4 border-b">Valor Padrão</th>
                    <th className="p-4 border-b text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosSalvos.map((produto) => (
                    <tr key={produto.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-800">{produto.nomeServico}</td>
                      <td className="p-4 text-gray-600">{produto.codigoServico}</td>
                      <td className="p-4 text-gray-600">{produto.aliquotaIss}%</td>
                      <td className="p-4 text-green-600 font-semibold">R$ {produto.valorPadrao}</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleRemoverProduto(produto.id)}
                          className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 py-1 px-3 rounded"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}