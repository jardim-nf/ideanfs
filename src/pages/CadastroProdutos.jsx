import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; 
import BuscaServico from '../components/BuscaServico';

export default function CadastroProdutos() {
  const navigate = useNavigate();
  const [produtosSalvos, setProdutosSalvos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  const [formData, setFormData] = useState({
    nomeServico: '',
    valorPadrao: '',
    descricao: '',
    codigoServico: '',
    aliquotaIss: ''
  });

  // Formatação de moeda
  const formatCurrency = (value) => {
    const numericValue = value.replace(/\D/g, '');
    const number = (Number(numericValue) / 100).toFixed(2);
    if (number === '0.00') return '';
    return number.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Buscar produtos do banco
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

  // Handle changes com máscara
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'valorPadrao') {
      value = formatCurrency(value);
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Salvar no Firestore
  const handleSalvarProduto = async (e) => {
    e.preventDefault();
    setCarregando(true);
    
    try {
      await addDoc(collection(db, "produtos"), formData);
      
      // Toast de sucesso
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold z-50 animate-slide-in';
      toast.textContent = '✅ Serviço salvo com sucesso!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
      setFormData({
        nomeServico: '', valorPadrao: '', descricao: '', codigoServico: '', aliquotaIss: ''
      });
      buscarProdutosDoBanco();

    } catch (error) {
      alert('Erro ao salvar o serviço.');
    } finally {
      setCarregando(false);
    }
  };

  // Excluir do Firestore com modal
  const handleRemoverProduto = async (id) => {
    setProdutoSelecionado(id);
    setModalAberto(true);
  };

  const confirmarExclusao = async () => {
    try {
      await deleteDoc(doc(db, "produtos", produtoSelecionado));
      buscarProdutosDoBanco();
      setModalAberto(false);
      
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold z-50 animate-slide-in';
      toast.textContent = '🗑️ Serviço removido!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  // Filtrar produtos
  const produtosFiltrados = produtosSalvos.filter(produto => 
    produto.nomeServico?.toLowerCase().includes(busca.toLowerCase()) ||
    produto.codigoServico?.includes(busca) ||
    produto.descricao?.toLowerCase().includes(busca.toLowerCase())
  );

  // Componente de Input
  const InputForm = ({ label, nome, val, placeholder, required = false, cols = "col-span-1", type = "text" }) => (
    <div className={`flex flex-col ${cols}`}>
      <label className="text-xs font-black text-idea-dark uppercase tracking-widest mb-1.5 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea 
          name={nome} 
          value={val} 
          onChange={handleChange} 
          placeholder={placeholder}
          required={required}
          rows="4"
          className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 text-idea-dark font-bold text-sm outline-none focus:border-idea-accent hover:border-gray-300 transition-all resize-none"
        />
      ) : (
        <input 
          type="text" 
          name={nome} 
          value={val} 
          onChange={handleChange} 
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 text-idea-dark font-bold text-sm outline-none focus:border-idea-accent hover:border-gray-300 transition-all"
        />
      )}
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
              Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.
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
              📦 Serviços
            </h1>
            <p className="text-gray-500 font-medium text-lg mt-2">
              Gerencie seus serviços e produtos para emissão de NFS-e
            </p>
          </div>
          
          {/* Card de Estatística */}
          <div className="bg-gradient-to-br from-idea-accent to-idea-base text-white p-6 rounded-2xl shadow-xl">
            <p className="text-sm font-black uppercase tracking-wider opacity-80">Total</p>
            <p className="text-4xl font-black">{produtosSalvos.length}</p>
            <p className="text-xs font-bold mt-1 opacity-60">serviços cadastrados</p>
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
                  <h3 className="text-2xl font-black text-idea-dark">Novo Serviço</h3>
                  <p className="text-gray-500 text-sm font-medium">Cadastre um serviço para usar nas notas</p>
                </div>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSalvarProduto} className="p-6">
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div>
                  <h4 className="text-xs font-black text-idea-dark uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-idea-accent rounded-full"></span>
                    Dados do Serviço
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <InputForm 
                      label="Nome do Serviço" 
                      nome="nomeServico" 
                      val={formData.nomeServico} 
                      required 
                      cols="col-span-2"
                      placeholder="Ex: Desenvolvimento de Software"
                    />
                    
                    <InputForm 
                      label="Valor Padrão (R$)" 
                      nome="valorPadrao" 
                      val={formData.valorPadrao} 
                      required 
                      cols="col-span-1"
                      placeholder="0,00"
                    />
                    
                    <InputForm 
                      label="Alíquota ISS (%)" 
                      nome="aliquotaIss" 
                      val={formData.aliquotaIss} 
                      required 
                      cols="col-span-1"
                      placeholder="3.00"
                    />
                  </div>
                </div>

                {/* Código do Serviço */}
                <div>
                  <h4 className="text-xs font-black text-idea-dark uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-idea-accent rounded-full"></span>
                    Classificação Fiscal
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-black text-idea-dark uppercase tracking-widest mb-1.5 ml-1">
                        Código LC 116 <span className="text-red-500">*</span>
                      </label>
                      <BuscaServico 
                        valor={formData.codigoServico} 
                        aoSelecionar={(codigo) => setFormData(prev => ({ ...prev, codigoServico: codigo }))} 
                      />
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <h4 className="text-xs font-black text-idea-dark uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-idea-accent rounded-full"></span>
                    Descrição Padrão
                  </h4>
                  <InputForm 
                    label="Descrição Detalhada" 
                    nome="descricao" 
                    val={formData.descricao} 
                    required 
                    cols="col-span-2"
                    type="textarea"
                    placeholder="Esta descrição será usada como padrão na emissão das notas fiscais..."
                  />
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
                    '💾 Salvar Serviço'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Lista de Serviços - 3 colunas */}
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
                    <h3 className="text-2xl font-black text-idea-dark">Serviços Cadastrados</h3>
                    <p className="text-gray-500 text-sm font-medium">{produtosFiltrados.length} registros encontrados</p>
                  </div>
                </div>

                {/* Busca */}
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    placeholder="Buscar serviços..."
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
              {produtosFiltrados.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-gray-500 font-bold text-lg">Nenhum serviço cadastrado</p>
                  <p className="text-gray-400 text-sm mt-2">Comece cadastrando seu primeiro serviço</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {produtosFiltrados.map((produto) => (
                    <div 
                      key={produto.id} 
                      className="group bg-gray-50 hover:bg-white rounded-xl p-4 border-2 border-transparent hover:border-idea-accent/20 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h4 className="font-black text-idea-dark text-lg">{produto.nomeServico}</h4>
                            <span className="text-xs font-bold px-2 py-1 bg-idea-light text-idea-dark rounded-full">
                              {produto.codigoServico}
                            </span>
                            <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">
                              ISS: {produto.aliquotaIss}%
                            </span>
                          </div>
                          
                          {produto.descricao && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {produto.descricao}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-idea-accent">
                              R$ {produto.valorPadrao}
                            </span>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handleRemoverProduto(produto.id)}
                          className="opacity-0 group-hover:opacity-100 transition-all bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-3 rounded-xl font-bold text-sm ml-4"
                          title="Excluir serviço"
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