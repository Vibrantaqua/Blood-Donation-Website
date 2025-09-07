import React from 'react';
import { Connection, Note } from '../types';
import useStore from '../store/useStore';

interface ConnectionLayerProps {
  connections: Connection[];
  notes: Note[];
  onDeleteConnection: (id: string) => void;
}

const ConnectionLayer: React.FC<ConnectionLayerProps> = ({ 
  connections, 
  notes, 
  onDeleteConnection 
}) => {
  const { zoom, pan } = useStore();

  const getNoteCenter = (noteId: string) => {
    const note = notes.find(n => n._id === noteId);
    if (!note) return { x: 0, y: 0 };
    return {
      x: note.x + note.width / 2,
      y: note.y + note.height / 2
    };
  };

  const createCurvePath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Add some randomness for organic feel
    const curvature = Math.min(distance * 0.3, 100);
    const angle = Math.atan2(dy, dx);
    const perpAngle = angle + Math.PI / 2;
    
    const midX = from.x + dx / 2;
    const midY = from.y + dy / 2;
    
    const offsetX = Math.cos(perpAngle) * curvature * (0.5 - Math.random());
    const offsetY = Math.sin(perpAngle) * curvature * (0.5 - Math.random());
    
    const controlX = midX + offsetX;
    const controlY = midY + offsetY;

    return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        width: '100vw',
        height: '100vh',
        transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
        overflow: 'visible'
      }}
    >
      <defs>
        <pattern id="yarn-texture" patternUnits="userSpaceOnUse" width="4" height="4">
          <rect width="4" height="4" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1,1" opacity="0.3"/>
        </pattern>
      </defs>
      
      {connections.map((connection) => {
        const from = getNoteCenter(connection.from);
        const to = getNoteCenter(connection.to);
        const path = createCurvePath(from, to);
        
        return (
          <g key={connection._id}>
            {/* Invisible thick line for easier clicking */}
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth="12"
              className="pointer-events-auto cursor-pointer"
              onClick={() => onDeleteConnection(connection._id)}
            />
            
            {/* Visible yarn-like connection */}
            <path
              d={path}
              fill="none"
              stroke={connection.meta?.color || '#8B5CF6'}
              strokeWidth="3"
              strokeDasharray="2,1"
              strokeLinecap="round"
              className="drop-shadow-sm"
              style={{ filter: 'url(#yarn-texture)' }}
            />
            
            {/* Connection label */}
            {connection.meta?.label && (
              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2 - 8}
                textAnchor="middle"
                className="fill-current text-xs font-medium"
                style={{ color: connection.meta.color || '#8B5CF6' }}
              >
                {connection.meta.label}
              </text>
            )}
            
            {/* Start pin */}
            <circle
              cx={from.x}
              cy={from.y}
              r="3"
              fill={connection.meta?.color || '#8B5CF6'}
              className="drop-shadow-sm"
            />
            
            {/* End pin */}
            <circle
              cx={to.x}
              cy={to.y}
              r="3"
              fill={connection.meta?.color || '#8B5CF6'}
              className="drop-shadow-sm"
            />
          </g>
        );
      })}
    </svg>
  );
};

export default ConnectionLayer;