import { useState } from 'react';
import axios from 'axios';

// --- Funções de Máscara ---
const formatCpfCnpj = (value) => {
  const numericValue = value.replace(/\D/g, ''); // Tira tudo que não é número
  if (numericValue.length <= 11) {
    // Máscara de CPF
    return numericValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    // Máscara de CNPJ
    return numericValue
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
      .slice(0, 18); // Limita o tamanho
  }
};

const formatCurrency = (value) => {
  const numericValue = value.replace(/\D/g, '');
  const number = (Number(numericValue) / 100).toFixed(2);
  if (number === '0.00') return '';
  return number.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
// --------------------------

export default function EmitirNota() {
  const [formData, setFormData] = useState({
    cpfCnpjTomador: '',
    razaoSocialTomador: '',
    emailTomador: '',
    descricaoServico: '',
    valorServico: '',
    codigoServico: '',
    aliquotaIss: '',
    reterIss: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;

    // Aplica as máscaras dependendo do campo
    if (name === 'cpfCnpjTomador') value = formatCpfCnpj(value);
    if (name === 'valorServico') value = formatCurrency(value);

    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Preenche dados falsos com 1 clique para não perder tempo nos testes
  const preencherDadosTeste = () => {
    setFormData({
      cpfCnpjTomador: '15.062.432/0001-40', // CNPJ genérico formatado
      razaoSocialTomador: 'Empresa Teste Homologação LTDA',
      emailTomador: 'teste@ideianfe.com.br',
      descricaoServico: 'Desenvolvimento e integração de API do sistema IdeaNFe.',
      valorServico: '1.500,00',
      codigoServico: '01.01',
      aliquotaIss: '2.00',
      reterIss: false,
    });
  };

  const handleHomologar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Limpamos os dados antes de enviar
      const dadosLimpos = {
        ...formData,
        cpfCnpjTomador: formData.cpfCnpjTomador.replace(/\D/g, ''),
        valorServico: Number(formData.valorServico.replace(/\./g, '').replace(',', '.'))
      };

const urlBackend = "https://us-central1-ideanfe.cloudfunctions.net/emitirNotaPlugnotas";      
      const response = await axios.post(urlBackend, dadosLimpos);
      
      console.log('✅ Retorno do Plugnotas:', response.data);
      alert('Nota enviada com sucesso pro Plugnotas! Olhe o console (F12).');

    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      alert('Deu erro ao enviar. Verifique o console (F12) para ver o motivo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 flex justify-center items-start">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        
        {/* CABEÇALHO COM BOTÃO DE AUTOPREENCHER */}
        <div className="mb-8 border-b pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Emissão de NFSe Simplificada</h2>
            <p className="text-gray-500 text-sm mt-1">Esqueça a burocracia do governo. Preencha apenas o essencial.</p>
          </div>
          <button 
            type="button" 
            onClick={preencherDadosTeste}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded text-sm transition-colors flex items-center gap-2"
          >
            🧪 Autopreencher
          </button>
        </div>

        <form onSubmit={handleHomologar} className="space-y-8">
          
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Cliente (Tomador)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF / CNPJ</label>
                <input type="text" name="cpfCnpjTomador" value={formData.cpfCnpjTomador} onChange={handleChange} required 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="000.000.000-00" maxLength="18" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social / Nome</label>
                <input type="text" name="razaoSocialTomador" value={formData.razaoSocialTomador} onChange={handleChange} required 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Nome da empresa ou pessoa" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail para envio da nota</label>
                <input type="email" name="emailTomador" value={formData.emailTomador} onChange={handleChange} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="cliente@email.com" />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              O que foi feito?
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Serviço</label>
                <textarea name="descricaoServico" value={formData.descricaoServico} onChange={handleChange} required rows="3" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" placeholder="Ex: Desenvolvimento de software, manutenção de equipamentos..." />
              </div>
              <div className="w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 font-medium">R$</span>
                  <input type="text" name="valorServico" value={formData.valorServico} onChange={handleChange} required 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="0,00" />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Dados Técnicos (Obrigatório para Prefeitura)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código do Serviço (LC 116)</label>
                <input type="text" name="codigoServico" value={formData.codigoServico} onChange={handleChange} required 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: 01.01" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alíquota ISS (%)</label>
                <input type="number" step="0.01" name="aliquotaIss" value={formData.aliquotaIss} onChange={handleChange} required 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: 2.00" />
              </div>
            </div>
          </section>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className={`text-white font-medium py-3 px-8 rounded-lg shadow-sm transition-colors text-lg w-full md:w-auto ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? 'Emitindo...' : 'Emitir Nota Fiscal'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}