import { useState, useRef, useEffect } from 'react';
import { SERVICOS_LC116 } from '../utils/listaServicos';

export default function BuscaServico({ valor, aoSelecionar }) {
  // Inicializa o termo, mas agora temos o useEffect para monitorar mudanças externas
  const [termo, setTermo] = useState(""); 
  const [opcoes, setOpcoes] = useState([]);
  const [aberto, setAberto] = useState(false);
  const dropdownRef = useRef(null);

  // ✨ MÁGICA DA SINCRONIZAÇÃO:
  // Este efeito roda sempre que a "prop" valor mudar (ex: ao carregar nota antiga)
  useEffect(() => {
    if (valor) {
      // Se o valor for apenas o código limpo (ex: 170601), tenta achar a descrição completa na lista
      const servicoEncontrado = SERVICOS_LC116.find(
        (s) => s.codigo.replace(/\D/g, '') === valor.toString().replace(/\D/g, '')
      );
      
      if (servicoEncontrado) {
        setTermo(servicoEncontrado.descricao);
      } else {
        setTermo(valor); // Caso não ache na lista, coloca o que veio (segurança)
      }
    } else {
      setTermo(""); // Se o valor for limpo externamente, limpa o campo
    }
  }, [valor]);

  // Fecha a lista se clicar fora dela
  useEffect(() => {
    const handleClickFora = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAberto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const handleMudarTexto = (e) => {
    const digitado = e.target.value;
    setTermo(digitado);
    
    if (digitado.length > 1) {
      // Filtra a lista ignorando maiúsculas/minúsculas e acentos
      const filtrados = SERVICOS_LC116.filter(servico => 
        servico.descricao.toLowerCase().includes(digitado.toLowerCase()) ||
        servico.codigo.includes(digitado)
      );
      setOpcoes(filtrados);
      setAberto(true);
    } else {
      setAberto(false);
    }
  };

  const handleSelecionar = (servico) => {
    setTermo(servico.descricao); 
    setAberto(false);
    
    // O Plugnotas precisa do código limpo (ex: 010401)
    const codigoLimpo = servico.codigo.replace(/\D/g, ''); 
    aoSelecionar(codigoLimpo); 
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
        Cód. LC 116 (Serviço) *
      </label>
      <input
        type="text"
        value={termo}
        onChange={handleMudarTexto}
        placeholder="Digite o código ou nome (ex: programa)"
        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        autoComplete="off"
      />
      
      {/* DROPDOWN DE OPÇÕES */}
      {aberto && opcoes.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-xl max-h-60 overflow-y-auto">
          {opcoes.map((servico) => (
            <li
              key={servico.codigo}
              onClick={() => handleSelecionar(servico)}
              className="p-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-0"
            >
              <span className="font-bold text-blue-600">{servico.codigo}</span> - {servico.descricao.split(' - ')[1]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}