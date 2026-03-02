import { useState } from 'react';
import axios from 'axios';

// --- Funções de Máscara ---
const formatCpfCnpj = (value) => {
  const numericValue = value.replace(/\D/g, '');
  if (numericValue.length <= 11) {
    return numericValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    return numericValue
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
      .slice(0, 18);
  }
};

const formatCurrency = (value) => {
  const numericValue = value.replace(/\D/g, '');
  const number = (Number(numericValue) / 100).toFixed(2);
  if (number === '0.00') return '';
  return number.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const formatCep = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
};
// --------------------------

export default function EmitirNota() {
  const [formData, setFormData] = useState({
    // Tomador
    cpfCnpjTomador: '',
    razaoSocialTomador: '',
    emailTomador: '',
    inscricaoMunicipalTomador: '',
    // Endereço Tomador
    cepTomador: '',
    logradouroTomador: '',
    numeroTomador: '',
    bairroTomador: '',
    cidadeTomador: '',
    ufTomador: '',
    // Serviço
    descricaoServico: '',
    codigoServico: '',
    // Valores Principais
    valorServico: '',
    deducoes: '',
    descontoCondicionado: '',
    descontoIncondicionado: '',
    // Retenções e ISS
    aliquotaIss: '',
    reterIss: false,
    pis: '',
    cofins: '',
    inss: '',
    ir: '',
    csll: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;

    if (name === 'cpfCnpjTomador') value = formatCpfCnpj(value);
    if (name === 'cepTomador') value = formatCep(value);
    if (['valorServico', 'deducoes', 'descontoCondicionado', 'descontoIncondicionado', 'pis', 'cofins', 'inss', 'ir', 'csll'].includes(name)) {
      value = formatCurrency(value);
    }

    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const preencherDadosTeste = () => {
    setFormData({
      cpfCnpjTomador: '15.062.432/0001-40',
      razaoSocialTomador: 'Empresa Tomadora Completa LTDA',
      emailTomador: 'financeiro@tomador.com.br',
      inscricaoMunicipalTomador: '987654321',
      cepTomador: '87020-025',
      logradouroTomador: 'Avenida Brasil',
      numeroTomador: '1500',
      bairroTomador: 'Centro',
      cidadeTomador: 'Maringá',
      ufTomador: 'PR',
      descricaoServico: 'Consultoria técnica avançada e desenvolvimento de software sob medida.',
      codigoServico: '01.01',
      valorServico: '5.000,00',
      deducoes: '0,00',
      descontoCondicionado: '0,00',
      descontoIncondicionado: '0,00',
      aliquotaIss: '3.00',
      reterIss: true,
      pis: '32,50',
      cofins: '150,00',
      inss: '0,00',
      ir: '75,00',
      csll: '50,00',
    });
  };

  const handleHomologar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Aqui depois nós vamos mapear todos esses novos campos para o Backend
      console.log('🚀 Dados completos gerados:', formData);
      alert('Modo completo ativado! Verifique o console com todos os dados.');
      
      // Simulação do backend por enquanto
      // const urlBackend = "https://us-central1-ideanfe.cloudfunctions.net/emitirNotaPlugnotas";
      // const response = await axios.post(urlBackend, dadosLimpos);
      
    } catch (error) {
      console.error('❌ Erro:', error);
      alert('Erro. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-start font-sans">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        
        {/* Cabeçalho */}
        <div className="mb-8 border-b border-gray-200 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Emissão Completa - NFS-e</h2>
            <p className="text-gray-500 text-sm mt-1">Preencha todos os dados tributários e de endereço exigidos pela prefeitura.</p>
          </div>
          <button type="button" onClick={preencherDadosTeste} className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors border border-blue-200 flex items-center gap-2">
            🧪 Preencher Tudo
          </button>
        </div>

        <form onSubmit={handleHomologar} className="space-y-10">
          
          {/* 1. DADOS DO TOMADOR */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-blue-600 pl-3">1. Dados do Cliente (Tomador)</h3>
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">CPF / CNPJ</label>
                <input type="text" name="cpfCnpjTomador" value={formData.cpfCnpjTomador} onChange={handleChange} required 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="000.000.000-00" maxLength="18" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Razão Social / Nome</label>
                <input type="text" name="razaoSocialTomador" value={formData.razaoSocialTomador} onChange={handleChange} required 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Nome completo" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Insc. Municipal</label>
                <input type="text" name="inscricaoMunicipalTomador" value={formData.inscricaoMunicipalTomador} onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Opcional" />
              </div>
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">E-mail</label>
                <input type="email" name="emailTomador" value={formData.emailTomador} onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="email@cliente.com" />
              </div>

              {/* Endereço Tomador */}
              <div className="md:col-span-4 mt-2">
                <h4 className="text-sm font-semibold text-gray-600 mb-3 border-b pb-1">Endereço do Cliente</h4>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">CEP</label>
                    <input type="text" name="cepTomador" value={formData.cepTomador} onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="00000-000" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Logradouro</label>
                    <input type="text" name="logradouroTomador" value={formData.logradouroTomador} onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Rua, Avenida..." />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Número</label>
                    <input type="text" name="numeroTomador" value={formData.numeroTomador} onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="123" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Bairro</label>
                    <input type="text" name="bairroTomador" value={formData.bairroTomador} onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">UF</label>
                    <input type="text" name="ufTomador" value={formData.ufTomador} onChange={handleChange} maxLength="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm uppercase" placeholder="SP" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. DADOS DO SERVIÇO */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-blue-600 pl-3">2. Descrição e Natureza do Serviço</h3>
            <div className="bg-white p-5 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-sm">
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Descrição Detalhada do Serviço</label>
                <textarea name="descricaoServico" value={formData.descricaoServico} onChange={handleChange} required rows="3" 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none" placeholder="Descreva exatamente o que foi prestado..." />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Cód. LC 116 (Serviço)</label>
                <input type="text" name="codigoServico" value={formData.codigoServico} onChange={handleChange} required 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Ex: 01.01" />
              </div>
            </div>
          </section>

          {/* 3. VALORES E RETENÇÕES (O CORAÇÃO DA NOTA COMPLETA) */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-green-600 pl-3">3. Composição de Valores e Tributos</h3>
            <div className="bg-green-50/50 p-5 rounded-lg border border-green-100 shadow-sm space-y-6">
              
              {/* Valores Principais */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Valor do Serviço</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-sm">R$</span>
                    <input type="text" name="valorServico" value={formData.valorServico} onChange={handleChange} required 
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-sm font-semibold" placeholder="0,00" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Deduções</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-sm">R$</span>
                    <input type="text" name="deducoes" value={formData.deducoes} onChange={handleChange} 
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-sm" placeholder="0,00" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1 text-nowrap">Desc. Incondicionado</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-sm">R$</span>
                    <input type="text" name="descontoIncondicionado" value={formData.descontoIncondicionado} onChange={handleChange} 
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-sm" placeholder="0,00" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Desc. Condicionado</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-sm">R$</span>
                    <input type="text" name="descontoCondicionado" value={formData.descontoCondicionado} onChange={handleChange} 
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-sm" placeholder="0,00" />
                  </div>
                </div>
              </div>

              {/* Retenções e ISS */}
              <div className="pt-4 border-t border-green-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Impostos e Retenções Federais</h4>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">PIS (R$)</label>
                    <input type="text" name="pis" value={formData.pis} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-sm" placeholder="0,00" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">COFINS (R$)</label>
                    <input type="text" name="cofins" value={formData.cofins} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-sm" placeholder="0,00" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">INSS (R$)</label>
                    <input type="text" name="inss" value={formData.inss} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-sm" placeholder="0,00" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">IR (R$)</label>
                    <input type="text" name="ir" value={formData.ir} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-sm" placeholder="0,00" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">CSLL (R$)</label>
                    <input type="text" name="csll" value={formData.csll} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-sm" placeholder="0,00" />
                  </div>
                  <div className="bg-gray-800 p-2 rounded-lg text-white">
                    <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Alíquota ISS (%)</label>
                    <input type="number" step="0.01" name="aliquotaIss" value={formData.aliquotaIss} onChange={handleChange} required className="w-full px-2 py-1 border-none rounded text-gray-900 focus:ring-2 focus:ring-green-500 outline-none text-sm" placeholder="Ex: 5.00" />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded border border-gray-200 w-max hover:bg-gray-50 transition-colors">
                    <input type="checkbox" name="reterIss" checked={formData.reterIss} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Imposto Retido (O Tomador paga o ISS)</span>
                  </label>
                </div>
              </div>

            </div>
          </section>

          <div className="pt-6 border-t border-gray-200 flex justify-end">
            <button type="submit" disabled={loading} className={`text-white font-bold py-4 px-10 rounded-lg shadow-md transition-all text-lg w-full md:w-auto uppercase tracking-wide ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}>
              {loading ? 'Processando emissão...' : 'Emitir NFS-e Completa'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}