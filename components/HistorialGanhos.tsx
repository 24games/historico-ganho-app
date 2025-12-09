'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Bot } from 'lucide-react';
import { useMemo } from 'react';

interface GanhoItem {
  id: string;
  fecha: string;
  hora: string;
  ganancia: number;
}

// Função para gerar número aleatório entre min e max (não redondo)
const generarNumeroAleatorio = (min: number, max: number): number => {
  // Gera números "quebrados" adicionando variação aleatória
  const base = Math.floor(Math.random() * (max - min + 1)) + min;
  const variacao = Math.floor(Math.random() * 999); // Adiciona até 999 para tornar não redondo
  return base + variacao;
};

// Função para formatar número em CLP (Chile) com ponto como separador de milhar
const formatearCLP = (valor: number): string => {
  return `$${valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

// Função para gerar horários decrescentes a partir do horário atual
const generarHorarios = (cantidad: number): string[] => {
  const ahora = new Date();
  const horarios: string[] = [];
  
  for (let i = 0; i < cantidad; i++) {
    const minutosAtras = i * 2 + Math.floor(Math.random() * 3); // 2-4 minutos entre cada
    const fecha = new Date(ahora.getTime() - minutosAtras * 60000);
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    horarios.push(`${horas}:${minutos}`);
  }
  
  return horarios;
};

// Função para gerar dados mock
const generarDatosMock = (cantidad: number = 40): GanhoItem[] => {
  const horarios = generarHorarios(cantidad);
  const datos: GanhoItem[] = [];
  
  horarios.forEach((hora, index) => {
    // Gerar valor entre 10.000 e 80.000 CLP (não redondo)
    const ganancia = generarNumeroAleatorio(10000, 80000);
    
    datos.push({
      id: `ganho-${index}`,
      fecha: 'Hoy',
      hora: hora,
      ganancia: ganancia,
    });
  });
  
  return datos;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function HistorialGanhos() {
  const datos = useMemo(() => generarDatosMock(45), []);

  return (
    <div className="w-full min-h-screen bg-dark-bg py-8 px-4">
      {/* Header da Seção */}
      <div className="mb-6 sticky top-0 bg-dark-bg z-10 pb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-3">
          Historial de Análisis de la I.A.
        </h2>
        <div className="h-1 w-24 bg-neon-green mx-auto rounded-full shadow-neon"></div>
      </div>

      {/* Lista Scrollável */}
      <div className="max-w-md mx-auto">
        <motion.div
          className="space-y-3 max-h-[75vh] overflow-y-auto pr-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {datos.map((item, index) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className="bg-card-bg rounded-lg p-4 border border-gray-800/50 hover:border-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-neon-green/10 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Esquerda - Data/Hora */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {index % 3 === 0 ? (
                      <Bot className="w-5 h-5 text-neon-green drop-shadow-[0_0_8px_rgba(0,255,0,0.6)]" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-neon-green drop-shadow-[0_0_8px_rgba(0,255,0,0.6)]" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-200">
                        {item.fecha}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {item.hora}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direita - Lucro */}
                <div className="flex items-center">
                  <span 
                    className="text-2xl md:text-3xl font-bold text-neon-green"
                    style={{
                      textShadow: '0 0 10px rgba(0, 255, 0, 0.8), 0 0 20px rgba(0, 255, 0, 0.5), 0 0 30px rgba(0, 255, 0, 0.3)',
                      filter: 'drop-shadow(0 0 8px rgba(0, 255, 0, 0.6))',
                    }}
                  >
                    +{formatearCLP(item.ganancia)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

