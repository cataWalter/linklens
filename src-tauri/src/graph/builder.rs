use rayon::prelude::*;
use std::path::Path;

use crate::parser::{self, Language};
use super::{DependencyGraph, FileNode};

/// Configuration for the graph builder
#[derive(Debug, Clone)]
pub struct BuilderConfig {
    /// File extensions to include
    pub extensions: Vec<String>,
    /// Folders to exclude
    pub exclude_folders: Vec<String>,
    /// Files to exclude
    pub exclude_files: Vec<String>,
    /// Maximum depth to scan (0 = unlimited)
    pub max_depth: usize,
}

impl Default for BuilderConfig {
    fn default() -> Self {
        Self {
            extensions: vec![
                "js".to_string(), "mjs".to_string(), "cjs".to_string(),
                "ts".to_string(), "tsx".to_string(),
                "py".to_string(), "pyi".to_string(),
                "java".to_string(),
                "c".to_string(), "h".to_string(),
                "cpp".to_string(), "cc".to_string(), "hpp".to_string(),
                "go".to_string(),
                "rs".to_string(),
                "php".to_string(),
                "rb".to_string(),
            ],
            exclude_folders: vec![
                "node_modules".to_string(),
                ".git".to_string(),
                "dist".to_string(),
                "build".to_string(),
                "target".to_string(),
                "__pycache__".to_string(),
                ".venv".to_string(),
                "venv".to_string(),
            ],
            exclude_files: Vec::new(),
            max_depth: 0,
        }
    }
}

/// Build a dependency graph from a folder
pub fn build_graph(root_path: &str, config: Option<BuilderConfig>) -> Result<DependencyGraph, String> {
    let config = config.unwrap_or_default();
    let root_path = std::fs::canonicalize(root_path)
        .map_err(|e| format!("Failed to canonicalize path: {}", e))?;
    let root_str = root_path.to_string_lossy().to_string();
    
    // Create the graph
    let mut graph = DependencyGraph::new(root_str.clone());
    
    // Find all files
    let files = find_files(&root_path, &config)?;
    
    // Parse files and extract dependencies
    let parsed_files: Vec<_> = files.par_iter()
        .filter_map(|file_path| {
            let content = std::fs::read_to_string(file_path).ok()?;
            let deps = parser::parse_file(file_path, &content);
            let relative_path = Path::new(file_path)
                .strip_prefix(&root_path)
                .ok()
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_else(|| file_path.clone());
            
            let extension = Path::new(file_path)
                .extension()
                .and_then(|e| e.to_str())
                .unwrap_or("")
                .to_string();
            
            let language = Language::from_extension(&extension);
            let size = std::fs::metadata(file_path).ok()?.len();
            let line_count = content.lines().count();
            
            Some((
                FileNode {
                    path: file_path.clone(),
                    relative_path,
                    extension,
                    language,
                    size,
                    line_count,
                },
                deps,
            ))
        })
        .collect();
    
    // Add files to graph
    for (file_node, _) in &parsed_files {
        let idx = graph.graph.add_node(file_node.path.clone());
        graph.node_map.insert(file_node.path.clone(), idx);
        graph.files.push(file_node.clone());
    }
    
    // Add dependencies to graph
    for (file_node, deps) in &parsed_files {
        for dep in deps {
            // Try to resolve the target file path
            if let Some(target_path) = resolve_dependency(&file_node.path, &dep.target, &root_path) {
                // Add edge if both nodes exist
                if let (Some(&source_idx), Some(&target_idx)) = (
                    graph.node_map.get(&file_node.path),
                    graph.node_map.get(&target_path),
                ) {
                    graph.graph.add_edge(source_idx, target_idx, dep.dep_type.to_string());
                    graph.dependencies.push(dep.clone());
                }
            }
        }
    }
    
    Ok(graph)
}

/// Find all files matching the configuration
fn find_files(root_path: &Path, config: &BuilderConfig) -> Result<Vec<String>, String> {
    let mut files = Vec::new();
    
    for entry in walkdir::WalkDir::new(root_path)
        .into_iter()
        .filter_entry(|e| should_include_entry(e, config))
        .filter_map(|e| e.ok())
    {
        if entry.file_type().is_file() {
            if let Some(ext) = entry.path().extension().and_then(|e| e.to_str()) {
                if config.extensions.iter().any(|e| e == ext) {
                    if let Some(path_str) = entry.path().to_str() {
                        files.push(path_str.to_string());
                    }
                }
            }
        }
    }
    
    Ok(files)
}

/// Check if a directory entry should be included
fn should_include_entry(entry: &walkdir::DirEntry, config: &BuilderConfig) -> bool {
    if entry.file_type().is_dir() {
        if let Some(name) = entry.file_name().to_str() {
            return !config.exclude_folders.iter().any(|f| f == name);
        }
    }
    true
}

/// Resolve a dependency target to an actual file path
fn resolve_dependency(source_file: &str, target: &str, root_path: &Path) -> Option<String> {
    // Skip external packages (no leading ./ or ../)
    if !target.starts_with('.') && !target.starts_with('/') {
        return None;
    }
    
    let source_dir = Path::new(source_file).parent()?;
    let mut resolved = source_dir.join(target);
    
    // Try each possible extension
    let extensions = Language::from_extension(
        Path::new(source_file)
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or(""),
    ).extensions();
    
    // First try as-is (might be a directory with index file)
    if resolved.exists() {
        return resolved.to_str().map(|s| s.to_string());
    }
    
    // Try adding extensions
    for ext in extensions {
        let with_ext = resolved.with_extension(ext);
        if with_ext.exists() {
            return with_ext.to_str().map(|s| s.to_string());
        }
    }
    
    // Try index files for directories
    for index_name in ["index", "mod"] {
        for ext in extensions {
            let index_path = resolved.join(format!("{}.{}", index_name, ext));
            if index_path.exists() {
                return index_path.to_str().map(|s| s.to_string());
            }
        }
    }
    
    None
}

/// Convert DependencyType to string for edge weight
impl std::fmt::Display for parser::DependencyType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            parser::DependencyType::Import => write!(f, "import"),
            parser::DependencyType::Require => write!(f, "require"),
            parser::DependencyType::Include => write!(f, "include"),
            parser::DependencyType::Use => write!(f, "use"),
            parser::DependencyType::From => write!(f, "from"),
            parser::DependencyType::Extend => write!(f, "extend"),
            parser::DependencyType::Implement => write!(f, "implement"),
            parser::DependencyType::Other(s) => write!(f, "{}", s),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = BuilderConfig::default();
        assert!(config.extensions.contains(&"js".to_string()));
        assert!(config.exclude_folders.contains(&"node_modules".to_string()));
    }
}
