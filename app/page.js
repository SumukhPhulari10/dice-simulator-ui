"use client"; // if using App Router

import { useState, useEffect } from 'react';

export default function Home() {
  // Removed apiUrl const for direct inline usage
  const [dice, setDice] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [mode, setMode] = useState('single'); // 'single' or 'multiple'
  const [diceCount, setDiceCount] = useState(2);
  const [results, setResults] = useState([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const rollDice = async () => {
    setRolling(true);
    setError(null);
    setResults([]);
    
    try {
      if (mode === 'single') {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roll`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setTimeout(() => {
          setDice(data.dice);
          setResults([data.dice]);
          setRolling(false);
        }, 1000);
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roll-multiple`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ count: diceCount })
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setTimeout(() => {
          setDice(null);
          setResults(data.dice);
          setRolling(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error rolling dice:', error);
      setError('Failed to connect to server. Make sure the API is running.');
      setRolling(false);
    }
  };

  // Generate fixed positions for dice to avoid hydration issues
  const generateDicePositions = () => {
    const positions = [];
    for (let i = 0; i < 60; i++) {
      // Use deterministic but scattered positioning
      const x = (i * 10 + i * 13) % 100;
      const y = (i * 15 + i * 17) % 100;
      positions.push({
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${(i * 0.7) % 3}s`,
        animationDuration: `${2 + (i % 5)}s`,
        fontSize: `${16 + (i % 10)}px`,
        opacity: 0.05 + (i % 4) * 0.025
      });
    }
    return positions;
  };

  const dicePositions = generateDicePositions();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,rgb(2, 12, 57) 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px'
    }}>
      {/* Animated Background Dice - Only render on client */}
      {isClient && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}>
          {dicePositions.map((pos, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                fontSize: pos.fontSize,
                opacity: pos.opacity,
                animation: `float ${pos.animationDuration} ease-in-out infinite`,
                animationDelay: pos.animationDelay,
                left: pos.left,
                top: pos.top,
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                zIndex: 1
              }}
            >
              🎲
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div style={{
        textAlign: 'center',
        zIndex: 2,
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(15px)',
        borderRadius: '25px',
        padding: 'clamp(20px, 5vw, 40px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        maxWidth: 'min(600px, 90vw)',
        width: '100%'
      }}>
        <h1 style={{
          color: 'white',
          fontSize: 'clamp(2rem, 8vw, 3rem)',
          marginBottom: '20px',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
          fontWeight: 'bold',
          lineHeight: '1.2'
        }}>
          🎲 Dice Simulator 🎲
        </h1>

        {/* Mode Selection */}
        <div style={{
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'center',
          gap: 'clamp(10px, 2vw, 15px)',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setMode('single')}
            style={{
              padding: 'clamp(10px, 3vw, 12px) clamp(20px, 4vw, 24px)',
              fontSize: 'clamp(14px, 4vw, 16px)',
              backgroundColor: mode === 'single' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.4)',
              color: mode === 'single' ? '#2c3e50' : 'rgba(44, 62, 80, 0.7)',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: mode === 'single' ? '0 4px 15px rgba(0, 0, 0, 0.1)' : 'none',
              minHeight: '44px', // Touch-friendly minimum
              touchAction: 'manipulation'
            }}
          >
            🎲 Single Dice
          </button>
          <button
            onClick={() => setMode('multiple')}
            style={{
              padding: 'clamp(10px, 3vw, 12px) clamp(20px, 4vw, 24px)',
              fontSize: 'clamp(14px, 4vw, 16px)',
              backgroundColor: mode === 'multiple' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.4)',
              color: mode === 'multiple' ? '#2c3e50' : 'rgba(44, 62, 80, 0.7)',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: mode === 'multiple' ? '0 4px 15px rgba(0, 0, 0, 0.1)' : 'none',
              minHeight: '44px', // Touch-friendly minimum
              touchAction: 'manipulation'
            }}
          >
            🎲🎲 Multiple Dice
          </button>
        </div>

        {/* Dice Count Input for Multiple Mode */}
        {mode === 'multiple' && (
          <div style={{
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(10px, 2vw, 15px)',
            flexWrap: 'wrap'
          }}>
            <label style={{ 
              color: 'white', 
              fontSize: 'clamp(16px, 4vw, 18px)', 
              fontWeight: 'bold' 
            }}>
              Number of Dice:
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={diceCount}
              onChange={(e) => setDiceCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
              style={{
                padding: 'clamp(8px, 2vw, 10px) clamp(15px, 3vw, 20px)',
                fontSize: 'clamp(14px, 4vw, 16px)',
                borderRadius: '25px',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                width: 'clamp(80px, 20vw, 100px)',
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#2c3e50',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                minHeight: '44px' // Touch-friendly
              }}
            />
            <span style={{ 
              color: 'rgba(111, 17, 17, 0.8)', 
              fontSize: 'clamp(12px, 3vw, 14px)' 
            }}>
              (Max: 10)
            </span>
          </div>
        )}
        
        {/* Dice Display */}
        <div style={{
          fontSize: mode === 'single' ? 'clamp(80px, 25vw, 120px)' : 'clamp(60px, 20vw, 80px)',
          margin: 'clamp(20px, 5vw, 30px) 0',
          filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.2))',
          transition: 'transform 0.3s ease',
          transform: rolling ? 'scale(1.1) rotate(360deg)' : 'scale(1)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 'clamp(5px, 2vw, 10px)'
        }}>
          {rolling ? "🔄" : 
           mode === 'single' ? 
             (dice ? `🎲 ${dice}` : "🎲") :
             (results.length > 0 ? 
               results.map((result, index) => (
                 <span key={index} style={{ 
                   margin: '0 clamp(2px, 1vw, 5px)',
                   display: 'inline-block'
                 }}>🎲 {result}</span>
               )) : 
               "🎲"
             )
          }
        </div>

        {/* Results Summary for Multiple Dice */}
        {mode === 'multiple' && results.length > 0 && !rolling && (
          <div style={{
            marginBottom: '20px',
            padding: 'clamp(15px, 4vw, 20px)',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '20px',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ 
              color: 'rgb(42, 47, 50)', 
              fontSize: 'clamp(16px, 4vw, 18px)', 
              marginBottom: '10px', 
              fontWeight: 'bold' 
            }}>
              📊 Results Summary:
            </div>
            <div style={{ 
              color: 'rgba(11, 11, 11, 0.9)', 
              fontSize: 'clamp(14px, 4vw, 16px)', 
              fontWeight: 'bold',
              wordBreak: 'break-word'
            }}>
              Total: <span style={{ color: 'red' }}>{results.reduce((a, b) => a + b, 0)}</span> | 
              Average: <span style={{ color: 'green' }}>{(results.reduce((a, b) => a + b, 0) / results.length).toFixed(1)}</span>
            </div>
          </div>
        )}
        
        <button 
          onClick={rollDice} 
          disabled={rolling}
          style={{ 
            padding: 'clamp(15px, 4vw, 18px) clamp(30px, 6vw, 36px)', 
            fontSize: 'clamp(16px, 4vw, 20px)',
            backgroundColor: rolling ? 'rgba(255, 255, 255, 0.4)' : 'linear-gradient(45deg, #3498db, #2980b9)',
            background: rolling ? 'rgba(255, 255, 255, 0.4)' : 'linear-gradient(45deg, #3498db, #2980b9)',
            color: rolling ? 'rgba(44, 62, 80, 0.7)' : 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: rolling ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            boxShadow: rolling ? '0 2px 8px rgba(0, 0, 0, 0.1)' : '0 6px 20px rgba(52, 152, 219, 0.4)',
            transition: 'all 0.3s ease',
            transform: rolling ? 'scale(0.95)' : 'scale(1)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            minHeight: '44px', // Touch-friendly minimum
            touchAction: 'manipulation',
            width: 'clamp(200px, 80vw, 300px)'
          }}
        >
          {rolling ? '🎲 Rolling...' : `🎲 Roll ${mode === 'single' ? 'Dice' : `${diceCount} Dice`}`}
        </button>
        
        {error && (
          <div style={{ 
            color: '#e74c3c', 
            marginTop: '20px', 
            padding: 'clamp(10px, 3vw, 15px)',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            borderRadius: '15px',
            border: '2px solid rgba(231, 76, 60, 0.3)',
            backdropFilter: 'blur(5px)',
            fontSize: 'clamp(14px, 4vw, 16px)',
            wordBreak: 'break-word'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        /* Mobile-specific optimizations */
        @media (max-width: 768px) {
          * {
            -webkit-tap-highlight-color: transparent;
          }
        }
      `}</style>
    </div>
  );
}
