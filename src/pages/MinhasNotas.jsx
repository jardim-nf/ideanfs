import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function MinhasNotas() {
  const [notas, setNotas] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    buscarNotas();
  }, []);

  const buscarNotas = async () => {
    const q = query(collection(db, "notas_emitidas"), orderBy("dataEmissao", "desc"));
    const snap = await getDocs(q);
    setNotas(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // 1. CHAMA O BACKEND PARA ATUALIZAR STATUS E PEGAR LINKS
  const handleSincronizar = async (idIntegracao) => {
    setLoadingId(idIntegracao);
    try {
      const urlBackend = "https://us-central1-ideanfe.cloudfunctions.net/consultarNotaPlugnotas";
      const response = await axios.post(urlBackend, { idIntegracao });
      const { situacao, pdf } = response.data;
      
      if (situacao === 'AUTORIZADA' && pdf) {
        alert("✅ Nota Atualizada! Status: AUTORIZADA");
      } else if (situacao === 'REJEITADA') {
        alert("A nota foi rejeitada. Verifique os dados e tente corrigir.");
      } else {
        alert(`Status atual: ${situacao}`);
      }
      buscarNotas(); // Recarrega a tela
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
      alert("❌ Erro ao consultar a nota. Verifique os logs.");
    } finally {
      setLoadingId(null);
    }
    if (situacao === 'SEM_ID') {
        alert("⚠️ Essa nota é de um teste antigo e não pode ser sincronizada. Clique em 'Corrigir e Reenviar' para gerar uma nova com o ID correto.");
      } else if (situacao === 'AUTORIZADA' && pdf) {
        alert("✅ Nota Atualizada! Status: AUTORIZADA");
      } else if (situacao === 'REJEITADA') {
        alert("A nota foi rejeitada. Verifique os dados e tente corrigir.");
      } else {
        alert(`Status atual: ${situacao}`);
      }
  };

  // 2. CHAMA O BACKEND PARA CANCELAR A NOTA
  const handleCancelar = async (nota) => {
    if (!nota.plugnotasId) {
      alert("⚠️ Clique em 'Atualizar Status' primeiro para capturar o ID da nota.");
      return;
    }
    const motivo = window.prompt("Qual o motivo do cancelamento?");
    if (!motivo) return;

    setLoadingId(nota.id + '-cancel');
    try {
      const urlBackend = "https://us-central1-ideanfe.cloudfunctions.net/cancelarNotaPlugnotas";
      await axios.post(urlBackend, { 
        idIntegracao: nota.id, 
        plugnotasId: nota.plugnotasId,
        motivo: motivo 
      });
      alert("✅ Solicitação de cancelamento enviada!");
      buscarNotas();
    } catch (error) {
      console.error("Erro ao cancelar:", error);
      alert("❌ Erro ao tentar cancelar a nota.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Histórico de Notas</h2>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold uppercase text-gray-500">ID Integração</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-500">Cliente</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-500">Status</th>
              <th className="p-4 text-xs font-bold uppercase text-center text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {notas.map(nota => {
              const status = nota.status || 'PROCESSANDO';
              const isAutorizada = status === 'CONCLUIDO' || status === 'AUTORIZADA';
              const isRejeitada = status === 'ERRO' || status === 'REJEITADA';
              const isProcessando = status === 'PROCESSANDO' || status === 'PROCESSAMENTO';
              const isCancelando = status === 'CANCELAMENTO_SOLICITADO' || status === 'CANCELADA';

              return (
                <tr key={nota.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-xs text-gray-500">{nota.id}</td>
                  <td className="p-4 text-sm font-bold text-gray-800">{nota.dadosFormulario?.razaoSocialTomador || 'Desconhecido'}</td>
                  
                  <td className="p-4 text-xs font-bold uppercase">
                    {isAutorizada && <span className="text-green-700 bg-green-100 px-2 py-1 rounded">AUTORIZADA</span>}
                    {isRejeitada && <span className="text-red-700 bg-red-100 px-2 py-1 rounded">REJEITADA</span>}
                    {isProcessando && <span className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded">PROCESSANDO</span>}
                    {isCancelando && <span className="text-gray-700 bg-gray-200 px-2 py-1 rounded">{status}</span>}
                  </td>
                  
                  <td className="p-4 flex flex-wrap justify-center gap-2">
                    {/* AÇÕES PARA NOTA AUTORIZADA */}
                    {isAutorizada ? (
                      <>
                        <button 
                          onClick={() => nota.linkPdf ? window.open(nota.linkPdf, '_blank') : handleSincronizar(nota.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold transition-all"
                        >
                          {loadingId === nota.id ? '⏳' : '📄 PDF'}
                        </button>
                        <button 
                          onClick={() => nota.linkXml ? window.open(nota.linkXml, '_blank') : handleSincronizar(nota.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-bold transition-all"
                        >
                          {loadingId === nota.id ? '⏳' : '🧑‍💻 XML'}
                        </button>
                        <button 
                          onClick={() => handleCancelar(nota)}
                          className="bg-gray-800 hover:bg-black text-white px-3 py-1 rounded text-xs font-bold transition-all"
                        >
                          {loadingId === nota.id + '-cancel' ? '⏳' : '🚫 Cancelar'}
                        </button>
                      </>
                    ) 
                    /* AÇÕES PARA NOTA REJEITADA */
                    : isRejeitada ? (
                      <button 
                        onClick={() => navigate(`/emitir-nota?reprocessar=${nota.id}`)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-xs font-bold transition-all"
                      >
                        Corrigir e Reenviar
                      </button>
                    ) 
                    /* AÇÕES PARA PROCESSANDO OU CANCELANDO */
                    : (
                      <button 
                        onClick={() => handleSincronizar(nota.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs font-bold transition-all shadow-sm"
                      >
                        {loadingId === nota.id ? 'Sincronizando...' : '🔄 Atualizar Status'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}