import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Smile, Calendar, HelpCircle, Activity } from "lucide-react";

interface MoodEntry {
  value?: number;
  humor?: number;
  intensity?: number;
  note?: string;
  timestamp: string | any;
  triggers?: string[];
}

interface D3MoodHistoryProps {
  data: MoodEntry[];
}

export default function D3MoodHistory({ data }: D3MoodHistoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    date: string;
    value: number;
    intensity: number;
    note: string;
    triggers: string[];
  } | null>(null);

  // Parse and sort data chronologically
  const parsedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data
      .map((d) => {
        let date: Date;
        if (d.timestamp?.toDate && typeof d.timestamp.toDate === "function") {
          date = d.timestamp.toDate();
        } else {
          date = new Date(d.timestamp);
        }
        
        return {
          date,
          value: Number(d.value !== undefined ? d.value : d.humor !== undefined ? d.humor : 5),
          intensity: Number(d.intensity !== undefined ? d.intensity : 5),
          note: d.note || "",
          triggers: d.triggers || [],
        };
      })
      .filter((d) => !isNaN(d.date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || parsedData.length === 0) return;

    // Remove any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const handleResize = () => {
      if (!containerRef.current || !svgRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = 240; // Fixed height for visual consistency
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };

      const svg = d3
        .select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .style("overflow", "visible");

      // Define Scales
      const xScale = d3
        .scaleTime()
        .domain(d3.extent(parsedData, (d) => d.date) as [Date, Date])
        .range([margin.left, width - margin.right]);

      const yScale = d3
        .scaleLinear()
        .domain([0, 10]) // Mood ranges from 0 to 10
        .range([height - margin.bottom, margin.top]);

      // Gridlines
      const yGrid = d3
        .axisLeft(yScale)
        .tickValues([2, 4, 6, 8, 10])
        .tickSize(-width + margin.left + margin.right)
        .tickFormat(() => "");

      svg
        .append("g")
        .attr("class", "grid")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(yGrid)
        .call((g) => g.select(".domain").remove())
        .call((g) =>
          g
            .selectAll(".tick line")
            .attr("stroke", "currentColor")
            .attr("stroke-opacity", 0.08)
            .attr("class", "text-slate-400 dark:text-slate-700")
        );

      // Define Axes
      const xAxis = d3
        .axisBottom(xScale)
        .ticks(Math.min(parsedData.length, 7))
        .tickFormat((domainValue) => {
          const date = domainValue as Date;
          return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        })
        .tickSize(0)
        .tickPadding(10);

      const yAxis = d3
        .axisLeft(yScale)
        .tickValues([0, 2, 4, 6, 8, 10])
        .tickSize(0)
        .tickPadding(8);

      // Render Axes
      svg
        .append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .attr("class", "text-slate-450 dark:text-slate-500 font-mono text-[10px]")
        .call(xAxis)
        .call((g) => g.select(".domain").remove());

      svg
        .append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .attr("class", "text-slate-450 dark:text-slate-500 font-mono text-[10px]")
        .call(yAxis)
        .call((g) => g.select(".domain").remove());

      // Line and Area Generators
      const lineGenerator = d3
        .line<typeof parsedData[0]>()
        .x((d) => xScale(d.date))
        .y((d) => yScale(d.value))
        .curve(d3.curveMonotoneX);

      const areaGenerator = d3
        .area<typeof parsedData[0]>()
        .x((d) => xScale(d.date))
        .y0(height - margin.bottom)
        .y1((d) => yScale(d.value))
        .curve(d3.curveMonotoneX);

      // Glow / Gradient below the line
      const gradientId = "d3-mood-gradient";
      const defs = svg.append("defs");
      
      const gradient = defs
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#10b981") // emerald-500
        .attr("stop-opacity", 0.25);

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#10b981")
        .attr("stop-opacity", 0.0);

      // Render Area
      svg
        .append("path")
        .datum(parsedData)
        .attr("fill", `url(#${gradientId})`)
        .attr("d", areaGenerator);

      // Render Line
      svg
        .append("path")
        .datum(parsedData)
        .attr("fill", "none")
        .attr("stroke", "#10b981") // beautiful emerald line
        .attr("stroke-width", 3)
        .attr("d", lineGenerator);

      // Overlay invisible circles for hover detection
      const tooltipGroup = svg.append("g");

      const circles = tooltipGroup
        .selectAll("circle")
        .data(parsedData)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d.date))
        .attr("cy", (d) => yScale(d.value))
        .attr("r", 5)
        .attr("fill", "#10b981")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2)
        .attr("class", "cursor-pointer transition-all dark:stroke-slate-900")
        .style("opacity", 0.9);

      // Invisible hover area circles for better UX
      tooltipGroup
        .selectAll(".hover-trigger")
        .data(parsedData)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d.date))
        .attr("cy", (d) => yScale(d.value))
        .attr("r", 15)
        .attr("fill", "transparent")
        .attr("class", "cursor-pointer")
        .on("mouseenter", function (event, d) {
          circles
            .filter((node) => node === d)
            .transition()
            .duration(100)
            .attr("r", 7)
            .attr("fill", "#10b981")
            .attr("stroke-width", 3);

          const xPos = xScale(d.date);
          const yPos = yScale(d.value);

          setTooltip({
            show: true,
            x: xPos,
            y: yPos,
            date: d.date.toLocaleDateString("pt-BR", {
              weekday: "short",
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
            value: d.value,
            intensity: d.intensity,
            note: d.note,
            triggers: d.triggers,
          });
        })
        .on("mouseleave", function (event, d) {
          circles
            .filter((node) => node === d)
            .transition()
            .duration(100)
            .attr("r", 5)
            .attr("stroke-width", 2);

          setTooltip(null);
        });
    };

    handleResize();

    // Use ResizeObserver for perfect responsive layouts
    const observer = new ResizeObserver(() => {
      handleResize();
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [parsedData]);

  const getMoodEmoji = (val: number) => {
    if (val >= 9) return "😀";
    if (val >= 7) return "🙂";
    if (val >= 5) return "😐";
    if (val >= 3) return "😟";
    return "😭";
  };

  const getMoodDescription = (val: number) => {
    if (val >= 9) return "Excelente";
    if (val >= 7) return "Bem";
    if (val >= 5) return "Neutro";
    if (val >= 3) return "Ruim";
    return "Péssimo";
  };

  return (
    <div className="relative w-full" id="d3-mood-history-card">
      <div 
        ref={containerRef} 
        className="w-full bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-white/5 rounded-3xl p-4 min-h-[260px] flex flex-col justify-between"
      >
        {parsedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 flex-1">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400">
              <Smile className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Sem dados históricos</p>
              <p className="text-[11px] text-slate-500 max-w-[200px]">Nenhum humor registrado recentemente no banco de dados.</p>
            </div>
          </div>
        ) : (
          <div className="relative flex-1 w-full">
            <svg ref={svgRef} className="w-full h-[240px]" />
            
            {/* Tooltip Popup inside Container */}
            {tooltip && tooltip.show && (
              <div
                className="absolute z-[999] pointer-events-none bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-white/10 p-3 rounded-2xl shadow-xl space-y-2 text-xs text-slate-800 dark:text-slate-200 transition-all duration-75 max-w-[220px]"
                style={{
                  left: `${Math.min(tooltip.x + 10, (containerRef.current?.clientWidth || 300) - 230)}px`,
                  top: `${Math.max(tooltip.y - 120, 10)}px`,
                }}
              >
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-1 select-none">
                  <span className="text-[9px] text-slate-400 font-bold capitalize">{tooltip.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getMoodEmoji(tooltip.value)}</span>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {getMoodDescription(tooltip.value)}
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium">Nota: {tooltip.value}/10</p>
                  </div>
                </div>
                {tooltip.triggers.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tooltip.triggers.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {tooltip.note && (
                  <p className="text-[10px] italic text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-1">
                    "{tooltip.note.substring(0, 60)}{tooltip.note.length > 60 ? "..." : ""}"
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="flex items-center gap-2 mt-2 px-1 text-[10px] text-slate-500">
        <Activity className="w-3.5 h-3.5 text-emerald-500" />
        <span>Passe o cursor ou toque nos pontos do gráfico D3 para ver anotações detalhadas e gatilhos.</span>
      </div>
    </div>
  );
}
