pub mod builder;
pub mod analysis;
pub mod metrics;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use petgraph::graph::DiGraph;
use petgraph::visit::EdgeRef;

use crate::parser::{Dependency, Language};

/// A node in the dependency graph representing a file
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileNode {
    /// Absolute path to the file
    pub path: String,
    /// Relative path from the scanned folder root
    pub relative_path: String,
    /// File extension (without dot)
    pub extension: String,
    /// Detected language
    pub language: Language,
    /// File size in bytes
    pub size: u64,
    /// Number of lines
    pub line_count: usize,
}

/// A complete dependency graph for a project
#[derive(Debug, Clone)]
pub struct DependencyGraph {
    /// The root folder that was scanned
    pub root_path: String,
    /// All files found during scanning
    pub files: Vec<FileNode>,
    /// All dependencies between files
    pub dependencies: Vec<Dependency>,
    /// Internal graph representation using petgraph
    pub graph: DiGraph<String, String>,
    /// Mapping from file path to graph node index
    pub node_map: HashMap<String, petgraph::graph::NodeIndex>,
    /// Metrics calculated for this graph
    pub metrics: Option<GraphMetrics>,
}

/// Metrics calculated for the entire graph
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphMetrics {
    pub total_files: usize,
    pub total_dependencies: usize,
    pub orphan_files: Vec<String>,
    pub hub_files: Vec<HubFile>,
    pub cycles: Vec<Vec<String>>,
    pub file_metrics: Vec<FileMetrics>,
}

/// Metrics for a single file
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileMetrics {
    pub path: String,
    /// Afferent Coupling - number of files that depend on this file
    pub ca: usize,
    /// Efferent Coupling - number of files this file depends on
    pub ce: usize,
    /// Instability = Ce / (Ca + Ce)
    pub instability: f64,
    /// Is this file a hub (imported by many others)
    pub is_hub: bool,
    /// Is this file an orphan (not imported by anyone)
    pub is_orphan: bool,
    /// Is this file part of a cycle
    pub in_cycle: bool,
}

/// A hub file that is imported by many others
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HubFile {
    pub path: String,
    pub import_count: usize,
    pub importers: Vec<String>,
}

impl DependencyGraph {
    /// Create a new empty dependency graph
    pub fn new(root_path: String) -> Self {
        Self {
            root_path,
            files: Vec::new(),
            dependencies: Vec::new(),
            graph: DiGraph::new(),
            node_map: HashMap::new(),
            metrics: None,
        }
    }

    /// Get the number of files in the graph
    pub fn file_count(&self) -> usize {
        self.files.len()
    }

    /// Get the number of dependencies in the graph
    pub fn dependency_count(&self) -> usize {
        self.dependencies.len()
    }

    /// Get all direct dependencies of a file
    pub fn get_dependencies(&self, file_path: &str) -> Vec<String> {
        if let Some(&node_idx) = self.node_map.get(file_path) {
            self.graph
                .neighbors_directed(node_idx, petgraph::Direction::Outgoing)
                .filter_map(|idx| self.graph.node_weight(idx).cloned())
                .collect()
        } else {
            Vec::new()
        }
    }

    /// Get all reverse dependencies (files that depend on this file)
    pub fn get_reverse_dependencies(&self, file_path: &str) -> Vec<String> {
        if let Some(&node_idx) = self.node_map.get(file_path) {
            self.graph
                .neighbors_directed(node_idx, petgraph::Direction::Incoming)
                .filter_map(|idx| self.graph.node_weight(idx).cloned())
                .collect()
        } else {
            Vec::new()
        }
    }

    /// Export the graph to Cytoscape.js format for frontend visualization
    pub fn to_cytoscape_elements(&self) -> serde_json::Value {
        let mut elements = serde_json::Map::new();
        let mut nodes = Vec::new();
        let mut edges = Vec::new();

        // Add nodes
        for (path, _idx) in &self.node_map {
            if let Some(file_node) = self.files.iter().find(|f| f.path == *path) {
                nodes.push(serde_json::json!({
                    "data": {
                        "id": path,
                        "label": &file_node.relative_path,
                        "language": format!("{:?}", file_node.language),
                        "extension": file_node.extension,
                    }
                }));
            }
        }

        // Add edges
        for edge in self.graph.edge_references() {
            let source = self.graph.node_weight(edge.source()).unwrap();
            let target = self.graph.node_weight(edge.target()).unwrap();
            let weight = edge.weight();
            
            edges.push(serde_json::json!({
                "data": {
                    "source": source,
                    "target": target,
                    "weight": weight,
                }
            }));
        }

        elements.insert("nodes".to_string(), serde_json::Value::Array(nodes));
        elements.insert("edges".to_string(), serde_json::Value::Array(edges));
        
        serde_json::Value::Object(elements)
    }

    /// Export the graph to JSON format
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        let export_data = serde_json::json!({
            "root_path": self.root_path,
            "files": self.files,
            "dependencies": self.dependencies,
            "metrics": self.metrics,
        });
        serde_json::to_string_pretty(&export_data)
    }
}
