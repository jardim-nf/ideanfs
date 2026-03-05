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

  // 1. SINCRONIZAR (MANTIDA LÓGICA)
  const handleSincronizar = async (idIntegracao) => {
    setLoadingId(idIntegracao);
    try {
      const urlBackend = "https://us-central1-ideanfe.cloudfunctions.net/consultarNotaPlugnotas";
      const response = await axios.post(urlBackend, { idIntegracao });
      const { situacao } = response.data;
      
      if (situacao === 'SEM_ID') {
        alert("⚠️ Nota antiga detectada. Reenvie para gerar novo ID.");
      } else {
        alert(`Status atualizado: ${situacao}`);
      }
      buscarNotas();
    } catch (error) {
      alert("❌ Erro ao sincronizar.");
    } finally {
      setLoadingId(null);
    }
  };

  // 2. DOWNLOAD COM CABEÇALHO (O que resolve o erro do Token)
  const baixarDiretoDaApi = async (url, tipo, plugnotasId) => {
    setLoadingId(`${plugnotasId}-${tipo}`);
    try {
      const response = await axios.get(url, {
        headers: { "X-API-KEY": "7a1c5954ca39092ba5fd7b390755c5fa" },
        responseType: 'blob'
      });

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `Nota_${plugnotasId}.${tipo}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

    } catch (error) {
      alert("❌ Erro ao baixar arquivo.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="animate-fade-in-up">
      
      {/* HEADER DA TELA */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-idea-dark tracking-tight">Histórico de Notas</h2>
        <p className="text-idea-base/60 font-medium mt-1">Gerencie, baixe e monitore todas as suas NFS-e emitidas.</p>
      </div>

      {/* TABELA ESTILIZADA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-idea-dark text-white">
              <tr>
                <th className="p-5 text-xs font-black uppercase tracking-widest">ID Integração</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest">Cliente / Tomador</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest">Status</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {notas.map(nota => {
                const status = nota.status || 'PROCESSANDO';
                const isAutorizada = status === 'CONCLUIDO' || status === 'AUTORIZADA';
                const isRejeitada = status === 'ERRO' || status === 'REJEITADA';

                return (
                  <tr key={nota.id} className="hover:bg-idea-light/30 transition-colors group">
                    <td className="p-5">
                      <span className="text-xs font-mono text-idea-base/70 bg-gray-100 px-2 py-1 rounded">{nota.id}</span>
                    </td>
                    <td className="p-5">
                      <p className="text-idea-dark font-black text-base">{nota.dadosFormulario?.razaoSocialTomador || '---'}</p>
                      <p className="text-xs text-idea-base/50 font-bold">{nota.dadosFormulario?.cpfCnpjTomador}</p>
                    </td>
                    <td className="p-5">
                      {isAutorizada && (
                        <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-black bg-green-100 text-green-700">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> AUTORIZADA
                        </span>
                      )}
                      {isRejeitada && (
                        <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-black bg-red-100 text-red-700">
                          ⚠️ REJEITADA
                        </span>
                      )}
                      {!isAutorizada && !isRejeitada && (
                        <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-black bg-amber-100 text-amber-700">
                          ⏳ {status}
                        </span>
                      )}
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center gap-2">
                        {isAutorizada ? (
                          <>
                            <button 
                              onClick={() => baixarDiretoDaApi(nota.linkPdf, 'pdf', nota.plugnotasId)}
                              className="bg-idea-light text-idea-dark hover:bg-idea-accent hover:text-white p-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 font-bold text-xs"
                            >
                              {loadingId === `${nota.plugnotasId}-pdf` ? '...' : '📄 PDF'}
                            </button>
                            <button 
                              onClick={() => baixarDiretoDaApi(nota.linkXml, 'xml', nota.plugnotasId)}
                              className="bg-idea-light text-idea-dark hover:bg-idea-base hover:text-white p-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 font-bold text-xs"
                            >
                              {loadingId === `${nota.plugnotasId}-xml` ? '...' : '🧑‍💻 XML'}
                            </button>
                          </>
                        ) : isRejeitada ? (
                          <button 
                            onClick={() => navigate(`/emitir-nota?reprocessar=${nota.id}`)}
                            className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-red-700 shadow-md transition-all"
                          >
                            Corrigir e Reenviar
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleSincronizar(nota.id)}
                            className="bg-idea-accent text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-idea-base shadow-md transition-all"
                          >
                            {loadingId === nota.id ? 'Sincronizando...' : '🔄 Atualizar Status'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {notas.length === 0 && (
            <div className="p-20 text-center">
              <span className="text-6xl block mb-4">📭</span>
              <p className="text-idea-dark font-black text-xl">Nenhuma nota encontrada.</p>
              <p className="text-gray-400">Suas emissões aparecerão aqui assim que você começar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}