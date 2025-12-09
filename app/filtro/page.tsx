'use client';

import { motion } from 'framer-motion';
import { Calendar, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

interface DatosDia {
  dia: number;
  fecha: string;
  ganancia: number;
  acumulado: number;
}

// Função para gerar dados dos últimos 14 dias com variações realistas
const generarDatos14Dias = (): DatosDia[] => {
  const datos: DatosDia[] = [];
  const hoy = new Date();
  let acumulado = 0;
  
  // Valor total objetivo: ~26 milhões CLP (número quebrado)
  // Gerar um número quebrado entre 26.000.000 e 26.999.999
  const totalObjetivo = 26000000 + Math.floor(Math.random() * 999999);
  
  // Base diária média
  const baseDiaria = totalObjetivo / 14;
  
  // Padrão de variação para criar um gráfico mais realista
  // Simular dias bons e ruins de forma inteligente
  const patrones = [
    { factor: 1.3, tipo: 'excelente' }, // Dia excelente
    { factor: 1.1, tipo: 'bueno' },    // Dia bom
    { factor: 0.9, tipo: 'regular' },    // Dia regular
    { factor: 0.7, tipo: 'bajo' },      // Dia baixo
    { factor: 1.2, tipo: 'bueno' },     // Dia bom
    { factor: 0.8, tipo: 'regular' },   // Dia regular
    { factor: 1.4, tipo: 'excelente' }, // Dia excelente
    { factor: 1.0, tipo: 'normal' },    // Dia normal
    { factor: 0.9, tipo: 'regular' },   // Dia regular
    { factor: 1.1, tipo: 'bueno' },     // Dia bom
    { factor: 0.85, tipo: 'regular' },  // Dia regular
    { factor: 1.25, tipo: 'excelente' }, // Dia excelente
    { factor: 1.05, tipo: 'bueno' },    // Dia bom
    { factor: 1.15, tipo: 'bueno' },   // Dia bom (último dia)
  ];
  
  for (let i = 13; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - i);
    
    const indice = 13 - i;
    const patron = patrones[indice];
    
    // Aplicar padrão com pequena variação aleatória adicional (±5%)
    const variacionAleatoria = (Math.random() - 0.5) * 0.1; // ±5%
    const gananciaDia = Math.floor(baseDiaria * patron.factor * (1 + variacionAleatoria));
    
    // Adicionar variação extra para tornar mais quebrado
    const variacionExtra = Math.floor(Math.random() * 5000) - 2500; // ±2500
    const gananciaFinal = Math.max(gananciaDia + variacionExtra, Math.floor(baseDiaria * 0.5));
    
    acumulado += gananciaFinal;
    
    // Formato de data
    const diaMes = fecha.getDate();
    const mes = fecha.toLocaleDateString('es-CL', { month: 'short' });
    
    datos.push({
      dia: indice + 1,
      fecha: `${diaMes} ${mes}`,
      ganancia: gananciaFinal,
      acumulado: acumulado,
    });
  }
  
  // Ajustar o último valor para garantir que seja próximo do total objetivo
  const diferencia = totalObjetivo - acumulado;
  if (datos.length > 0 && Math.abs(diferencia) > 1000) {
    datos[datos.length - 1].ganancia += diferencia;
    datos[datos.length - 1].acumulado = totalObjetivo;
  } else if (datos.length > 0) {
    // Se a diferença for pequena, ajustar o acumulado
    datos[datos.length - 1].acumulado = totalObjetivo;
  }
  
  return datos;
};

// Função para formatar CLP
const formatearCLP = (valor: number): string => {
  return `$${valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

// Componente de Gráfico
const GraficoLinea = ({ datos }: { datos: DatosDia[] }) => {
  const width = 100;
  const height = 60;
  const padding = 8;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  // Encontrar min e max para normalizar
  const valores = datos.map(d => d.acumulado);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const range = max - min || 1;
  
  // Gerar pontos do gráfico
  const puntos = datos.map((dato, index) => {
    const x = padding + (index / (datos.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((dato.acumulado - min) / range) * chartHeight;
    return { x, y, valor: dato.acumulado };
  });
  
  // Gerar path da linha
  const pathD = puntos
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
  
  return (
    <div className="w-full h-32 md:h-40 relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Gradiente para a linha */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00FF00" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00FF00" stopOpacity="0.4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Linha do gráfico */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        
        {/* Pontos do gráfico */}
        {puntos.map((punto, index) => (
          <circle
            key={index}
            cx={punto.x}
            cy={punto.y}
            r="2"
            fill="#00FF00"
            className="drop-shadow-[0_0_4px_rgba(0,255,0,0.8)]"
          />
        ))}
      </svg>
    </div>
  );
};

export default function FiltroPage() {
  const datos = useMemo(() => generarDatos14Dias(), []);
  const total = datos[datos.length - 1]?.acumulado || 0;

  return (
    <div className="w-full min-h-screen bg-dark-bg py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header com Filtros */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <h1 className="text-xl md:text-2xl font-semibold text-white">
              Resumen de Ganancias
            </h1>
            
            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-card-bg border border-gray-800 rounded-lg text-sm text-gray-300 hover:border-gray-700 hover:text-white transition-all duration-200">
                Últimos 14 días
              </button>
              <button className="px-4 py-2 bg-card-bg border border-gray-800 rounded-lg text-sm text-gray-300 hover:border-gray-700 hover:text-white transition-all duration-200">
                Principales juegos
              </button>
            </div>
          </div>
        </div>

        {/* Card Principal com Total */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card-bg rounded-lg p-6 border border-gray-800/50"
        >
          <div className="space-y-4">
            {/* Total */}
            <div>
              <p className="text-sm text-gray-400 mb-2">Total acumulado</p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className="text-3xl md:text-4xl font-bold text-neon-green"
                  style={{
                    textShadow: '0 0 10px rgba(0, 255, 0, 0.8), 0 0 20px rgba(0, 255, 0, 0.5)',
                    filter: 'drop-shadow(0 0 8px rgba(0, 255, 0, 0.6))',
                  }}
                >
                  {formatearCLP(total)}
                </span>
                <span className="text-lg md:text-xl font-semibold text-gray-300">CLP</span>
                <TrendingUp className="w-5 h-5 text-neon-green" />
              </div>
            </div>

            {/* Gráfico */}
            <div className="pt-4">
              <GraficoLinea datos={datos} />
            </div>
          </div>
        </motion.div>

        {/* Botão Mostrar Resumen del Mes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <button className="w-full px-6 py-4 bg-card-bg border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-900/50 transition-all duration-300 flex items-center justify-center gap-3 group">
            <Calendar className="w-5 h-5 text-gray-400 group-hover:text-neon-green transition-colors" />
            <span className="text-base font-medium text-gray-300 group-hover:text-white transition-colors">
              Mostrar resumen del mes
            </span>
          </button>
        </motion.div>

        {/* Detalle por Día - Lista completa dos 14 dias */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card-bg rounded-lg p-4 border border-gray-800/50"
        >
          <p className="text-sm text-gray-400 mb-3">Evolución diaria</p>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {datos.map((dato, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.02 }}
                className="flex items-center justify-between py-2.5 border-b border-gray-800/30 last:border-0 hover:bg-gray-900/30 rounded px-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-green drop-shadow-[0_0_4px_rgba(0,255,0,0.6)]"></div>
                  <span className="text-sm font-medium text-gray-300">{dato.fecha}</span>
                </div>
                <span className="text-sm font-semibold text-neon-green">
                  +{formatearCLP(dato.ganancia)}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}


