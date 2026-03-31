use std::collections::HashMap;

use super::{DependencyGraph, FileMetrics, GraphMetrics, HubFile};
use super::analysis;

/// Calculate all metrics for the dependency graph
pub fn calculate_metrics(graph: &mut DependencyGraph) -> GraphMetrics {
    // Run analysis
    let analysis_result = analysis::analyze_graph(graph);
    
    // Calculate per-file metrics
    let file_metrics = calculate_file_metrics(graph, &analysis_result);
    
    let metrics = GraphMetrics {
        total_files: graph.file_count(),
        total_dependencies: graph.dependency_count(),
        orphan_files: analysis_result.orphan_files.clone(),
        hub_files: analysis_result.hub_files.iter().map(|h| HubFile {
            path: h.path.clone(),
            import_count: h.import_count,
            importers: h.importers.clone(),
        }).collect(),
        cycles: analysis_result.cycles.clone(),
        file_metrics,
    };
    
    graph.metrics = Some(metrics.clone());
    metrics
}

/// Calculate metrics for each file in the graph
fn calculate_file_metrics(graph: &DependencyGraph, analysis: &analysis::AnalysisResult) -> Vec<FileMetrics> {
    let mut file_metrics = Vec::new();
    
    for file_node in &graph.files {
        let path = &file_node.path;
        
        // Afferent Coupling (Ca) - number of files that depend on this file
        let ca = graph.graph.edges_directed(
            *graph.node_map.get(path).unwrap(),
            petgraph::Direction::Incoming
        ).count();
        
        // Efferent Coupling (Ce) - number of files this file depends on
        let ce = graph.graph.edges_directed(
            *graph.node_map.get(path).unwrap(),
            petgraph::Direction::Outgoing
        ).count();
        
        // Instability = Ce / (Ca + Ce)
        let instability = if ca + ce > 0 {
            ce as f64 / (ca + ce) as f64
        } else {
            0.0
        };
        
        // Check if file is a hub
        let is_hub = analysis.hub_files.iter().any(|h| h.path == *path);
        
        // Check if file is an orphan
        let is_orphan = analysis.orphan_files.iter().any(|o| o == path);
        
        // Check if file is in a cycle
        let in_cycle = analysis::is_file_in_cycle(path, &analysis.cycles);
        
        file_metrics.push(FileMetrics {
            path: path.clone(),
            ca,
            ce,
            instability,
            is_hub,
            is_orphan,
            in_cycle,
        });
    }
    
    file_metrics
}

/// Get metrics for a specific file
pub fn get_file_metrics(graph: &DependencyGraph, file_path: &str) -> Option<FileMetrics> {
    graph.metrics.as_ref().and_then(|m| {
        m.file_metrics.iter().find(|fm| fm.path == file_path).cloned()
    })
}

/// Get summary statistics for the graph
pub fn get_summary(graph: &DependencyGraph) -> HashMap<String, serde_json::Value> {
    let mut summary = HashMap::new();
    
    let total_files = graph.file_count();
    let total_deps = graph.dependency_count();
    
    // Count files by language
    let mut lang_counts: HashMap<String, usize> = HashMap::new();
    for file in &graph.files {
        *lang_counts.entry(format!("{:?}", file.language)).or_insert(0) += 1;
    }
    
    // Count cycles
    let cycle_count = graph.metrics.as_ref().map(|m| m.cycles.len()).unwrap_or(0);
    
    // Count orphans
    let orphan_count = graph.metrics.as_ref().map(|m| m.orphan_files.len()).unwrap_or(0);
    
    // Count hubs
    let hub_count = graph.metrics.as_ref().map(|m| m.hub_files.len()).unwrap_or(0);
    
    // Average instability
    let avg_instability = graph.metrics.as_ref().map(|m| {
        if m.file_metrics.is_empty() {
            0.0
        } else {
            m.file_metrics.iter().map(|fm| fm.instability).sum::<f64>() / m.file_metrics.len() as f64
        }
    }).unwrap_or(0.0);
    
    summary.insert("total_files".to_string(), serde_json::json!(total_files));
    summary.insert("total_dependencies".to_string(), serde_json::json!(total_deps));
    summary.insert("cycle_count".to_string(), serde_json::json!(cycle_count));
    summary.insert("orphan_count".to_string(), serde_json::json!(orphan_count));
    summary.insert("hub_count".to_string(), serde_json::json!(hub_count));
    summary.insert("avg_instability".to_string(), serde_json::json!(avg_instability));
    summary.insert("languages".to_string(), serde_json::json!(lang_counts));
    
    summary
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_instability_calculation() {
        // Ca = 2, Ce = 3 => I = 3/5 = 0.6
        let ca = 2;
        let ce = 3;
        let instability = if ca + ce > 0 {
            ce as f64 / (ca + ce) as f64
        } else {
            0.0
        };
        assert!((instability - 0.6).abs() < f64::EPSILON);
    }
}
