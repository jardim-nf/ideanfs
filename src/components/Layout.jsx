import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const [menuAberto, setMenuAberto] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // Para sabermos qual menu deixar "ativo"

  // Lista de itens do menu para facilitar
  const menuItems = [
    { nome: 'Dashboard', rota: '/dashboard', icone: '📊' },
    { nome: 'Clientes', rota: '/clientes', icone: '👥' },
    { nome: 'Serviços', rota: '/produtos', icone: '📦' },
    { nome: 'Emitir Nota', rota: '/emitir-nota', icone: '➕' },
    { nome: 'Minhas Notas', rota: '/minhas-notas', icone: '📄' },
    { nome: 'Configurações', rota: '/configuracoes', icone: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-idea-light font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`${menuAberto ? 'w-64' : 'w-20'} bg-idea-dark text-white transition-all duration-300 flex flex-col shadow-2xl z-20`}>
        {/* Espaço da Logo */}
        <div className="h-20 flex items-center justify-center border-b border-idea-base p-4">
          {menuAberto ? (
            <div className="text-xl font-bold tracking-wider flex items-center gap-2 text-white cursor-pointer" onClick={() => navigate('/dashboard')}>
              <span className="text-2xl text-idea-accent">🧠</span> IDEA NFEs
            </div>
          ) : (
            <span className="text-2xl cursor-pointer text-idea-accent" onClick={() => navigate('/dashboard')}>🧠</span>
          )}
        </div>

        {/* Menu Links */}
        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const isAtivo = location.pathname === item.rota;
            return (
              <button
                key={item.rota}
                onClick={() => navigate(item.rota)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors whitespace-nowrap
                  ${isAtivo 
                    ? 'bg-idea-accent text-white font-bold shadow-md' 
                    : 'text-gray-300 hover:bg-idea-base hover:text-white'
                  }`}
              >
                <span className="text-xl">{item.icone}</span>
                {menuAberto && <span>{item.nome}</span>}
              </button>
            );
          })}
        </nav>

        {/* Botão Sair */}
        <div className="p-4 border-t border-idea-base">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <span className="text-xl">🚪</span>
            {menuAberto && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
        
        {/* TOPBAR */}
        <header className="h-20 bg-white shadow-sm flex items-center justify-between px-8 shrink-0 z-10">
          <button 
            onClick={() => setMenuAberto(!menuAberto)}
            className="text-gray-500 hover:text-idea-accent focus:outline-none p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-idea-dark">Matheus Jardim</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-idea-light border-2 border-idea-accent flex items-center justify-center text-idea-dark font-bold shadow-sm">
              MJ
            </div>
          </div>
        </header>

        {/* CONTEÚDO DINÂMICO DAS PÁGINAS RENDERIZA AQUI */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </div>
      </main>
      
    </div>
  );
}