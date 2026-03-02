import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import CadastroClientes from './pages/CadastroClientes';
import CadastroProdutos from './pages/CadastroProdutos';
import EmitirNota from './pages/EmitirNota';
import Configuracoes from './pages/Configuracoes'; // <-- Importação da nova tela

// ==========================================
// TELA DO DASHBOARD (MENU PRINCIPAL)
// ==========================================
function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800">Menu Principal</h1>
          <button onClick={() => navigate('/')} className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors">
            Sair da conta
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button onClick={() => navigate('/clientes')} className="bg-white p-8 rounded-xl shadow border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all font-bold text-lg flex flex-col items-center gap-4 text-center">
            <span className="text-4xl">👥</span>
            Clientes
          </button>
          
          <button onClick={() => navigate('/produtos')} className="bg-white p-8 rounded-xl shadow border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all font-bold text-lg flex flex-col items-center gap-4 text-center">
            <span className="text-4xl">📦</span>
            Serviços
          </button>

          <button onClick={() => navigate('/configuracoes')} className="bg-white p-8 rounded-xl shadow border border-purple-200 hover:border-purple-500 hover:shadow-md transition-all font-bold text-lg flex flex-col items-center gap-4 text-center">
            <span className="text-4xl">⚙️</span>
            Minha Empresa
          </button>
          
          <button onClick={() => navigate('/emitir-nota')} className="bg-white p-8 rounded-xl shadow border border-green-200 hover:border-green-500 hover:shadow-md transition-all font-bold text-lg text-green-700 flex flex-col items-center gap-4 text-center">
            <span className="text-4xl">📄</span>
            Emitir Nota
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ROTEADOR PRINCIPAL (MAPEAMENTO DAS TELAS)
// ==========================================
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientes" element={<CadastroClientes />} />
        <Route path="/produtos" element={<CadastroProdutos />} />
        <Route path="/emitir-nota" element={<EmitirNota />} />
        
        {/* <-- ROTA NOVA ADICIONADA AQUI DENTRO DO BLOCO ROUTES --> */}
        <Route path="/configuracoes" element={<Configuracoes />} /> 
      </Routes>
    </BrowserRouter>
  );
}