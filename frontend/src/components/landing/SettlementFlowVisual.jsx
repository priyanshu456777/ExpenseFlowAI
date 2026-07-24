import { motion } from 'framer-motion';

/**
 * The signature visual for ExpenseFlow AI's landing page.
 * Depicts the core value proposition literally: a messy web of individual
 * debts (A owes B, B owes C, C owes D...) animates into resolving as a
 * single collapsed arrow — the Smart Settlement Engine made visible.
 */
const nodes = [
  { id: 'A', x: 60, y: 40, label: 'Aisha' },
  { id: 'B', x: 260, y: 20, label: 'Ben' },
  { id: 'C', x: 340, y: 160, label: 'Chen' },
  { id: 'D', x: 120, y: 220, label: 'Dev' },
];

const messyEdges = [
  { from: 'A', to: 'B', amount: '₹450' },
  { from: 'B', to: 'C', amount: '₹220' },
  { from: 'C', to: 'D', amount: '₹300' },
  { from: 'D', to: 'A', amount: '₹90' },
];

const getNode = (id) => nodes.find((n) => n.id === id);

const SettlementFlowVisual = () => {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3]">
      <svg viewBox="0 0 400 300" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="edgeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id="finalGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#818CF8" />
          </marker>
          <marker id="arrowheadFinal" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#34D399" />
          </marker>
        </defs>

        {/* Messy phase: 4 individual debts, fade out */}
        <motion.g
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 5, repeat: Infinity, times: [0, 0.4, 0.55, 1] }}
        >
          {messyEdges.map((edge, i) => {
            const from = getNode(edge.from);
            const to = getNode(edge.to);
            return (
              <g key={i}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="url(#edgeGradient)"
                  strokeWidth="2"
                  strokeOpacity="0.5"
                  markerEnd="url(#arrowhead)"
                />
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 - 6}
                  fill="#9CA3AF"
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                >
                  {edge.amount}
                </text>
              </g>
            );
          })}
        </motion.g>

        {/* Resolved phase: single optimized payment, fades in */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 1, 1] }}
          transition={{ duration: 5, repeat: Infinity, times: [0, 0.55, 0.7, 1] }}
        >
          <line
            x1={getNode('D').x}
            y1={getNode('D').y}
            x2={getNode('B').x}
            y2={getNode('B').y}
            stroke="url(#finalGradient)"
            strokeWidth="3"
            markerEnd="url(#arrowheadFinal)"
          />
          <text
            x={(getNode('D').x + getNode('B').x) / 2}
            y={(getNode('D').y + getNode('B').y) / 2 - 10}
            fill="#34D399"
            fontSize="13"
            fontWeight="600"
            fontFamily="JetBrains Mono, monospace"
            textAnchor="middle"
          >
            ₹90 · 1 payment
          </text>
        </motion.g>

        {/* Nodes (always visible) */}
        {nodes.map((node) => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r="20" fill="#111827" stroke="#2D3B4E" strokeWidth="1.5" />
            <text
              x={node.x}
              y={node.y + 5}
              fill="#F3F4F6"
              fontSize="13"
              fontWeight="600"
              fontFamily="Sora, sans-serif"
              textAnchor="middle"
            >
              {node.id}
            </text>
            <text
              x={node.x}
              y={node.y + 36}
              fill="#6B7684"
              fontSize="10"
              fontFamily="Inter, sans-serif"
              textAnchor="middle"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default SettlementFlowVisual;
