
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AudioState } from '../types';

interface VisualizerProps {
  state: AudioState;
}

export const Visualizer: React.FC<VisualizerProps> = ({ state }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 200;
    const height = 200;
    const centerX = width / 2;
    const centerY = height / 2;

    const g = svg.append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    // Base circle
    const circle = g.append("circle")
      .attr("r", 50)
      .attr("fill", state === AudioState.ERROR ? "#ef4444" : "#22c55e")
      .attr("opacity", 0.6);

    // Pulse animation based on state
    const animate = () => {
      let duration = 2000;
      let scale = 1.1;
      let opacity = 0.4;

      if (state === AudioState.LISTENING) {
        duration = 800;
        scale = 1.4;
        opacity = 0.2;
      } else if (state === AudioState.SPEAKING) {
        duration = 400;
        scale = 1.8;
        opacity = 0.1;
      } else if (state === AudioState.CONNECTING) {
        duration = 1000;
        scale = 1.2;
        opacity = 0.5;
      }

      circle.transition()
        .duration(duration)
        .ease(d3.easeSinInOut)
        .attr("r", 50 * scale)
        .attr("opacity", opacity)
        .transition()
        .duration(duration)
        .ease(d3.easeSinInOut)
        .attr("r", 50)
        .attr("opacity", 0.6)
        .on("end", animate);
    };

    animate();

    return () => {
      svg.selectAll("*").interrupt();
    };
  }, [state]);

  return (
    <div className="relative flex items-center justify-center">
      <svg ref={svgRef} width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-xl" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-500 ${
          state === AudioState.LISTENING ? 'bg-green-500 scale-110' : 
          state === AudioState.SPEAKING ? 'bg-blue-500 scale-105' : 
          state === AudioState.ERROR ? 'bg-red-500' : 'bg-green-600'
        }`}>
          {state === AudioState.CONNECTING ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
             </svg>
          )}
        </div>
      </div>
    </div>
  );
};
