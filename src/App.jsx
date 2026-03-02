import { useState } from 'react';
import EmitirNota from './pages/EmitirNota';

function App() {
  // Estado que controla qual tela está aparecendo: 'login', 'dashboard' ou 'emitir-nota'
  const [telaAtual, setTelaAtual] = useState('login');

  // ==========================================
  // TELA 1: LOGIN
  // ==========================================
  const renderLogin = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-md">
            IN
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">IdeaNFS</h1>
          <p className="text-gray-500 mt-2 text-sm">Acesse sua conta para gerenciar suas notas</p>
        </div>
        
        {/* Ao enviar o formulário, ele vai direto para o Dashboard */}
        <form onSubmit={(e) => { e.preventDefault(); setTelaAtual('dashboard'); }} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
            <input type="email" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="admin@ideianfs.com.br" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
            <input type="password" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md mt-4">
            Entrar no Sistema
          </button>
        </form>
      </div>
    </div>
  );

  // ==========================================
  // TELA 2: DASHBOARD (MENU)
  // ==========================================
  const renderDashboard = () => (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Barra Superior */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-sm">IN</div>
          <h1 className="text-xl font-extrabold text-gray-800">IdeaNFS</h1>
        </div>
        <button onClick={() => setTelaAtual('login')} className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors">
          Sair da conta
        </button>
      </header>
      
      {/* Conteúdo Central */}
      <main className="max-w-6xl mx-auto p-8 mt-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 border-l-4 border-blue-600 pl-3">Visão Geral</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Botão Clientes */}
          <button onClick={() => alert('Em breve vamos criar a tela de Clientes!')} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-400 transition-all flex flex-col items-center justify-center gap-4 group">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              👥
            </div>
            <h3 className="text-lg font-bold text-gray-700 group-hover:text-blue-600">Cadastro de Clientes</h3>
            <p className="text-xs text-gray-400 text-center">Gerencie os tomadores de serviço</p>
          </button>

          {/* Botão Produtos/Serviços */}
          <button onClick={() => alert('Em breve vamos criar a tela de Produtos!')} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-400 transition-all flex flex-col items-center justify-center gap-4 group">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              📦
            </div>
            <h3 className="text-lg font-bold text-gray-700 group-hover:text-blue-600">Cadastro de Produtos</h3>
            <p className="text-xs text-gray-400 text-center">Gerencie seu catálogo e serviços</p>
          </button>

          {/* Botão Emitir Nota */}
          <button onClick={() => setTelaAtual('emitir-nota')} className="bg-white p-8 rounded-xl shadow-sm border border-green-200 hover:shadow-md hover:border-green-500 transition-all flex flex-col items-center justify-center gap-4 group">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-3xl group-hover:bg-green-600 group-hover:text-white transition-colors">
              📄
            </div>
            <h3 className="text-lg font-bold text-gray-700 group-hover:text-green-600">Emissão de Nota</h3>
            <p className="text-xs text-gray-400 text-center">Gerar nova NFS-e completa</p>
          </button>

        </div>
      </main>
    </div>
  );

  // ==========================================
  // RENDERIZAÇÃO FINAL (O Roteador)
  // ==========================================
  return (
    <>
      {telaAtual === 'login' && renderLogin()}
      
      {telaAtual === 'dashboard' && renderDashboard()}
      
      {telaAtual === 'emitir-nota' && (
        <div className="bg-gray-100 min-h-screen">
          {/* Barra de Voltar no topo da tela de Emitir Nota */}
          <div className="max-w-5xl mx-auto pt-6 px-8">
            <button 
              onClick={() => setTelaAtual('dashboard')} 
              className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-2 transition-colors"
            >
              ← Voltar para o Menu Principal
            </button>
          </div>
          {/* Chama o componente que nós já programamos antes! */}
          <EmitirNota />
        </div>
      )}
    </>
  );
}

export default App;