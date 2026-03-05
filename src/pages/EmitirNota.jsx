import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import BuscaServico from '../components/BuscaServico';

// --- Funções de Máscara (MANTIDAS) ---
const formatCpfCnpj = (value) => {
  const numericValue = value.replace(/\D/g, '');
  if (numericValue.length <= 11) return numericValue.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4').slice(0, 14);
  return numericValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5').slice(0, 18);
};
const formatCurrency = (value) => {
  const numericValue = value.replace(/\D/g, '');
  const number = (Number(numericValue) / 100).toFixed(2);
  if (number === '0.00') return '';
  return number.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
const formatCep = (value) => value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);

export default function EmitirNota() {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const idReprocessar = searchParams.get('reprocessar'); 
  
  const [clientesSalvos, setClientesSalvos] = useState([]);
  const [produtosSalvos, setProdutosSalvos] = useState([]);
  const [activeTab, setActiveTab] = useState('cliente');

  const [formData, setFormData] = useState({
    cpfCnpjTomador: '', razaoSocialTomador: '', emailTomador: '', inscricaoMunicipalTomador: '',
    cepTomador: '', logradouroTomador: '', numeroTomador: '', bairroTomador: '', cidadeTomador: '', ufTomador: '',
    codigoCidadeTomador: '', 
    descricaoServico: '', codigoServico: '', valorServico: '', deducoes: '', descontoCondicionado: '', descontoIncondicionado: '',
    aliquotaIss: '', reterIss: false, pis: '', cofins: '', inss: '', ir: '', csll: '',
  });

  const buscarEnderecoPorCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dados = response.data;
      if (!dados.erro) {
        setFormData(prev => ({
          ...prev,
          logradouroTomador: dados.logradouro,
          bairroTomador: dados.bairro,
          cidadeTomador: dados.localidade,
          ufTomador: dados.uf,
          codigoCidadeTomador: dados.ibge 
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const clientesSnap = await getDocs(collection(db, "clientes"));
        const prodSnap = await getDocs(collection(db, "produtos"));
        setClientesSalvos(clientesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setProdutosSalvos(prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        if (idReprocessar) {
          const docRef = doc(db, "notas_emitidas", idReprocessar);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const dadosHistoricos = docSnap.data().dadosFormulario;
            setFormData(dadosHistoricos);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    carregarDadosIniciais();
  }, [idReprocessar]);

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;
    if (name === 'cpfCnpjTomador') value = formatCpfCnpj(value);
    if (name === 'cepTomador') {
      value = formatCep(value);
      if (value.replace(/\D/g, '').length === 8) buscarEnderecoPorCEP(value);
    }
    if (['valorServico', 'deducoes', 'descontoCondicionado', 'descontoIncondicionado', 'pis', 'cofins', 'inss', 'ir', 'csll'].includes(name)) {
      value = formatCurrency(value);
    }
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSelecionarClienteRapido = (cpfCnpj) => {
    const c = clientesSalvos.find(x => x.cpfCnpj === cpfCnpj);
    if (c) {
      setFormData(prev => ({
        ...prev, 
        cpfCnpjTomador: c.cpfCnpj, razaoSocialTomador: c.razaoSocial, emailTomador: c.email,
        inscricaoMunicipalTomador: c.inscricaoMunicipal || '', cepTomador: c.cep, logradouroTomador: c.logradouro,
        numeroTomador: c.numero, bairroTomador: c.bairro, cidadeTomador: c.cidade, ufTomador: c.uf,
        codigoCidadeTomador: c.codigoIBGE || prev.codigoCidadeTomador 
      }));
      setActiveTab('servico');
    }
  };

  const handleSelecionarProdutoRapido = (idProduto) => {
    const p = produtosSalvos.find(x => x.id === idProduto);
    if (p) {
      setFormData(prev => ({
        ...prev, 
        descricaoServico: p.descricao || p.nomeServico, 
        codigoServico: p.codigoServico,
        valorServico: p.valorPadrao, 
        aliquotaIss: p.aliquotaIss
      }));
      setActiveTab('valores');
    }
  };

  const handleHomologar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parseCurrency = (val) => {
        if (!val) return 0;
        return Number(String(val).replace(/\./g, '').replace(',', '.')) || 0;
      };

      const dadosLimpos = {
        ...formData,
        cpfCnpjTomador: formData.cpfCnpjTomador.replace(/\D/g, ''),
        cepTomador: formData.cepTomador.replace(/\D/g, ''),
        codigoServico: formData.codigoServico.replace(/\D/g, ''), 
        valorServico: parseCurrency(formData.valorServico),
        aliquotaIss: Number(formData.aliquotaIss) || 0
      };
      
      const urlBackend = "https://us-central1-ideanfe.cloudfunctions.net/emitirNotaPlugnotas";
      await axios.post(urlBackend, dadosLimpos);
      
      // Toast de sucesso personalizado
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold z-50 animate-slide-in';
      toast.textContent = '✅ Nota emitida com sucesso!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
      setTimeout(() => navigate('/minhas-notas'), 1500);
    } catch (error) {
      alert(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Componente de Input melhorado
  const InputForm = ({ label, nome, val, placeholder, max, cols, dark = false, icon, required = false }) => (
    <div className={`flex flex-col ${cols || 'col-span-1'}`}>
      <label className="text-xs font-black text-idea-dark uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1">
        {icon && <span className="text-idea-accent">{icon}</span>}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        type="text" 
        name={nome} 
        value={val} 
        onChange={handleChange} 
        placeholder={placeholder}
        maxLength={max}
        required={required}
        className={`px-4 py-3.5 rounded-xl border-2 transition-all outline-none font-bold text-sm
          ${dark 
            ? 'bg-idea-dark/80 border-idea-base/30 text-white placeholder:text-gray-500 focus:border-idea-accent' 
            : 'bg-white border-gray-200 text-idea-dark focus:border-idea-accent hover:border-gray-300'}`}
      />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      
      {/* HEADER COM PROGRESSO */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-idea-dark tracking-tighter leading-tight">
              {idReprocessar ? '🔄 Corrigir Nota' : '📄 Nova NFS-e'}
            </h1>
            <p className="text-gray-500 font-medium text-lg mt-2">
              {idReprocessar ? 'Revise e corrija os dados da nota' : 'Preencha os dados para emitir sua nota fiscal'}
            </p>
          </div>
          
          {/* Status do Progresso */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            {['cliente', 'servico', 'valores'].map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab 
                    ? 'bg-idea-accent text-white shadow-lg shadow-idea-accent/30' 
                    : 'text-gray-400 hover:text-idea-dark'
                }`}
              >
                {index + 1}. {tab === 'cliente' ? 'Cliente' : tab === 'servico' ? 'Serviço' : 'Valores'}
              </button>
            ))}
          </div>
        </div>

        {/* Barra de Progresso Visual */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-idea-accent to-idea-base transition-all duration-500 rounded-full"
            style={{ width: activeTab === 'cliente' ? '33%' : activeTab === 'servico' ? '66%' : '100%' }}
          />
        </div>
      </div>

      <form onSubmit={handleHomologar} className="space-y-6">
        
        {/* SEÇÃO 1: CLIENTE */}
        <div className={`bg-white rounded-3xl shadow-lg border-2 transition-all duration-500 overflow-hidden
          ${activeTab === 'cliente' ? 'border-idea-accent shadow-2xl' : 'border-gray-100 opacity-80'}`}>
          
          {/* Header da Seção */}
          <div 
            className="flex items-center justify-between p-6 cursor-pointer"
            onClick={() => setActiveTab('cliente')}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black
                ${activeTab === 'cliente' ? 'bg-idea-accent text-white' : 'bg-idea-light text-idea-dark'}`}>
                01
              </div>
              <div>
                <h3 className="text-2xl font-black text-idea-dark">Dados do Tomador</h3>
                <p className="text-gray-500 text-sm font-medium">Informações do cliente/contratante</p>
              </div>
            </div>
            
            {/* Select rápido */}
            <div className="hidden md:block">
              <select 
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleSelecionarClienteRapido(e.target.value)} 
                className="bg-idea-light/50 border-2 border-idea-accent/20 px-6 py-3 rounded-xl text-idea-dark font-bold text-sm outline-none focus:border-idea-accent transition-all min-w-[250px]"
              >
                <option value="">⚡ Carregar cliente salvo...</option>
                {clientesSalvos.map(c => <option key={c.id} value={c.cpfCnpj}>{c.razaoSocial}</option>)}
              </select>
            </div>
          </div>

          {/* Conteúdo - Mostra só se a tab estiver ativa */}
          {activeTab === 'cliente' && (
            <div className="p-6 pt-0 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-6">
                <InputForm label="CPF / CNPJ" nome="cpfCnpjTomador" val={formData.cpfCnpjTomador} max="18" cols="md:col-span-4" required />
                <InputForm label="Razão Social" nome="razaoSocialTomador" val={formData.razaoSocialTomador} cols="md:col-span-8" required />
                <InputForm label="E-mail" nome="emailTomador" val={formData.emailTomador} cols="md:col-span-8" />
                <InputForm label="Inscrição Municipal" nome="inscricaoMunicipalTomador" val={formData.inscricaoMunicipalTomador} cols="md:col-span-4" />
                
                <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-5 pt-6 mt-4 border-t border-gray-100">
                  <InputForm label="CEP" nome="cepTomador" val={formData.cepTomador} max="9" cols="md:col-span-2" required />
                  <InputForm label="Endereço" nome="logradouroTomador" val={formData.logradouroTomador} cols="md:col-span-4" required />
                  <InputForm label="Número" nome="numeroTomador" val={formData.numeroTomador} cols="md:col-span-1" required />
                  <InputForm label="Bairro" nome="bairroTomador" val={formData.bairroTomador} cols="md:col-span-3" required />
                  <InputForm label="Cidade" nome="cidadeTomador" val={formData.cidadeTomador} cols="md:col-span-3" required />
                  <InputForm label="UF" nome="ufTomador" val={formData.ufTomador} max="2" cols="md:col-span-1" required />
                </div>
              </div>
              
              {/* Botão Próximo */}
              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('servico')}
                  className="bg-idea-dark text-white px-8 py-4 rounded-xl font-bold hover:bg-idea-base transition-all flex items-center gap-2"
                >
                  Próximo: Serviço
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SEÇÃO 2: SERVIÇO */}
        <div className={`bg-white rounded-3xl shadow-lg border-2 transition-all duration-500 overflow-hidden
          ${activeTab === 'servico' ? 'border-idea-accent shadow-2xl' : 'border-gray-100 opacity-80'}`}>
          
          <div 
            className="flex items-center justify-between p-6 cursor-pointer"
            onClick={() => setActiveTab('servico')}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black
                ${activeTab === 'servico' ? 'bg-idea-accent text-white' : 'bg-idea-light text-idea-dark'}`}>
                02
              </div>
              <div>
                <h3 className="text-2xl font-black text-idea-dark">Detalhes do Serviço</h3>
                <p className="text-gray-500 text-sm font-medium">Descrição e código do serviço</p>
              </div>
            </div>
            
            <div className="hidden md:block">
              <select 
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleSelecionarProdutoRapido(e.target.value)} 
                className="bg-idea-light/50 border-2 border-idea-base/20 px-6 py-3 rounded-xl text-idea-dark font-bold text-sm outline-none focus:border-idea-accent transition-all min-w-[250px]"
              >
                <option value="">⚡ Carregar serviço salvo...</option>
                {produtosSalvos.map(p => <option key={p.id} value={p.id}>{p.nomeServico}</option>)}
              </select>
            </div>
          </div>

          {activeTab === 'servico' && (
            <div className="p-6 pt-0 border-t border-gray-100">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                <div className="lg:col-span-8 flex flex-col">
                  <label className="text-xs font-black text-idea-dark uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1">
                    <span className="text-idea-accent">📝</span>
                    Descrição do Serviço *
                  </label>
                  <textarea 
                    name="descricaoServico" 
                    value={formData.descricaoServico} 
                    onChange={handleChange} 
                    required 
                    rows="6" 
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-idea-accent outline-none font-bold text-idea-dark resize-none transition-all hover:border-gray-300"
                    placeholder="Descreva detalhadamente o serviço prestado..."
                  />
                </div>
                <div className="lg:col-span-4">
                  <label className="text-xs font-black text-idea-dark uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1">
                    <span className="text-idea-accent">🔢</span>
                    Código do Serviço (LC 116) *
                  </label>
                  <BuscaServico 
                    valor={formData.codigoServico} 
                    aoSelecionar={(codigo) => setFormData(prev => ({ ...prev, codigoServico: codigo }))} 
                  />
                  
                  {/* Info Card */}
                  <div className="mt-4 p-4 bg-idea-light/30 rounded-xl border border-idea-accent/20">
                    <p className="text-xs font-bold text-idea-dark uppercase tracking-wider mb-2">📍 Localização IBGE</p>
                    <p className="text-sm font-black text-idea-accent">
                      {formData.codigoCidadeTomador || 'Aguardando CEP...'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('cliente')}
                  className="px-8 py-4 rounded-xl font-bold border-2 border-gray-200 hover:border-idea-accent transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('valores')}
                  className="bg-idea-dark text-white px-8 py-4 rounded-xl font-bold hover:bg-idea-base transition-all flex items-center gap-2"
                >
                  Próximo: Valores
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SEÇÃO 3: VALORES */}
        <div className={`bg-white rounded-3xl shadow-lg border-2 transition-all duration-500 overflow-hidden
          ${activeTab === 'valores' ? 'border-idea-accent shadow-2xl' : 'border-gray-100 opacity-80'}`}>
          
          <div 
            className="flex items-center gap-4 p-6 cursor-pointer"
            onClick={() => setActiveTab('valores')}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black
              ${activeTab === 'valores' ? 'bg-idea-accent text-white' : 'bg-idea-light text-idea-dark'}`}>
              03
            </div>
            <div>
              <h3 className="text-2xl font-black text-idea-dark">Valores e Tributos</h3>
              <p className="text-gray-500 text-sm font-medium">Configuração financeira da nota</p>
            </div>
          </div>

          {activeTab === 'valores' && (
            <div className="p-6 pt-0 border-t border-gray-100">
              {/* Cards de Valor Principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-gradient-to-br from-idea-dark to-idea-base rounded-2xl p-6 text-white">
                  <label className="text-xs font-black text-idea-light/70 uppercase tracking-widest mb-2 block">
                    Valor Total do Serviço *
                  </label>
                  <div className="relative">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-black text-idea-accent">R$</span>
                    <input 
                      type="text" 
                      name="valorServico" 
                      value={formData.valorServico} 
                      onChange={handleChange} 
                      required
                      className="w-full pl-16 pr-6 py-4 bg-transparent border-b-2 border-white/20 text-5xl font-black outline-none focus:border-idea-accent transition-all text-white"
                      placeholder="0,00"
                    />
                  </div>
                </div>
                
                <div className="bg-idea-light/30 rounded-2xl p-6">
                  <label className="text-xs font-black text-idea-dark uppercase tracking-widest mb-2 block">
                    Alíquota ISS (%) *
                  </label>
                  <input 
                    type="text" 
                    name="aliquotaIss" 
                    value={formData.aliquotaIss} 
                    onChange={handleChange} 
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-2xl font-black outline-none focus:border-idea-accent"
                    placeholder="0,00"
                  />
                  
                  <div className="flex items-center gap-3 mt-4 p-3 bg-white rounded-xl">
                    <input 
                      type="checkbox" 
                      name="reterIss" 
                      checked={formData.reterIss} 
                      onChange={handleChange} 
                      className="w-5 h-5 rounded border-gray-300 text-idea-accent focus:ring-idea-accent" 
                    />
                    <label className="text-sm font-bold text-idea-dark cursor-pointer">ISS Retido na Fonte</label>
                  </div>
                </div>
              </div>

              {/* Grid de Tributos */}
              <div className="mt-8">
                <h4 className="text-lg font-black text-idea-dark mb-4">Outros Tributos e Deduções</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InputForm label="PIS" nome="pis" val={formData.pis} />
                  <InputForm label="COFINS" nome="cofins" val={formData.cofins} />
                  <InputForm label="INSS" nome="inss" val={formData.inss} />
                  <InputForm label="IR" nome="ir" val={formData.ir} />
                  <InputForm label="CSLL" nome="csll" val={formData.csll} />
                  <InputForm label="Deduções" nome="deducoes" val={formData.deducoes} />
                  <InputForm label="Desc. Incond." nome="descontoIncondicionado" val={formData.descontoIncondicionado} />
                  <InputForm label="Desc. Cond." nome="descontoCondicionado" val={formData.descontoCondicionado} />
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('servico')}
                  className="px-8 py-4 rounded-xl font-bold border-2 border-gray-200 hover:border-idea-accent transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Voltar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BOTÃO FINALIZAR - SEMPRE VISÍVEL */}
        <div className="sticky bottom-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 p-4 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-gray-500 text-sm font-bold">
              <span className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs">!</span>
              Campos marcados com * são obrigatórios
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full md:w-auto px-16 py-5 rounded-xl font-black text-xl shadow-2xl transition-all transform flex items-center justify-center gap-3
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-idea-accent to-idea-base text-white hover:shadow-2xl hover:scale-105'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </>
              ) : (
                '🚀 Emitir Nota Fiscal Agora'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}