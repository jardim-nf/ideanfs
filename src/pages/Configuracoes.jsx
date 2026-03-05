import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Configuracoes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [activeTab, setActiveTab] = useState('empresa');
  
  const [empresa, setEmpresa] = useState({
    cnpj: '', razaoSocial: '', nomeFantasia: '', email: '', telefone: '',
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
    inscricaoMunicipal: '', inscricaoEstadual: '',
    regimeTributario: '1',
    tokenAPI: '7a1c5954ca39092ba5fd7b390755c5fa',
    idCertificado: '',
    certificadoValidade: ''
  });

  // Formatações
  const formatCnpj = (value) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5').slice(0, 18);
  };

  const formatCep = (value) => {
    return value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
  };

  const formatPhone = (value) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 10) {
      return numericValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numericValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  // Buscar endereço por CEP
  const buscarEnderecoPorCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;
    
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      if (!response.data.erro) {
        setEmpresa(prev => ({
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

  // Carregar configurações
  useEffect(() => {
    const buscarConfiguracoes = async () => {
      try {
        const docRef = doc(db, "configuracoes", "minha_empresa");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setEmpresa(docSnap.data());
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      }
    };
    buscarConfiguracoes();
  }, []);

  const handleChange = async (e) => {
    let { name, value } = e.target;

    // Aplicar máscaras
    if (name === 'cnpj') {
      value = formatCnpj(value);
    }
    if (name === 'cep') {
      value = formatCep(value);
      if (value.replace(/\D/g, '').length === 8) {
        await buscarEnderecoPorCEP(value);
      }
    }
    if (name === 'telefone') {
      value = formatPhone(value);
    }

    setEmpresa(prev => ({ ...prev, [name]: value }));
  };

  // Salvar configurações
  const handleSalvar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      await setDoc(doc(db, "configuracoes", "minha_empresa"), empresa);

      // Mostrar toast de sucesso
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold z-50 animate-slide-in';
      toast.textContent = '✅ Configurações salvas com sucesso!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

      setMensagem({ tipo: 'sucesso', texto: 'Configurações salvas com sucesso!' });
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar as configurações.' });
    } finally {
      setLoading(false);
    }
  };

  // Componente de Input
  const InputConfig = ({ label, nome, val, placeholder, cols = "col-span-1", required = false, type = "text" }) => (
    <div className={`flex flex-col ${cols}`}>
      <label className="text-xs font-black text-idea-dark uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        type={type}
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
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20">
      
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
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-idea-accent to-idea-base flex items-center justify-center text-3xl text-white shadow-xl">
            ⚙️
          </div>
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-idea-dark tracking-tighter leading-tight">
              Configurações
            </h1>
            <p className="text-gray-500 font-medium text-lg mt-2">
              Configure os dados da sua empresa e integrações
            </p>
          </div>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
        {[
          { id: 'empresa', label: '🏢 Dados da Empresa' },
          { id: 'endereco', label: '📍 Endereço' },
          { id: 'integracao', label: '🔌 Integração' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-6 py-4 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id 
                ? 'bg-idea-accent text-white shadow-lg shadow-idea-accent/30' 
                : 'text-gray-400 hover:text-idea-dark'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Barra de Progresso */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-8">
        <div 
          className="h-full bg-gradient-to-r from-idea-accent to-idea-base transition-all duration-500 rounded-full"
          style={{ width: activeTab === 'empresa' ? '33%' : activeTab === 'endereco' ? '66%' : '100%' }}
        />
      </div>

      {mensagem.texto && (
        <div className={`mb-6 p-4 rounded-2xl font-bold text-center animate-slide-in ${
          mensagem.tipo === 'sucesso' ? 'bg-green-100 text-green-700 border-2 border-green-200' : 'bg-red-100 text-red-700 border-2 border-red-200'
        }`}>
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleSalvar} className="space-y-6">
        
        {/* TAB 1: DADOS DA EMPRESA */}
        {activeTab === 'empresa' && (
          <div className="bg-white rounded-3xl shadow-lg border-2 border-idea-accent/20 p-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-idea-accent text-white flex items-center justify-center text-xl font-black">
                01
              </div>
              <div>
                <h3 className="text-2xl font-black text-idea-dark">Dados Cadastrais</h3>
                <p className="text-gray-500 text-sm font-medium">Informações principais da sua empresa</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputConfig label="CNPJ" nome="cnpj" val={empresa.cnpj} placeholder="00.000.000/0000-00" required cols="md:col-span-1" />
              <InputConfig label="Razão Social" nome="razaoSocial" val={empresa.razaoSocial} required cols="md:col-span-2" />
              <InputConfig label="Nome Fantasia" nome="nomeFantasia" val={empresa.nomeFantasia} cols="md:col-span-2" />
              
              <div className="md:col-span-2 grid grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-xs font-black text-idea-dark uppercase tracking-widest mb-1.5 ml-1">
                    Regime Tributário <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="regimeTributario" 
                    value={empresa.regimeTributario} 
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 text-idea-dark font-bold text-sm outline-none focus:border-idea-accent hover:border-gray-300 transition-all"
                  >
                    <option value="1">Simples Nacional</option>
                    <option value="2">Simples Nacional - Excesso de Sublimite</option>
                    <option value="3">Regime Normal (Lucro Presumido)</option>
                    <option value="4">Regime Normal (Lucro Real)</option>
                    <option value="5">MEI</option>
                  </select>
                </div>

                <InputConfig label="Inscrição Municipal" nome="inscricaoMunicipal" val={empresa.inscricaoMunicipal} />
              </div>

              <div className="md:col-span-2 grid grid-cols-2 gap-6">
                <InputConfig label="Inscrição Estadual" nome="inscricaoEstadual" val={empresa.inscricaoEstadual} />
                <InputConfig label="Telefone" nome="telefone" val={empresa.telefone} placeholder="(11) 99999-9999" />
              </div>

              <InputConfig label="E-mail de Contato" nome="email" val={empresa.email} type="email" required cols="md:col-span-2" />
            </div>
          </div>
        )}

        {/* TAB 2: ENDEREÇO */}
        {activeTab === 'endereco' && (
          <div className="bg-white rounded-3xl shadow-lg border-2 border-idea-accent/20 p-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-idea-accent text-white flex items-center justify-center text-xl font-black">
                02
              </div>
              <div>
                <h3 className="text-2xl font-black text-idea-dark">Endereço da Empresa</h3>
                <p className="text-gray-500 text-sm font-medium">Localização para emissão das notas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <InputConfig label="CEP" nome="cep" val={empresa.cep} placeholder="00000-000" required cols="md:col-span-2" />
              <InputConfig label="Logradouro" nome="logradouro" val={empresa.logradouro} required cols="md:col-span-5" />
              <InputConfig label="Número" nome="numero" val={empresa.numero} required cols="md:col-span-1" />
              <InputConfig label="Complemento" nome="complemento" val={empresa.complemento} cols="md:col-span-2" />
              <InputConfig label="Bairro" nome="bairro" val={empresa.bairro} required cols="md:col-span-3" />
              <InputConfig label="Cidade" nome="cidade" val={empresa.cidade} required cols="md:col-span-3" />
              <InputConfig label="UF" nome="uf" val={empresa.uf} required max="2" cols="md:col-span-1" />
            </div>

            {/* Info Card */}
            <div className="mt-8 p-4 bg-idea-light/30 rounded-xl border border-idea-accent/20">
              <div className="flex items-start gap-3">
                <span className="text-idea-accent text-xl">📍</span>
                <div>
                  <p className="text-xs font-bold text-idea-dark uppercase tracking-wider mb-1">Endereço Fiscal</p>
                  <p className="text-sm font-medium text-gray-600">
                    Este endereço será usado como padrão na emissão das notas fiscais e deve corresponder ao endereço cadastrado na prefeitura.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INTEGRAÇÃO */}
        {activeTab === 'integracao' && (
          <div className="bg-gradient-to-br from-idea-dark to-idea-base rounded-3xl shadow-xl p-8 text-white animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-idea-accent flex items-center justify-center text-xl font-black">
                03
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">Integração PlugNotas</h3>
                <p className="text-white/60 text-sm font-medium">Configurações técnicas e certificado digital</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Token API */}
              <div>
                <label className="text-xs font-black text-white/50 uppercase tracking-widest mb-2 block">
                  Token de Acesso API
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    name="tokenAPI" 
                    value={empresa.tokenAPI} 
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white font-mono text-lg outline-none focus:border-idea-accent transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(empresa.tokenAPI)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                    title="Copiar token"
                  >
                    📋
                  </button>
                </div>
                <p className="text-white/40 text-xs mt-2 font-medium">
                  Token utilizado para autenticar as requisições à API da PlugNotas
                </p>
              </div>

              {/* Certificado Digital */}
              <div className="pt-6 border-t border-white/10">
                <label className="text-xs font-black text-white/50 uppercase tracking-widest mb-4 block">
                  Certificado Digital A1
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-white/70 mb-2 block">ID do Certificado</label>
                    <input 
                      type="text" 
                      name="idCertificado" 
                      value={empresa.idCertificado} 
                      onChange={handleChange}
                      placeholder="ID gerado após upload"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-idea-accent outline-none transition-all text-white placeholder:text-white/30"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-white/70 mb-2 block">Data de Validade</label>
                    <input 
                      type="text" 
                      name="certificadoValidade" 
                      value={empresa.certificadoValidade} 
                      onChange={handleChange}
                      placeholder="00/00/0000"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-idea-accent outline-none transition-all text-white placeholder:text-white/30"
                    />
                  </div>
                </div>

                {/* Área de Upload */}
                <div className="mt-6 p-8 border-2 border-dashed border-white/20 rounded-2xl text-center hover:border-idea-accent transition-all cursor-pointer group">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">⬆️</div>
                  <p className="text-white font-bold text-lg">Clique para fazer upload do certificado</p>
                  <p className="text-white/40 text-sm mt-2">Arquivos .pfx ou .p12 (até 5MB)</p>
                </div>
              </div>

              {/* Status da Conexão */}
              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-bold">API PlugNotas</span>
                  </div>
                  <span className="text-green-400 text-sm font-bold">● Online</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botões de Navegação e Salvamento */}
        <div className="flex items-center justify-between gap-4 mt-8">
          <div>
            {activeTab !== 'empresa' && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'endereco' ? 'empresa' : 'endereco')}
                className="px-8 py-4 rounded-xl font-bold border-2 border-gray-200 hover:border-idea-accent transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar
              </button>
            )}
          </div>

          <div className="flex gap-4">
            {activeTab !== 'integracao' && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'empresa' ? 'endereco' : 'integracao')}
                className="px-8 py-4 rounded-xl font-bold bg-idea-dark text-white hover:bg-idea-base transition-all flex items-center gap-2"
              >
                Próximo
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className={`px-12 py-4 rounded-xl font-black text-white shadow-2xl transition-all transform flex items-center gap-3 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-idea-accent to-idea-base hover:shadow-xl hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </>
              ) : (
                '💾 Salvar Configurações'
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}