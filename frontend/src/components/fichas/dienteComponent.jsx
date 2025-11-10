import React from 'react';
import styles from './dienteComponent.module.css';

function DienteComponent({ carasTratadas = [], extraido = false, esSuperior = true }) {
  
  if (extraido) {
    return (
      <div className={styles.diente}>
        <svg viewBox="0 0 50 50" className={styles.svg}>
          {/* Cuadrado del diente */}
          <rect x="5" y="5" width="40" height="40" 
                fill="white" 
                stroke="black" 
                strokeWidth="1.5" />
          
          {/* X roja para extraído */}
          <line x1="5" y1="5" x2="45" y2="45" 
                stroke="#f44336" 
                strokeWidth="3" />
          <line x1="5" y1="45" x2="45" y2="5" 
                stroke="#f44336" 
                strokeWidth="3" />
        </svg>
      </div>
    );
  }

  // Determinar colores de cada cara
  const colorNormal = 'white';
  const colorTratado = '#4A90E2';
  
  const colorOclusal = carasTratadas.includes(1) ? colorTratado : colorNormal;
  const colorVestibular = carasTratadas.includes(2) ? colorTratado : colorNormal;
  const colorPalatino = carasTratadas.includes(3) ? colorTratado : colorNormal;
  const colorMesial = carasTratadas.includes(4) ? colorTratado : colorNormal;
  const colorDistal = carasTratadas.includes(5) ? colorTratado : colorNormal;

  // Puntos para cuadrado central (más pequeño)
  const centroMargen = 10; // Margen desde el borde del diente
  
  return (
    <div className={styles.diente}>
      <svg viewBox="0 0 50 50" className={styles.svg}>
        {/* Cuadrado exterior */}
        <rect x="5" y="5" width="40" height="40" 
              fill="none" 
              stroke="black" 
              strokeWidth="1.5" />
        
        {esSuperior ? (
          <>
            {/* DIENTES SUPERIORES */}
            
            {/* Vestibular (arriba) - Trapecio superior */}
            <polygon 
              points="5,45 45,45 35,15 15,15" 
              fill={colorVestibular}
              stroke="black" 
              strokeWidth="1" 
            />
            
            {/* Palatino (abajo) - Trapecio inferior */}
            <polygon 
              points="5,5 15,35 35,35 45,5" 
              fill={colorPalatino}
              stroke="black" 
              strokeWidth="1" 
            />
            
            {/* Mesial (izquierda) - Trapecio izquierdo */}
            <polygon 
              points="5,5 5,45 15,35 15,15" 
              fill={colorMesial}
              stroke="black" 
              strokeWidth="1" 
            />
            
            {/* Distal (derecha) - Trapecio derecho */}
            <polygon 
              points="45,5 35,15 35,35 45,45" 
              fill={colorDistal}
              stroke="black" 
              strokeWidth="1" 
            />
          </>
        ) : (
          <>
            {/* DIENTES INFERIORES */}
            
            {/* Palatino/Lingual (arriba) - Trapecio superior */}
            <polygon 
              points="5,45 45,45 35,15 15,15" 
              fill={colorPalatino}
              stroke="black" 
              strokeWidth="1" 
            />
            
            {/* Vestibular (abajo) - Trapecio inferior */}
            <polygon 
              points="5,5 15,35 35,35 45,5" 
              fill={colorVestibular}
              stroke="black" 
              strokeWidth="1" 
            />
            
            {/* Mesial (izquierda) - Trapecio izquierdo */}
            <polygon 
              points="5,5 5,45 15,35 15,15" 
              fill={colorMesial}
              stroke="black" 
              strokeWidth="1" 
            />
            
            {/* Distal (derecha) - Trapecio derecho */}
            <polygon 
              points="45,5 35,15 35,35 45,45" 
              fill={colorDistal}
              stroke="black" 
              strokeWidth="1" 
            />
          </>
        )}
        
        {/* Oclusal/Incisal (centro - cuadrado) - Siempre al final para que esté arriba */}
        <rect 
          x="15" 
          y="15" 
          width="20" 
          height="20" 
          fill={colorOclusal}
          stroke="black" 
          strokeWidth="1" 
        />
      </svg>
    </div>
  );
}

export default DienteComponent;