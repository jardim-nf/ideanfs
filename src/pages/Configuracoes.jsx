import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Configuracoes() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);

  // Estado para controlar o tipo de emissão (O Pulo do Gato)
  const [tipoCertificado, setTipoCertificado] = useState('mei'); // 'mei' ou 'proprio'
  const [arquivoCertificado, setArquivoCertificado] = useState(null);

  const [formData, setFormData] = useState({
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    regimeTributario: '5', // 5 = MEI, 1 = Simples Nacional, etc.
    senhaCertificado: '', // Só será usado se for certificado próprio
    cep: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: ''
  });

  const handleChange = async (e) => {
    let { name, value } = e.target;

    if (name === 'cnpj') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5').slice(0, 18);
    }

    if (name === 'cep') {
      value = value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
      if (value.replace(/\D/g, '').length === 8) {
        try {
          const res = await axios.get(`https://viacep.com.br/ws/${value.replace(/\D/g, '')}/json/`);
          if (!res.data.erro) {
            setFormData(prev => ({
              ...prev, cep: value, logradouro: res.data.logradouro,
              bairro: res.data.bairro, cidade: res.data.localidade, uf: res.data.uf
            }));
            return;
          }
        } catch (error) { console.error(error); }
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setArquivoCertificado(e.target.files[0]);
  };

const handleSalvarEmpresa = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      // Cole aqui a URL exata da sua Cloud Function (ela termina com /configurarMinhaEmpresa)
      const urlBackend = "https://us-central1-ideanfe.cloudfunctions.net/configurarMinhaEmpresa";
      
      const payloadEnvio = {
        empresa: formData,
        tipoCertificado: tipoCertificado
      };

      const response = await axios.post(urlBackend, payloadEnvio);
      
      console.log("Sucesso no Backend:", response.data);
      alert('Sua empresa foi configurada e ativada com sucesso!');
      navigate('/dashboard'); // Manda o cara pro Menu pra ele começar a trabalhar
      
    } catch (error) {
      console.error("Erro ao chamar o backend:", error);
      alert('Erro ao configurar empresa. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
          <button onClick={() => navigate('/dashboard')} className="text-blue-600 font-bold mb-6 hover:text-blue-800">
            ← Voltar para o Menu
          </button>
          {/* TUTORIAL PARA O MEI QUE APARECE AUTOMATICAMENTE */}
              {tipoCertificado === 'mei' && (
                <div className="mt-4 p-5 bg-yellow-50 rounded-lg border border-yellow-200 animate-fade-in">
                  <h4 className="font-extrabold text-yellow-800 mb-2 flex items-center gap-2">
                    <span className="text-xl">💡</span> Passo a passo para ativar:
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-900 ml-2">
                    <li>Acesse o <a href="https://www.nfse.gov.br/EmissorNacional/" target="_blank" rel="noreferrer" className="font-bold underline text-blue-600 hover:text-blue-800">Portal Nacional da NFS-e</a> e faça login com seu <b>gov.br</b>.</li>
                    <li>No menu principal, clique na aba <b>Procurações</b>.</li>
                    <li>Clique em <b>Cadastrar Nova Procuração</b>.</li>
                    <li>No campo CNPJ do Outorgado, digite o nosso CNPJ: <b className="bg-yellow-200 px-1 rounded select-all">00.000.000/0001-00</b>.</li>
                    <li>Marque as permissões <b>"Emitir NFS-e"</b> e <b>"Cancelar NFS-e"</b>.</li>
                    <li>Salve. Depois, basta clicar no botão roxo abaixo para finalizar aqui no IdeaNFS!</li>
                  </ol>
                </div>
              )}
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2 border-l-4 border-purple-600 pl-3">
            Dados da Minha Empresa
          </h2>
          <p className="text-gray-500 text-sm mb-6 pl-4">Configure os dados do seu negócio para habilitar a emissão de notas.</p>
          
          <form onSubmit={handleSalvarEmpresa} className="space-y-6">
            
            {/* 1. O SEGREDO DO SISTEMA (ESCOLHA DO CERTIFICADO) */}
            <div className="bg-purple-50 p-5 rounded-lg border border-purple-200">
              <h3 className="font-bold text-purple-800 mb-3">Como você deseja emitir suas notas?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Opção MEI */}
                <label className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${tipoCertificado === 'mei' ? 'border-purple-600 bg-white shadow' : 'border-gray-200 hover:border-purple-300'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <input type="radio" name="tipoEmissao" value="mei" checked={tipoCertificado === 'mei'} onChange={() => { setTipoCertificado('mei'); setFormData({...formData, regimeTributario: '5'}); }} className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-gray-800">Sou MEI (Procuração)</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-8">Emite notas sem precisar comprar certificado digital, usando a procuração do GOV.BR.</p>
                </label>

                {/* Opção Com Certificado */}
                <label className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${tipoCertificado === 'proprio' ? 'border-purple-600 bg-white shadow' : 'border-gray-200 hover:border-purple-300'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <input type="radio" name="tipoEmissao" value="proprio" checked={tipoCertificado === 'proprio'} onChange={() => { setTipoCertificado('proprio'); setFormData({...formData, regimeTributario: '1'}); }} className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-gray-800">Tenho Certificado A1</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-8">Para empresas LTDA, Simples Nacional, ou MEIs que já possuem certificado próprio em arquivo.</p>
                </label>
              </div>

              {/* Se escolheu certificado próprio, abre os campos de upload */}
              {tipoCertificado === 'proprio' && (
                <div className="mt-4 p-4 bg-white rounded border border-purple-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Arquivo do Certificado (.pfx)</label>
                    <input type="file" accept=".pfx,.p12" onChange={handleFileChange} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Senha do Certificado</label>
                    <input type="password" name="senhaCertificado" value={formData.senhaCertificado} onChange={handleChange} required className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none text-sm" placeholder="••••••••" />
                  </div>
                </div>
              )}
            </div>

            {/* 2. DADOS DA EMPRESA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1"><label className="block text-sm font-bold text-gray-700 mb-1">CNPJ</label><input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-2 outline-none" placeholder="00.000.000/0001-00" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-1">Razão Social</label><input type="text" name="razaoSocial" value={formData.razaoSocial} onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-2 outline-none" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-1">Nome Fantasia</label><input type="text" name="nomeFantasia" value={formData.nomeFantasia} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 outline-none" /></div>
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-1">Regime Tributário</label>
                <select name="regimeTributario" value={formData.regimeTributario} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 outline-none bg-white">
                  <option value="5">MEI</option>
                  <option value="1">Simples Nacional</option>
                  <option value="3">Lucro Presumido</option>
                  <option value="4">Lucro Real</option>
                </select>
              </div>
            </div>

            {/* 3. ENDEREÇO DA EMPRESA */}
            <div className="p-4 bg-gray-50 border rounded-lg">
              <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase">Endereço da Sede</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1"><label className="block text-xs font-bold text-gray-600 mb-1">CEP</label><input type="text" name="cep" value={formData.cep} onChange={handleChange} required className="w-full p-2 border rounded" placeholder="00000-000" /></div>
                <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-600 mb-1">Logradouro</label><input type="text" name="logradouro" value={formData.logradouro} onChange={handleChange} required className="w-full p-2 border rounded" /></div>
                <div className="md:col-span-1"><label className="block text-xs font-bold text-gray-600 mb-1">Número</label><input type="text" name="numero" value={formData.numero} onChange={handleChange} required className="w-full p-2 border rounded" /></div>
                <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-600 mb-1">Bairro</label><input type="text" name="bairro" value={formData.bairro} onChange={handleChange} required className="w-full p-2 border rounded" /></div>
                <div className="md:col-span-1"><label className="block text-xs font-bold text-gray-600 mb-1">Cidade</label><input type="text" name="cidade" value={formData.cidade} onChange={handleChange} required className="w-full p-2 border rounded" /></div>
                <div className="md:col-span-1"><label className="block text-xs font-bold text-gray-600 mb-1">UF</label><input type="text" name="uf" value={formData.uf} onChange={handleChange} required maxLength="2" className="w-full p-2 border rounded uppercase" /></div>
              </div>
            </div>

            <button type="submit" disabled={carregando} className="bg-purple-600 text-white font-bold py-4 px-8 rounded-lg mt-4 hover:bg-purple-700 shadow-md transition-colors w-full text-lg">
              {carregando ? 'Configurando...' : 'Salvar Configurações e Ativar Emissão'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}