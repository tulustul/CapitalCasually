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

    const margin = { top: 20, right: 80, bottom: 20, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create sankey generator
    const sankeyGenerator = sankey()
      .nodeWidth(55)
      .nodePadding(40)
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

    // Color mapping for links
    const linkColorMap = {
      green: "#10b981",
      red: "#ef4444",
      neutral: "#64748b",
    };

    // Darker versions for nodes
    const nodeColorMap = {
      green: "#065f46", // darker green
      red: "#991b1b", // darker red
      neutral: "#374151", // darker gray
    };

    // Function to get node color based on first incoming link
    const getNodeColor = (nodeName: string) => {
      const incomingLink = data.find((link) => link.target === nodeName);
      if (!incomingLink) {
        // Starting node - use dark neutral
        return nodeColorMap.neutral;
      }
      return (
        nodeColorMap[incomingLink.color as keyof typeof nodeColorMap] ||
        nodeColorMap.neutral
      );
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
      .attr("fill", (d: any) => getNodeColor(d.name));

    // Add node value labels inside nodes
    g.append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("x", (d: any) => (d.x0 + d.x1) / 2)
      .attr("y", (d: any) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text((d: any) => {
        const value = d.value || 0;
        const formattedValue =
          value >= 1000 ? `$${(value / 1000).toFixed(1)}B` : `$${value}M`;
        return formattedValue;
      });

    // Add node name labels below nodes
    g.append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("x", (d: any) => (d.x0 + d.x1) / 2)
      .attr("y", (d: any) => d.y1 + 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#e5e7eb")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text((d: any) => d.name);
  }, [data, width, height]);

  return (
    <div className="overflow-x-auto">
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
}
