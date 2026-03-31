use tauri::{State, Window};
use serde::{Deserialize, Serialize};

use crate::AppState;
use crate::graph::builder::{self, BuilderConfig};
use crate::graph::metrics;
use crate::watcher::FileWatcher;

/// Response from open_folder command
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenFolderResponse {
    pub root_path: String,
    pub file_count: usize,
    pub dependency_count: usize,
    pub cytoscape_elements: serde_json::Value,
    pub summary: serde_json::Value,
}

/// Response from detect_cycles command
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CyclesResponse {
    pub cycles: Vec<Vec<String>>,
    pub count: usize,
}

/// Response from calculate_metrics command
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricsResponse {
    pub total_files: usize,
    pub total_dependencies: usize,
    pub orphan_files: Vec<String>,
    pub hub_files: Vec<serde_json::Value>,
    pub file_metrics: Vec<serde_json::Value>,
    pub summary: serde_json::Value,
}

/// Open a folder and analyze its dependencies
#[tauri::command]
pub async fn open_folder(
    path: String,
    state: State<'_, AppState>,
) -> Result<OpenFolderResponse, String> {
    log::info!("Opening folder: {}", path);
    
    let config = BuilderConfig::default();
    let mut graph = builder::build_graph(&path, Some(config))?;
    
    // Calculate metrics
    metrics::calculate_metrics(&mut graph);
    
    let file_count = graph.file_count();
    let dependency_count = graph.dependency_count();
    let cytoscape_elements = graph.to_cytoscape_elements();
    let summary = metrics::get_summary(&graph);
    
    // Store the graph in app state
    {
        let mut app_state = state.graph.lock().unwrap();
        *app_state = Some(graph);
    }
    
    Ok(OpenFolderResponse {
        root_path: path,
        file_count,
        dependency_count,
        cytoscape_elements,
        summary: serde_json::json!(summary),
    })
}

/// Get dependencies of a specific file
#[tauri::command]
pub async fn get_file_deps(
    file_path: String,
    state: State<'_, AppState>,
) -> Result<Vec<String>, String> {
    let app_state = state.graph.lock().unwrap();
    
    if let Some(ref graph) = *app_state {
        Ok(graph.get_dependencies(&file_path))
    } else {
        Err("No graph loaded. Please open a folder first.".to_string())
    }
}

/// Get reverse dependencies of a specific file
#[tauri::command]
pub async fn get_reverse_deps(
    file_path: String,
    state: State<'_, AppState>,
) -> Result<Vec<String>, String> {
    let app_state = state.graph.lock().unwrap();
    
    if let Some(ref graph) = *app_state {
        Ok(graph.get_reverse_dependencies(&file_path))
    } else {
        Err("No graph loaded. Please open a folder first.".to_string())
    }
}

/// Detect cycles in the dependency graph
#[tauri::command]
pub async fn detect_cycles(
    state: State<'_, AppState>,
) -> Result<CyclesResponse, String> {
    let app_state = state.graph.lock().unwrap();
    
    if let Some(ref graph) = *app_state {
        if let Some(ref metrics) = graph.metrics {
            Ok(CyclesResponse {
                cycles: metrics.cycles.clone(),
                count: metrics.cycles.len(),
            })
        } else {
            Err("Metrics not calculated. Please open a folder first.".to_string())
        }
    } else {
        Err("No graph loaded. Please open a folder first.".to_string())
    }
}

/// Calculate metrics for the dependency graph
#[tauri::command]
pub async fn calculate_metrics(
    state: State<'_, AppState>,
) -> Result<MetricsResponse, String> {
    let mut app_state = state.graph.lock().unwrap();
    
    if let Some(ref mut graph) = *app_state {
        let graph_metrics = metrics::calculate_metrics(graph);
        let summary = metrics::get_summary(graph);
        
        Ok(MetricsResponse {
            total_files: graph_metrics.total_files,
            total_dependencies: graph_metrics.total_dependencies,
            orphan_files: graph_metrics.orphan_files,
            hub_files: graph_metrics.hub_files.iter().map(|h| {
                serde_json::json!({
                    "path": h.path,
                    "import_count": h.import_count,
                    "importers": h.importers,
                })
            }).collect(),
            file_metrics: graph_metrics.file_metrics.iter().map(|fm| {
                serde_json::json!({
                    "path": fm.path,
                    "ca": fm.ca,
                    "ce": fm.ce,
                    "instability": fm.instability,
                    "is_hub": fm.is_hub,
                    "is_orphan": fm.is_orphan,
                    "in_cycle": fm.in_cycle,
                })
            }).collect(),
            summary: serde_json::json!(summary),
        })
    } else {
        Err("No graph loaded. Please open a folder first.".to_string())
    }
}

/// Export the graph in the specified format
#[tauri::command]
pub async fn export_graph(
    format: String,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let app_state = state.graph.lock().unwrap();
    
    if let Some(ref graph) = *app_state {
        match format.as_str() {
            "json" => graph.to_json().map_err(|e| e.to_string()),
            "cytoscape" => Ok(graph.to_cytoscape_elements().to_string()),
            _ => Err(format!("Unsupported export format: {}", format)),
        }
    } else {
        Err("No graph loaded. Please open a folder first.".to_string())
    }
}

/// Start watching a folder for changes
#[tauri::command]
pub async fn start_watcher(
    path: String,
    window: Window,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let mut app_state = state.watcher.lock().unwrap();
    
    // Stop existing watcher if any
    if let Some(ref mut watcher) = *app_state {
        watcher.stop();
    }
    
    let window_clone = window.clone();
    
    let mut watcher = FileWatcher::new(&path, move |changed_files: Vec<String>| {
        log::info!("Files changed: {:?}", changed_files);
        // Emit event to frontend
        let _ = window_clone.emit("files-changed", &changed_files);
    })?;
    
    watcher.start()?;
    *app_state = Some(watcher);
    
    Ok(format!("Watching {}", path))
}

/// Stop the file watcher
#[tauri::command]
pub async fn stop_watcher(
    state: State<'_, AppState>,
) -> Result<String, String> {
    let mut app_state = state.watcher.lock().unwrap();
    
    if let Some(ref mut watcher) = *app_state {
        watcher.stop();
        Ok("Watcher stopped".to_string())
    } else {
        Ok("No watcher running".to_string())
    }
}
