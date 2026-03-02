import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate('/dashboard'); // Só passa se o Firebase der o OK!
    } catch (error) {
      setErro('E-mail ou senha inválidos!'); // Trava o usuário
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border p-8">
        <h1 className="text-3xl font-extrabold text-center mb-6">IdeaNFS</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          {erro && <div className="bg-red-50 text-red-600 p-3 rounded text-center font-bold">{erro}</div>}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required className="w-full p-3 border rounded focus:ring-2 outline-none" />
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Senha" required className="w-full p-3 border rounded focus:ring-2 outline-none" />
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700">Entrar</button>
        </form>
      </div>
    </div>
  );
}