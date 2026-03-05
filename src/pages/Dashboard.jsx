import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Cabeçalho do Dashboard */}
      <div>
        <h1 className="text-3xl font-extrabold text-idea-dark">Visão Geral</h1>
        <p className="text-gray-500 mt-1">Acompanhe as emissões e acesse rapidamente as funções do sistema.</p>
      </div>

      {/* Grid de Cards (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl shadow-inner">
            ✅
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Notas Autorizadas</p>
            <h2 className="text-3xl font-black text-idea-dark">124</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-idea-light text-idea-accent rounded-xl flex items-center justify-center text-2xl shadow-inner">
            💰
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Faturamento (Mês)</p>
            <h2 className="text-3xl font-black text-idea-dark">R$ 15.430</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-2xl shadow-inner">
            ⚠️
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Erros / Rejeitadas</p>
            <h2 className="text-3xl font-black text-idea-dark">2</h2>
          </div>
        </div>
      </div>

      {/* Acesso Rápido (Seus botões antigos, mas modernizados) */}
      <div className="pt-6">
        <h2 className="text-xl font-bold text-idea-dark mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          
          <button onClick={() => navigate('/emitir-nota')} className="bg-idea-accent hover:bg-blue-500 text-white p-6 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-3">
            <span className="text-4xl">➕</span>
            <span className="font-bold text-sm">Emitir Nota</span>
          </button>

          <button onClick={() => navigate('/minhas-notas')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-idea-accent hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group">
            <span className="text-4xl group-hover:scale-110 transition-transform">📄</span>
            <span className="font-bold text-idea-dark text-sm">Histórico</span>
          </button>

          <button onClick={() => navigate('/clientes')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-idea-accent hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group">
            <span className="text-4xl group-hover:scale-110 transition-transform">👥</span>
            <span className="font-bold text-idea-dark text-sm">Clientes</span>
          </button>
          
          <button onClick={() => navigate('/produtos')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-idea-accent hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group">
            <span className="text-4xl group-hover:scale-110 transition-transform">📦</span>
            <span className="font-bold text-idea-dark text-sm">Serviços</span>
          </button>
          
          <button onClick={() => navigate('/configuracoes')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-idea-accent hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group">
            <span className="text-4xl group-hover:scale-110 transition-transform">⚙️</span>
            <span className="font-bold text-idea-dark text-sm">Empresa</span>
          </button>

        </div>
      </div>
    </div>
  );
}