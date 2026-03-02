import { useState, useEffect } from 'react';
import axios from 'axios';
// Importando o Banco de Dados
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// --- Funções de Máscara ---
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
// --------------------------

export default function EmitirNota() {
  const [loading, setLoading] = useState(false);
  
  // Estados para guardar os dados puxados do Banco
  const [clientesSalvos, setClientesSalvos] = useState([]);
  const [produtosSalvos, setProdutosSalvos] = useState([]);

  const [formData, setFormData] = useState({
    cpfCnpjTomador: '', razaoSocialTomador: '', emailTomador: '', inscricaoMunicipalTomador: '',
    cepTomador: '', logradouroTomador: '', numeroTomador: '', bairroTomador: '', cidadeTomador: '', ufTomador: '',
    descricaoServico: '', codigoServico: '', valorServico: '', deducoes: '', descontoCondicionado: '', descontoIncondicionado: '',
    aliquotaIss: '', reterIss: false, pis: '', cofins: '', inss: '', ir: '', csll: '',
  });

  // 1. BUSCAR DADOS DO BANCO ASSIM QUE A TELA ABRIR
  useEffect(() => {
    const buscarDados = async () => {
      try {
        const clientesSnap = await getDocs(collection(db, "clientes"));
        const prodSnap = await getDocs(collection(db, "produtos"));
        setClientesSalvos(clientesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setProdutosSalvos(prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Erro ao carregar banco de dados:", error);
      }
    };
    buscarDados();
  }, []);

  // 2. FUNÇÃO QUE "OUVE" A DIGITAÇÃO
  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;

    // Se for o CPF/CNPJ, formata e verifica se já existe no banco!
    if (name === 'cpfCnpjTomador') {
      value = formatCpfCnpj(value);
      
      // MÁGICA 1: Auto-preencher ao digitar o CPF completo
      const clienteEncontrado = clientesSalvos.find(c => c.cpfCnpj === value);
      if (clienteEncontrado) {
        setFormData(prev => ({
          ...prev,
          cpfCnpjTomador: value,
          razaoSocialTomador: clienteEncontrado.razaoSocial,
          emailTomador: clienteEncontrado.email,
          inscricaoMunicipalTomador: clienteEncontrado.inscricaoMunicipal || '',
          cepTomador: clienteEncontrado.cep,
          logradouroTomador: clienteEncontrado.logradouro,
          numeroTomador: clienteEncontrado.numero,
          bairroTomador: clienteEncontrado.bairro,
          cidadeTomador: clienteEncontrado.cidade,
          ufTomador: clienteEncontrado.uf,
        }));
        return; // Para a execução aqui para não sobrescrever
      }
    }

    if (name === 'cepTomador') value = formatCep(value);
    if (['valorServico', 'deducoes', 'descontoCondicionado', 'descontoIncondicionado', 'pis', 'cofins', 'inss', 'ir', 'csll'].includes(name)) {
      value = formatCurrency(value);
    }

    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // MÁGICA 2: Preenchimento pelo Menu Dropdown
  const handleSelecionarClienteRapido = (cpfCnpj) => {
    const c = clientesSalvos.find(x => x.cpfCnpj === cpfCnpj);
    if (c) {
      setFormData(prev => ({
        ...prev, cpfCnpjTomador: c.cpfCnpj, razaoSocialTomador: c.razaoSocial, emailTomador: c.email,
        inscricaoMunicipalTomador: c.inscricaoMunicipal || '', cepTomador: c.cep, logradouroTomador: c.logradouro,
        numeroTomador: c.numero, bairroTomador: c.bairro, cidadeTomador: c.cidade, ufTomador: c.uf,
      }));
    }
  };

  const handleSelecionarProdutoRapido = (idProduto) => {
    const p = produtosSalvos.find(x => x.id === idProduto);
    if (p) {
      setFormData(prev => ({
        ...prev, descricaoServico: p.descricao, codigoServico: p.codigoServico,
        valorServico: p.valorPadrao, aliquotaIss: p.aliquotaIss
      }));
    }
  };

  // 3. ENVIO PARA O BACKEND (PLUGNOTAS)
  const handleHomologar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const parseCurrency = (val) => Number(String(val).replace(/\./g, '').replace(',', '.')) || 0;

      const dadosLimpos = {
        ...formData,
        cpfCnpjTomador: formData.cpfCnpjTomador.replace(/\D/g, ''),
        cepTomador: formData.cepTomador.replace(/\D/g, ''),
        valorServico: parseCurrency(formData.valorServico),
        deducoes: parseCurrency(formData.deducoes),
        descontoCondicionado: parseCurrency(formData.descontoCondicionado),
        descontoIncondicionado: parseCurrency(formData.descontoIncondicionado),
        pis: parseCurrency(formData.pis), cofins: parseCurrency(formData.cofins),
        inss: parseCurrency(formData.inss), ir: parseCurrency(formData.ir), csll: parseCurrency(formData.csll),
        aliquotaIss: Number(formData.aliquotaIss)
      };
      
      const urlBackend = "https://us-central1-ideanfe.cloudfunctions.net/emitirNotaPlugnotas";
      const response = await axios.post(urlBackend, dadosLimpos);
      
      alert('Nota Completa emitida com sucesso! Verifique o console.');
      console.log('✅ SUCESSO:', response.data);
      
    } catch (error) {
      console.error('❌ Erro na emissão:', error.response ? error.response.data : error);
      alert('Erro ao emitir a nota. Verifique o console (F12).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-start font-sans">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        
        <div className="mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Emissão Completa - NFS-e</h2>
          <p className="text-gray-500 text-sm mt-1">Preencha os dados manualmente ou selecione dos seus cadastros salvos.</p>
        </div>

        <form onSubmit={handleHomologar} className="space-y-10">
          
          {/* 1. DADOS DO TOMADOR */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3">1. Dados do Cliente</h3>
              
              {/* SELECT INTELIGENTE DE CLIENTES */}
              {clientesSalvos.length > 0 && (
                <div className="w-64">
                  <select onChange={(e) => handleSelecionarClienteRapido(e.target.value)} className="w-full px-3 py-2 border-2 border-blue-400 bg-blue-50 text-blue-800 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm font-bold cursor-pointer shadow-sm">
                    <option value="">⚡ Autopreencher Cliente...</option>
                    {clientesSalvos.map(c => <option key={c.id} value={c.cpfCnpj}>{c.razaoSocial} ({c.cpfCnpj})</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">CPF / CNPJ</label>
                <input type="text" name="cpfCnpjTomador" value={formData.cpfCnpjTomador} onChange={handleChange} required 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Digite para buscar..." maxLength="18" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Razão Social / Nome</label>
                <input type="text" name="razaoSocialTomador" value={formData.razaoSocialTomador} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Insc. Municipal</label>
                <input type="text" name="inscricaoMunicipalTomador" value={formData.inscricaoMunicipalTomador} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">E-mail</label>
                <input type="email" name="emailTomador" value={formData.emailTomador} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>

              {/* Endereço */}
              <div className="md:col-span-4 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="md:col-span-1"><label className="block text-xs font-bold text-gray-700 uppercase mb-1">CEP</label><input type="text" name="cepTomador" value={formData.cepTomador} onChange={handleChange} className="w-full px-3 py-2 border rounded text-sm" /></div>
                  <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-700 uppercase mb-1">Logradouro</label><input type="text" name="logradouroTomador" value={formData.logradouroTomador} onChange={handleChange} className="w-full px-3 py-2 border rounded text-sm" /></div>
                  <div className="md:col-span-1"><label className="block text-xs font-bold text-gray-700 uppercase mb-1">Número</label><input type="text" name="numeroTomador" value={formData.numeroTomador} onChange={handleChange} className="w-full px-3 py-2 border rounded text-sm" /></div>
                  <div className="md:col-span-1"><label className="block text-xs font-bold text-gray-700 uppercase mb-1">Bairro</label><input type="text" name="bairroTomador" value={formData.bairroTomador} onChange={handleChange} className="w-full px-3 py-2 border rounded text-sm" /></div>
                  <div className="md:col-span-1"><label className="block text-xs font-bold text-gray-700 uppercase mb-1">UF</label><input type="text" name="ufTomador" value={formData.ufTomador} onChange={handleChange} maxLength="2" className="w-full px-3 py-2 border rounded text-sm uppercase" /></div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. DADOS DO SERVIÇO */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3">2. Descrição do Serviço</h3>
              
              {/* SELECT INTELIGENTE DE PRODUTOS */}
              {produtosSalvos.length > 0 && (
                <div className="w-64">
                  <select onChange={(e) => handleSelecionarProdutoRapido(e.target.value)} className="w-full px-3 py-2 border-2 border-green-400 bg-green-50 text-green-800 rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm font-bold cursor-pointer shadow-sm">
                    <option value="">⚡ Autopreencher Serviço...</option>
                    {produtosSalvos.map(p => <option key={p.id} value={p.id}>{p.nomeServico} - R$ {p.valorPadrao}</option>)}
                  </select>
                </div>
              )}
            </div>
            
            <div className="bg-white p-5 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-sm">
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Descrição Detalhada do Serviço</label>
                <textarea name="descricaoServico" value={formData.descricaoServico} onChange={handleChange} required rows="3" className="w-full px-3 py-2 border rounded text-sm resize-none" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Cód. LC 116 (Serviço)</label>
                <input type="text" name="codigoServico" value={formData.codigoServico} onChange={handleChange} required className="w-full px-3 py-2 border rounded text-sm" />
              </div>
            </div>
          </section>

          {/* 3. VALORES */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-green-600 pl-3">3. Valores e Tributos</h3>
            <div className="bg-green-50/50 p-5 rounded-lg border border-green-100 shadow-sm space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Valor do Serviço</label>
                  <div className="relative"><span className="absolute left-3 top-2 text-gray-500 text-sm">R$</span><input type="text" name="valorServico" value={formData.valorServico} onChange={handleChange} required className="w-full pl-9 pr-3 py-2 border rounded text-sm font-semibold" /></div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Deduções</label>
                  <div className="relative"><span className="absolute left-3 top-2 text-gray-500 text-sm">R$</span><input type="text" name="deducoes" value={formData.deducoes} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded text-sm" /></div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1 text-nowrap">Desc. Incondicionado</label>
                  <div className="relative"><span className="absolute left-3 top-2 text-gray-500 text-sm">R$</span><input type="text" name="descontoIncondicionado" value={formData.descontoIncondicionado} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded text-sm" /></div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Desc. Condicionado</label>
                  <div className="relative"><span className="absolute left-3 top-2 text-gray-500 text-sm">R$</span><input type="text" name="descontoCondicionado" value={formData.descontoCondicionado} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border rounded text-sm" /></div>
                </div>
              </div>

              <div className="pt-4 border-t border-green-200">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div><label className="block text-xs font-bold text-gray-700 uppercase mb-1">PIS</label><input type="text" name="pis" value={formData.pis} onChange={handleChange} className="w-full px-3 py-2 border rounded text-sm" /></div>
                  <div><label className="block text-xs font-bold text-gray-700 uppercase mb-1">COFINS</label><input type="text" name="cofins" value={formData.cofins} onChange={handleChange} className="w-full px-3 py-2 border rounded text-sm" /></div>
                  <div><label className="block text-xs font-bold text-gray-700 uppercase mb-1">INSS</label><input type="text" name="inss" value={formData.inss} onChange={handleChange} className="w-full px-3 py-2 border rounded text-sm" /></div>
                  <div><label className="block text-xs font-bold text-gray-700 uppercase mb-1">IR</label><input type="text" name="ir" value={formData.ir} onChange={handleChange} className="w-full px-3 py-2 border rounded text-sm" /></div>
                  <div><label className="block text-xs font-bold text-gray-700 uppercase mb-1">CSLL</label><input type="text" name="csll" value={formData.csll} onChange={handleChange} className="w-full px-3 py-2 border rounded text-sm" /></div>
                  <div className="bg-gray-800 p-2 rounded-lg text-white"><label className="block text-xs font-bold text-gray-300 uppercase mb-1">Alíquota ISS (%)</label><input type="number" step="0.01" name="aliquotaIss" value={formData.aliquotaIss} onChange={handleChange} required className="w-full px-2 py-1 border-none rounded text-gray-900 text-sm" /></div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded border w-max"><input type="checkbox" name="reterIss" checked={formData.reterIss} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" /><span className="text-sm font-bold text-gray-700 uppercase">Imposto Retido (O Tomador paga o ISS)</span></label>
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