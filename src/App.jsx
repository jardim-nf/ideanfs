import { useState, useEffect } from 'react';
import EmitirNota from './pages/EmitirNota';
// Importando as ferramentas do Firebase
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

function App() {
  const [telaAtual, setTelaAtual] = useState('login');
  
  // Estados para o formulário de login
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erroLogin, setErroLogin] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Fica observando se o usuário já está logado (para não pedir senha se ele atualizar a página)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setTelaAtual('dashboard');
      } else {
        setTelaAtual('login');
      }
    });
    return () => unsubscribe();
  }, []);

  // Função REAL de Login no Firebase
  const handleLogin = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErroLogin('');

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      // Se der certo, o onAuthStateChanged ali em cima já muda a tela para o dashboard
    } catch (error) {
      console.error("Erro no login:", error.code);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErroLogin('E-mail ou senha incorretos.');
      } else {
        setErroLogin('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  // Função REAL de Logout no Firebase
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setTelaAtual('login');
      setEmail('');
      setSenha('');
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

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
        
        <form onSubmit={handleLogin} className="space-y-5">
          {erroLogin && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-semibold border border-red-100">
              {erroLogin}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="admin@ideianfs.com.br" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={carregando} 
            className={`w-full text-white font-bold py-3 rounded-lg transition-colors shadow-md mt-4 ${carregando ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {carregando ? 'Entrando...' : 'Entrar no Sistema'}
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
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-sm">IN</div>
          <h1 className="text-xl font-extrabold text-gray-800">IdeaNFS</h1>
        </div>
        <button onClick={handleLogout} className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors">
          Sair da conta
        </button>
      </header>
      
      <main className="max-w-6xl mx-auto p-8 mt-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 border-l-4 border-blue-600 pl-3">Visão Geral</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button onClick={() => alert('Em breve vamos criar a tela de Clientes!')} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-400 transition-all flex flex-col items-center justify-center gap-4 group">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl group-hover:bg-blue-600 group-hover:text-white transition-colors">👥</div>
            <h3 className="text-lg font-bold text-gray-700 group-hover:text-blue-600">Cadastro de Clientes</h3>
          </button>
          <button onClick={() => alert('Em breve vamos criar a tela de Produtos!')} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-400 transition-all flex flex-col items-center justify-center gap-4 group">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl group-hover:bg-blue-600 group-hover:text-white transition-colors">📦</div>
            <h3 className="text-lg font-bold text-gray-700 group-hover:text-blue-600">Cadastro de Produtos</h3>
          </button>
          <button onClick={() => setTelaAtual('emitir-nota')} className="bg-white p-8 rounded-xl shadow-sm border border-green-200 hover:shadow-md hover:border-green-500 transition-all flex flex-col items-center justify-center gap-4 group">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-3xl group-hover:bg-green-600 group-hover:text-white transition-colors">📄</div>
            <h3 className="text-lg font-bold text-gray-700 group-hover:text-green-600">Emissão de Nota</h3>
          </button>
        </div>
      </main>
    </div>
  );

  return (
    <>
      {telaAtual === 'login' && renderLogin()}
      {telaAtual === 'dashboard' && renderDashboard()}
      {telaAtual === 'emitir-nota' && (
        <div className="bg-gray-100 min-h-screen">
          <div className="max-w-5xl mx-auto pt-6 px-8">
            <button onClick={() => setTelaAtual('dashboard')} className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-2 transition-colors">
              ← Voltar para o Menu Principal
            </button>
          </div>
          <EmitirNota />
        </div>
      )}
    </>
  );
}

export default App;