import React, { useState } from 'react';

interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

const CandlestickChart: React.FC = () => {
  // Sample stock data
const [data] = useState<CandleData[]>(() => {
    const generateCandleData = (days: number): CandleData[] => {
        const result: CandleData[] = [];
        let currentPrice = 150;
        const startDate = new Date('2024-01-01');
        
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) {
                continue;
            }
            
            const open = currentPrice;
            const volatility = 0.05; // 5% volatility
            const direction = Math.random() > 0.5 ? 1 : -1;
            const change = currentPrice * volatility * Math.random() * direction;
            
            const high = open + Math.abs(change) * (0.5 + Math.random() * 0.5);
            const low = open - Math.abs(change) * (0.5 + Math.random() * 0.5);
            const close = open + change;
            
            result.push({
                date: date.toISOString().split('T')[0],
                open: Math.round(open * 100) / 100,
                high: Math.round(high * 100) / 100,
                low: Math.round(low * 100) / 100,
                close: Math.round(close * 100) / 100,
            });
            
            currentPrice = close;
        }
        
        return result;
    };
    
    return generateCandleData(20);
});

  // Calculate chart dimensions
  const chartHeight = 400;
  const chartWidth = 300;
  const padding = 10;
  const candleWidth = 10;
  const candleSpacing = (chartWidth - padding * 2) / data.length;

  // Find min and max values for scaling
  const allValues = data.flatMap(d => [d.high, d.low]);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue;

  // Scale a price value to pixel position
  const scaleY = (value: number): number => {
    return chartHeight - padding - ((value - minValue) / valueRange) * (chartHeight - padding * 2);
  };

  return (
    <div style={{ 
      position: 'relative', 
      width: `${chartWidth}px`, 
      height: `${chartHeight}px`
    }}>
      {/* Candlesticks */}
      {data.map((candle, index) => {
        const x = padding + index * candleSpacing + candleSpacing / 2;
        const isBullish = candle.close >= candle.open;
        const color = isBullish ? '#22c55e' : '#ef4444';
        
        const highY = scaleY(candle.high);
        const lowY = scaleY(candle.low);
        const openY = scaleY(candle.open);
        const closeY = scaleY(candle.close);
        
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.abs(closeY - openY) || 1;

        return (
          <div key={index}>
            {/* Wick (high-low line) */}
            <div style={{
              position: 'absolute',
              left: `${x}px`,
              top: `${highY}px`,
              width: '2px',
              height: `${lowY - highY}px`,
              backgroundColor: color,
              transform: 'translateX(-1px)'
            }} />
            
            {/* Body (open-close rectangle) */}
            <div style={{
              position: 'absolute',
              left: `${x - candleWidth / 2}px`,
              top: `${bodyTop}px`,
              width: `${candleWidth}px`,
              height: `${bodyHeight}px`,
              backgroundColor: color,
              border: `1px solid ${color}`,
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default CandlestickChart;