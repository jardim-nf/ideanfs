import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; 

export default function CadastroClientes() {
  const navigate = useNavigate();
  const [clientesSalvos, setClientesSalvos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const [formData, setFormData] = useState({
    cpfCnpj: '', razaoSocial: '', email: '', inscricaoMunicipal: '',
    cep: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: ''
  });

  // Formatações
  const formatCpfCnpj = (value) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 11) {
      return numericValue.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4').slice(0, 14);
    }
    return numericValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5').slice(0, 18);
  };

  const formatCep = (value) => {
    return value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
  };

  // Buscar clientes
  const buscarClientesDoBanco = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "clientes"));
      const lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setClientesSalvos(lista);
    } catch (error) {
      console.error("Erro ao buscar clientes: ", error);
    }
  };

  useEffect(() => {
    buscarClientesDoBanco();
  }, []);

  // Buscar endereço por CEP
  const buscarEnderecoPorCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;
    
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      if (!response.data.erro) {
        setFormData(prev => ({
          ...prev,
          logradouro: response.data.logradouro,
          bairro: response.data.bairro,
          cidade: response.data.localidade,
          uf: response.data.uf
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handleChange = async (e) => {
    let { name, value } = e.target;
    
    if (name === 'cpfCnpj') {
      value = formatCpfCnpj(value);
    }
    if (name === 'cep') {
      value = formatCep(value);
      if (value.replace(/\D/g, '').length === 8) {
        await buscarEnderecoPorCEP(value);
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Salvar cliente
  const handleSalvarCliente = async (e) => {
    e.preventDefault();
    setCarregando(true);
    
    try {
      await addDoc(collection(db, "clientes"), formData);
      
      // Toast de sucesso
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold z-50 animate-slide-in';
      toast.textContent = '✅ Cliente salvo com sucesso!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
      setFormData({
        cpfCnpj: '', razaoSocial: '', email: '', inscricaoMunicipal: '',
        cep: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: ''
      });
      buscarClientesDoBanco();

    } catch (error) {
      alert('Erro ao salvar cliente.');
    } finally {
      setCarregando(false);
    }
  };

  // Excluir cliente
  const handleRemoverCliente = async (id) => {
    setClienteSelecionado(id);
    setModalAberto(true);
  };

  const confirmarExclusao = async () => {
    try {
      await deleteDoc(doc(db, "clientes", clienteSelecionado));
      buscarClientesDoBanco();
      setModalAberto(false);
      
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold z-50 animate-slide-in';
      toast.textContent = '🗑️ Cliente removido!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  // Filtrar clientes
  const clientesFiltrados = clientesSalvos.filter(cliente => 
    cliente.razaoSocial?.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.cpfCnpj?.includes(busca) ||
    cliente.email?.toLowerCase().includes(busca.toLowerCase())
  );

  // Componente de Input
  const InputForm = ({ label, nome, val, placeholder, required = false, cols = "col-span-1" }) => (
    <div className={`flex flex-col ${cols}`}>
      <label className="text-xs font-black text-idea-dark uppercase tracking-widest mb-1.5 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        type="text" 
        name={nome} 
        value={val} 
        onChange={handleChange} 
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 text-idea-dark font-bold text-sm outline-none focus:border-idea-accent hover:border-gray-300 transition-all"
      />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20">
      
      {/* Modal de Confirmação */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto">
              ⚠️
            </div>
            <h3 className="text-2xl font-black text-idea-dark text-center mb-2">Confirmar Exclusão</h3>
            <p className="text-gray-600 text-center mb-8">
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setModalAberto(false)}
                className="flex-1 py-4 rounded-xl font-bold border-2 border-gray-200 hover:border-gray-300 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarExclusao}
                className="flex-1 py-4 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-all"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-10">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="text-idea-accent font-bold mb-6 hover:text-idea-base transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para o Dashboard
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-idea-dark tracking-tighter leading-tight">
              👥 Clientes
            </h1>
            <p className="text-gray-500 font-medium text-lg mt-2">
              Gerencie seus clientes e tomadores de serviço
            </p>
          </div>
          
          {/* Card de Estatística */}
          <div className="bg-gradient-to-br from-idea-accent to-idea-base text-white p-6 rounded-2xl shadow-xl">
            <p className="text-sm font-black uppercase tracking-wider opacity-80">Total</p>
            <p className="text-4xl font-black">{clientesSalvos.length}</p>
            <p className="text-xs font-bold mt-1 opacity-60">clientes cadastrados</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        
        {/* Formulário de Cadastro - 2 colunas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-lg border-2 border-idea-accent/20 sticky top-6">
            
            {/* Header do Form */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-idea-accent text-white flex items-center justify-center text-xl font-black">
                  +
                </div>
                <div>
                  <h3 className="text-2xl font-black text-idea-dark">Novo Cliente</h3>
                  <p className="text-gray-500 text-sm font-medium">Preencha os dados para cadastrar</p>
                </div>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSalvarCliente} className="p-6">
              <div className="space-y-6">
                {/* Dados Principais */}
                <div>
                  <h4 className="text-xs font-black text-idea-dark uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-idea-accent rounded-full"></span>
                    Informações Básicas
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <InputForm label="CPF / CNPJ" nome="cpfCnpj" val={formData.cpfCnpj} required cols="col-span-2" />
                    <InputForm label="Razão Social" nome="razaoSocial" val={formData.razaoSocial} required cols="col-span-2" />
                    <InputForm label="E-mail" nome="email" val={formData.email} required cols="col-span-2" />
                    <InputForm label="Inscrição Municipal" nome="inscricaoMunicipal" val={formData.inscricaoMunicipal} cols="col-span-2" />
                  </div>
                </div>

                {/* Endereço */}
                <div>
                  <h4 className="text-xs font-black text-idea-dark uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-idea-accent rounded-full"></span>
                    Endereço
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <InputForm label="CEP" nome="cep" val={formData.cep} required cols="col-span-1" />
                    <InputForm label="Logradouro" nome="logradouro" val={formData.logradouro} required cols="col-span-2" />
                    <InputForm label="Número" nome="numero" val={formData.numero} required cols="col-span-1" />
                    <InputForm label="Bairro" nome="bairro" val={formData.bairro} required cols="col-span-1" />
                    <InputForm label="Cidade" nome="cidade" val={formData.cidade} required cols="col-span-2" />
                    <InputForm label="UF" nome="uf" val={formData.uf} required max="2" cols="col-span-1" />
                  </div>
                </div>

                {/* Botão Salvar */}
                <button 
                  type="submit" 
                  disabled={carregando} 
                  className="w-full bg-gradient-to-r from-idea-accent to-idea-base text-white font-black py-4 px-6 rounded-xl hover:shadow-2xl hover:scale-105 transition-all transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg mt-8"
                >
                  {carregando ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    '💾 Salvar Cliente'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Lista de Clientes - 3 colunas */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl shadow-lg border-2 border-gray-100">
            
            {/* Header da Lista */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-idea-light text-idea-dark flex items-center justify-center text-xl font-black">
                    📋
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-idea-dark">Clientes Cadastrados</h3>
                    <p className="text-gray-500 text-sm font-medium">{clientesFiltrados.length} registros encontrados</p>
                  </div>
                </div>

                {/* Busca */}
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    placeholder="Buscar clientes..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-idea-accent outline-none font-medium"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Lista */}
            <div className="p-6">
              {clientesFiltrados.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="text-6xl mb-4">🏢</div>
                  <p className="text-gray-500 font-bold text-lg">Nenhum cliente cadastrado</p>
                  <p className="text-gray-400 text-sm mt-2">Comece cadastrando seu primeiro cliente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientesFiltrados.map((cliente) => (
                    <div 
                      key={cliente.id} 
                      className="group bg-gray-50 hover:bg-white rounded-xl p-4 border-2 border-transparent hover:border-idea-accent/20 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-black text-idea-dark text-lg">{cliente.razaoSocial}</h4>
                            <span className="text-xs font-bold px-2 py-1 bg-idea-light text-idea-dark rounded-full">
                              {cliente.cpfCnpj}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="text-gray-600 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {cliente.email}
                            </span>
                            <span className="text-gray-600 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {cliente.cidade}/{cliente.uf}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoverCliente(cliente.id)}
                          className="opacity-0 group-hover:opacity-100 transition-all bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-3 rounded-xl font-bold text-sm"
                          title="Excluir cliente"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}