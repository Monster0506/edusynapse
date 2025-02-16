"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

interface Module {
  id: string;
  title: string;
  description?: string;
  tags: string[];
}

interface KnowledgeGraphProps {
  modules: Module[];
}

interface GraphData {
  nodes: Array<{
    id: string;
    name: string;
    description?: string;
    val: number;
    isModule?: boolean;
    isTag?: boolean;
    color?: string;
  }>;
  links: Array<{
    source: string;
    target: string;
    name?: string;
    color?: string;
  }>;
}

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const c = (hash & 0x00ffffff).toString(16).toUpperCase();

  return "#" + "00000".substring(0, 6 - c.length) + c;
}

export default function KnowledgeGraph({ modules }: KnowledgeGraphProps) {
  const { theme } = useTheme();
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });
  const [mounted, setMounted] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const fgRef = useRef();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const nodes: GraphData["nodes"] = [];
    const links: GraphData["links"] = [];
    const tagMap = new Map<string, Set<string>>();

    modules.forEach((module) => {
      nodes.push({
        id: module.id,
        name: module.title,
        description: module.description,
        val: 1.5,
        isModule: true,
        isTag: false,
        color: theme === "dark" ? "#fff" : "#000",
      });

      if (module.tags) {
        module.tags.forEach((tag) => {
          const normalizedTag = tag.toLowerCase().trim();
          if (!tagMap.has(normalizedTag)) {
            tagMap.set(normalizedTag, new Set());
          }
          tagMap.get(normalizedTag)?.add(module.id);
        });
      }
    });

    tagMap.forEach((moduleIds, tag) => {
      const tagId = `tag-${tag}`;
      const tagColor = stringToColor(tag);

      nodes.push({
        id: tagId,
        name: tag,
        val: 1,
        isModule: false,
        isTag: true,
        color: tagColor,
      });

      moduleIds.forEach((moduleId) => {
        links.push({
          source: tagId,
          target: moduleId,
          name: tag,
          color: tagColor,
        });
      });

      const moduleIdArray = Array.from(moduleIds);
      for (let i = 0; i < moduleIdArray.length; i++) {
        for (let j = i + 1; j < moduleIdArray.length; j++) {
          links.push({
            source: moduleIdArray[i],
            target: moduleIdArray[j],
            name: tag,
            color: tagColor,
          });
        }
      }
    });

    setGraphData({ nodes, links });
  }, [modules, theme, mounted]);

  if (!mounted) return null;

  return (
    <div className="w-full h-[600px] relative">
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        nodeLabel={null}
        nodeColor="color"
        nodeVal="val"
        linkLabel={null}
        backgroundColor={theme === "dark" ? "#000" : "#fff"}
        linkColor={(link: any) =>
          link.color || (theme === "dark" ? "#444" : "#ddd")
        }
        linkWidth={1.5}
        linkOpacity={0.6}
        nodeOpacity={0.9}
        nodeResolution={8}
        onNodeHover={(node: any) => {
          setHoveredNode(node?.name || null);
        }}
        onLinkHover={() => setHoveredNode(null)}
        warmupTicks={100}
        cooldownTicks={100}
        cooldownTime={3000}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        dagMode={null}
        dagLevelDistance={50}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleColor={(link: any) => link.color}
        nodeRelSize={6}
        linkCurvature={0.25}
        linkCurveRotation={Math.PI / 4}
        linkDirectionalArrowLength={0}
        d3Force={(d3: any) => {
          d3.force("center").strength(1.5);

          d3.force("link").strength((link: any) => 1.0);

          d3.force("charge").strength(-80);

          d3.force(
            "collision",
            d3.forceCollide((node: { val: number; }) => Math.cbrt(node.val) * 5),
          );

          d3.force("radial", d3.forceRadial(50).strength(0.2));
        }}
      />
      <div
        className={`
          absolute left-1/2 bottom-8 transform -translate-x-1/2
          px-4 py-2 text-sm font-medium rounded-xl
          bg-background/95 backdrop-blur
          border border-border/50 shadow-xl
          transition-all duration-300 ease-in-out
          ${hoveredNode ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
          ${theme === "dark" ? "text-white/90" : "text-black/90"}
        `}
      >
        {hoveredNode || ""}
      </div>
    </div>
  );
}
