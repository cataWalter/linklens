use petgraph::algo::kosaraju_scc;
use petgraph::visit::EdgeRef;
use std::collections::{HashMap, HashSet};

use super::DependencyGraph;

/// Analysis results for the dependency graph
#[derive(Debug, Clone)]
pub struct AnalysisResult {
    /// All detected cycles (each cycle is a list of file paths)
    pub cycles: Vec<Vec<String>>,
    /// Files that are not imported by any other file (entry points or orphans)
    pub orphan_files: Vec<String>,
    /// Files that are imported by many other files (hubs)
    pub hub_files: Vec<HubFile>,
}

/// A hub file that is imported by many others
#[derive(Debug, Clone)]
pub struct HubFile {
    pub path: String,
    pub import_count: usize,
    pub importers: Vec<String>,
}

/// Minimum number of importers to be considered a hub
const HUB_THRESHOLD: usize = 3;

/// Analyze the dependency graph for cycles, orphans, and hubs
pub fn analyze_graph(graph: &DependencyGraph) -> AnalysisResult {
    let cycles = detect_cycles(graph);
    let orphan_files = find_orphans(graph);
    let hub_files = find_hubs(graph);
    
    AnalysisResult {
        cycles,
        orphan_files,
        hub_files,
    }
}

/// Detect all cycles in the graph using Kosaraju's algorithm
pub fn detect_cycles(graph: &DependencyGraph) -> Vec<Vec<String>> {
    let sccs = kosaraju_scc(&graph.graph);
    
    // Filter to only SCCs with more than one node (actual cycles)
    sccs.into_iter()
        .filter(|scc| scc.len() > 1)
        .map(|scc| {
            scc.iter()
                .filter_map(|idx| graph.graph.node_weight(*idx).cloned())
                .collect()
        })
        .collect()
}

/// Find files that are not imported by any other file
pub fn find_orphans(graph: &DependencyGraph) -> Vec<String> {
    let mut has_incoming = HashSet::new();
    
    // Collect all nodes that have incoming edges
    for edge in graph.graph.edge_references() {
        has_incoming.insert(edge.target());
    }
    
    // Files without incoming edges are orphans (or entry points)
    graph.graph.node_indices()
        .filter(|idx| !has_incoming.contains(idx))
        .filter_map(|idx| graph.graph.node_weight(idx).cloned())
        .collect()
}

/// Find files that are imported by many other files (hubs)
pub fn find_hubs(graph: &DependencyGraph) -> Vec<HubFile> {
    let mut incoming_count: HashMap<String, Vec<String>> = HashMap::new();
    
    // Count incoming edges for each node
    for edge in graph.graph.edge_references() {
        let target = graph.graph.node_weight(edge.target()).cloned().unwrap();
        let source = graph.graph.node_weight(edge.source()).cloned().unwrap();
        
        incoming_count
            .entry(target)
            .or_default()
            .push(source);
    }
    
    // Filter to only hubs (above threshold)
    incoming_count.into_iter()
        .filter(|(_, importers)| importers.len() >= HUB_THRESHOLD)
        .map(|(path, importers)| HubFile {
            path,
            import_count: importers.len(),
            importers,
        })
        .collect()
}

/// Check if a specific file is part of a cycle
pub fn is_file_in_cycle(file_path: &str, cycles: &[Vec<String>]) -> bool {
    cycles.iter().any(|cycle| cycle.iter().any(|f| f == file_path))
}

/// Get the depth of a file in the dependency tree (longest path from any root)
pub fn get_file_depth(graph: &DependencyGraph, file_path: &str) -> Option<usize> {
    let node_idx = graph.node_map.get(file_path)?;
    
    // BFS from nodes with no incoming edges
    let mut depths: HashMap<petgraph::graph::NodeIndex, usize> = HashMap::new();
    let mut queue = std::collections::VecDeque::new();
    
    // Find root nodes (no incoming edges)
    for idx in graph.graph.node_indices() {
        if graph.graph.edges_directed(idx, petgraph::Direction::Incoming).count() == 0 {
            depths.insert(idx, 0);
            queue.push_back(idx);
        }
    }
    
    while let Some(current) = queue.pop_front() {
        let current_depth = *depths.get(&current)?;
        
        for neighbor in graph.graph.neighbors_directed(current, petgraph::Direction::Outgoing) {
            let new_depth = current_depth + 1;
            let entry = depths.entry(neighbor).or_insert(0);
            if new_depth > *entry {
                *entry = new_depth;
            }
            queue.push_back(neighbor);
        }
    }
    
    depths.get(node_idx).copied()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_file_in_cycle() {
        let cycles = vec![
            vec!["a.rs".to_string(), "b.rs".to_string(), "c.rs".to_string()],
        ];
        
        assert!(is_file_in_cycle("a.rs", &cycles));
        assert!(is_file_in_cycle("b.rs", &cycles));
        assert!(!is_file_in_cycle("d.rs", &cycles));
    }
}
