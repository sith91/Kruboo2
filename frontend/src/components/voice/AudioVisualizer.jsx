import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const AudioVisualizer = ({ isListening, isSpeaking, audioLevel = 0 }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const drawVisualizer = () => {
      ctx.clearRect(0, 0, width, height);

      if (!isListening && !isSpeaking) return;

      const barCount = 32;
      const barWidth = width / barCount;
      const baseHeight = height * 0.3;
      const variability = isListening ? 0.7 : 0.4;

      for (let i = 0; i < barCount; i++) {
        const barHeight = baseHeight + Math.random() * height * variability * audioLevel;
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        if (isListening) {
          gradient.addColorStop(0, '#ef4444');
          gradient.addColorStop(1, '#f87171');
        } else {
          gradient.addColorStop(0, '#3b82f6');
          gradient.addColorStop(1, '#60a5fa');
        }

        ctx.fillStyle = gradient;
        
        const x = i * barWidth + barWidth * 0.1;
        const y = height - barHeight;
        
        // Draw rounded bar
        const borderRadius = barWidth * 0.2;
        ctx.beginPath();
        ctx.moveTo(x + borderRadius, y);
        ctx.lineTo(x + barWidth * 0.8 - borderRadius, y);
        ctx.quadraticCurveTo(x + barWidth * 0.8, y, x + barWidth * 0.8, y + borderRadius);
        ctx.lineTo(x + barWidth * 0.8, y + barHeight - borderRadius);
        ctx.quadraticCurveTo(x + barWidth * 0.8, y + barHeight, x + barWidth * 0.8 - borderRadius, y + barHeight);
        ctx.lineTo(x + borderRadius, y + barHeight);
        ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - borderRadius);
        ctx.lineTo(x, y + borderRadius);
        ctx.quadraticCurveTo(x, y, x + borderRadius, y);
        ctx.closePath();
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(drawVisualizer);
    };

    drawVisualizer();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, isSpeaking, audioLevel]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isListening || isSpeaking ? 1 : 0.5 }}
      className="relative"
    >
      <canvas
        ref={canvasRef}
        width={300}
        height={80}
        className="w-full h-20 rounded-lg bg-white/5"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{
            scale: isListening ? [1, 1.1, 1] : isSpeaking ? [1, 1.05, 1] : 1
          }}
          transition={{ duration: 0.5, repeat: isListening || isSpeaking ? Infinity : 0 }}
          className="text-xs text-gray-400 font-medium"
        >
          {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready'}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AudioVisualizer;
