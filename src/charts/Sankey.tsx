import { useEffect, useRef } from "react";
import * as d3 from "d3";
import {
  sankey,
  sankeyCenter,
  sankeyLinkHorizontal,
  type SankeyGraph,
} from "d3-sankey";

interface SankeyNode {
  id: string;
  name: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
}

interface SankeyProps {
  data: SankeyLink[];
  width?: number;
  height?: number;
}

export function Sankey({ data, width = 800, height = 600 }: SankeyProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create sankey generator
    const sankeyGenerator = sankey()
      .nodeWidth(45)
      .nodePadding(30)
      // .nodeSort((a, b) => (b.value ?? 0) - (a.value ?? 0))
      .nodeAlign(sankeyCenter)
      .extent([
        [1, 1],
        [innerWidth - 1, innerHeight - 1],
      ]);

    const nodeNames = Array.from(
      new Set([...data.map((f) => f.source), ...data.map((f) => f.target)]),
    );
    const nodes: SankeyNode[] = nodeNames.map((name) => ({ name, id: name }));
    const nodeMap = new Map(nodes.map((node, i) => [node.id, i]));

    const links = data.map((link) => ({
      source: nodeMap.get(link.source)!,
      target: nodeMap.get(link.target)!,
      value: link.value,
    }));

    const processedData: SankeyGraph<any, any> = { nodes, links };

    const computedSankey = sankeyGenerator(processedData as any);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Color scale for nodes
    const nodeColor = d3.scaleOrdinal(d3.schemeCategory10);

    // Color mapping for links
    const linkColorMap = {
      green: "#10b981",
      red: "#ef4444",
      neutral: "#64748b",
    };

    // Draw links
    g.append("g")
      .selectAll("path")
      .data(computedSankey.links)
      .enter()
      .append("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d: any) => {
        const originalLink = data.find(
          (link) =>
            link.source === d.source.name && link.target === d.target.name,
        );
        return (
          linkColorMap[originalLink?.color as keyof typeof linkColorMap] ||
          linkColorMap.neutral
        );
      })
      .attr("stroke-opacity", 0.7)
      .attr("fill", "none")
      .attr("stroke-width", (d: any) => Math.max(1, d.width));

    // Draw nodes
    g.append("g")
      .selectAll("rect")
      .data(nodes)
      .enter()
      .append("rect")
      .attr("x", (d: any) => d.x0)
      .attr("y", (d: any) => d.y0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("fill", (_: any, i: number) => nodeColor(i.toString()));

    // Add node labels with values
    g.append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("x", (d: any) => (d.x0 < innerWidth / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d: any) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d: any) =>
        d.x0 < innerWidth / 2 ? "start" : "end",
      )
      .attr("fill", "#e5e7eb")
      .attr("font-size", "12px")
      .text((d: any) => {
        const value = d.value || 0;
        const formattedValue =
          value >= 1000 ? `$${(value / 1000).toFixed(1)}B` : `$${value}M`;
        return `${d.name} (${formattedValue})`;
      });
  }, [data, width, height]);

  return (
    <div className="w-full">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-gray-800 rounded-lg border border-gray-700"
      />
    </div>
  );
}
