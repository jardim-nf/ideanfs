import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Importações do Firestore:
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; 

export default function CadastroClientes() {
  const navigate = useNavigate();
  const [clientesSalvos, setClientesSalvos] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const [formData, setFormData] = useState({
    cpfCnpj: '', razaoSocial: '', email: '', inscricaoMunicipal: '',
    cep: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: ''
  });

  // 1. BUSCAR CLIENTES DO BANCO DE DADOS QUANDO A TELA ABRE
  const buscarClientesDoBanco = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "clientes"));
      const lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() }); // Pega a ID única do banco e os dados
      });
      setClientesSalvos(lista);
    } catch (error) {
      console.error("Erro ao buscar clientes: ", error);
    }
  };

  useEffect(() => {
    buscarClientesDoBanco();
  }, []);

  // 2. MÁSCARAS E BUSCA DE CEP
  const handleChange = async (e) => {
    let { name, value } = e.target;
    if (name === 'cpfCnpj') {
      value = value.replace(/\D/g, '');
      if (value.length <= 11) value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
      else value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5').slice(0, 18);
    }
    if (name === 'cep') {
      value = value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
      const cepSujo = value.replace(/\D/g, '');
      if (cepSujo.length === 8) {
        try {
          const response = await axios.get(`https://viacep.com.br/ws/${cepSujo}/json/`);
          if (!response.data.erro) {
            setFormData(prev => ({
              ...prev, cep: value, logradouro: response.data.logradouro,
              bairro: response.data.bairro, cidade: response.data.localidade, uf: response.data.uf
            }));
            return;
          }
        } catch (error) {}
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. SALVAR CLIENTE DE VERDADE NO FIREBASE FIRESTORE
  const handleSalvarCliente = async (e) => {
    e.preventDefault();
    setCarregando(true);
    
    try {
      // Salva na coleção "clientes"
      await addDoc(collection(db, "clientes"), formData);
      
      alert('Cliente salvo com sucesso no banco de dados!');
      
      // Limpa o formulário e atualiza a tabela embaixo
      setFormData({
        cpfCnpj: '', razaoSocial: '', email: '', inscricaoMunicipal: '',
        cep: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: ''
      });
      buscarClientesDoBanco(); 

    } catch (error) {
      console.error("Erro ao salvar no banco:", error);
      alert('Erro ao salvar cliente.');
    } finally {
      setCarregando(false);
    }
  };

  // 4. EXCLUIR CLIENTE DO BANCO
  const handleRemoverCliente = async (id) => {
    if(window.confirm('Tem certeza que deseja excluir este cliente para sempre?')) {
      try {
        await deleteDoc(doc(db, "clientes", id));
        buscarClientesDoBanco(); // Atualiza a tabela
      } catch (error) {
        console.error("Erro ao deletar:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="bg-white rounded-xl shadow border p-8">
          <button onClick={() => navigate('/dashboard')} className="text-blue-600 font-bold mb-6 hover:text-blue-800">← Voltar para o Menu</button>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-6 border-l-4 border-blue-600 pl-3">Cadastrar Novo Cliente</h2>
          
          <form onSubmit={handleSalvarCliente} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold text-gray-700 mb-1">CPF / CNPJ</label><input type="text" name="cpfCnpj" value={formData.cpfCnpj} onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-2" placeholder="000.000.000-00" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Razão Social / Nome</label><input type="text" name="razaoSocial" value={formData.razaoSocial} onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-2" placeholder="Nome do seu cliente" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">E-mail Financeiro</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-2" placeholder="email@cliente.com" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Insc. Municipal</label><input type="text" name="inscricaoMunicipal" value={formData.inscricaoMunicipal} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2" placeholder="Opcional" /></div>
            </div>

            <div className="p-4 bg-blue-50/50 border rounded-lg">
              <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase">Endereço do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1"><label className="block text-xs font-bold text-gray-600 mb-1">CEP</label><input type="text" name="cep" value={formData.cep} onChange={handleChange} required className="w-full p-2 border rounded" placeholder="00000-000" /></div>
                <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-600 mb-1">Logradouro</label><input type="text" name="logradouro" value={formData.logradouro} onChange={handleChange} required className="w-full p-2 border rounded" /></div>
                <div className="md:col-span-1"><label className="block text-xs font-bold text-gray-600 mb-1">Número</label><input type="text" name="numero" value={formData.numero} onChange={handleChange} required className="w-full p-2 border rounded" /></div>
                <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-600 mb-1">Bairro</label><input type="text" name="bairro" value={formData.bairro} onChange={handleChange} required className="w-full p-2 border rounded" /></div>
                <div className="md:col-span-1"><label className="block text-xs font-bold text-gray-600 mb-1">Cidade</label><input type="text" name="cidade" value={formData.cidade} onChange={handleChange} required className="w-full p-2 border rounded" /></div>
                <div className="md:col-span-1"><label className="block text-xs font-bold text-gray-600 mb-1">UF</label><input type="text" name="uf" value={formData.uf} onChange={handleChange} required maxLength="2" className="w-full p-2 border rounded uppercase" /></div>
              </div>
            </div>

            <button type="submit" disabled={carregando} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg mt-4 hover:bg-blue-700 w-full md:w-auto">
              {carregando ? 'Salvando no Banco...' : 'Salvar Cliente'}
            </button>
          </form>
        </div>

        {/* TABELA CONECTADA NO BANCO */}
        <div className="bg-white rounded-xl shadow border p-8">
          <h2 className="text-xl font-extrabold text-gray-800 mb-6 border-l-4 border-green-500 pl-3">
            Clientes Cadastrados ({clientesSalvos.length})
          </h2>

          {clientesSalvos.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed text-gray-500">
              <p>Nenhum cliente cadastrado no banco de dados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-sm">
                    <th className="p-4 border-b">Razão Social</th>
                    <th className="p-4 border-b">CNPJ/CPF</th>
                    <th className="p-4 border-b">E-mail</th>
                    <th className="p-4 border-b">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesSalvos.map((cliente) => (
                    <tr key={cliente.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-bold text-gray-800">{cliente.razaoSocial}</td>
                      <td className="p-4 text-gray-600">{cliente.cpfCnpj}</td>
                      <td className="p-4 text-gray-600">{cliente.email}</td>
                      <td className="p-4">
                        <button onClick={() => handleRemoverCliente(cliente.id)} className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 py-1 px-3 rounded">
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