use notify::{RecommendedWatcher, RecursiveMode, Watcher, Config, EventKind};
use std::path::Path;
use std::sync::mpsc::channel;
use parking_lot::Mutex;
use std::sync::Arc;

/// File watcher that monitors a directory for changes
pub struct FileWatcher {
    /// The underlying notify watcher
    watcher: Option<RecommendedWatcher>,
    /// The path being watched
    watch_path: String,
    /// Callback to invoke when files change
    on_change: Arc<Mutex<Box<dyn Fn(Vec<String>) + Send + Sync>>>,
}

impl FileWatcher {
    /// Create a new file watcher for the given path
    pub fn new<F>(watch_path: &str, callback: F) -> Result<Self, String>
    where
        F: Fn(Vec<String>) + Send + Sync + 'static,
    {
        Ok(Self {
            watcher: None,
            watch_path: watch_path.to_string(),
            on_change: Arc::new(Mutex::new(Box::new(callback))),
        })
    }

    /// Start watching the directory
    pub fn start(&mut self) -> Result<(), String> {
        let on_change = self.on_change.clone();
        let watch_path = self.watch_path.clone();

        let (tx, rx) = channel();

        let mut watcher = RecommendedWatcher::new(tx, Config::default())
            .map_err(|e| format!("Failed to create watcher: {}", e))?;

        watcher.watch(Path::new(&watch_path), RecursiveMode::Recursive)
            .map_err(|e| format!("Failed to watch path: {}", e))?;

        // Spawn a thread to handle events
        std::thread::spawn(move || {
            while let Ok(result) = rx.recv() {
                match result {
                    Ok(event) => {
                        if let EventKind::Modify(_) | EventKind::Create(_) | EventKind::Remove(_) = event.kind {
                            let paths: Vec<String> = event.paths
                                .iter()
                                .filter_map(|p| p.to_str())
                                .map(|s| s.to_string())
                                .collect();
                            
                            if !paths.is_empty() {
                                let callback = on_change.lock();
                                callback(paths);
                            }
                        }
                    }
                    Err(e) => {
                        log::error!("Watch error: {:?}", e);
                    }
                }
            }
        });

        self.watcher = Some(watcher);
        Ok(())
    }

    /// Stop watching
    pub fn stop(&mut self) {
        self.watcher = None;
    }

    /// Check if the watcher is running
    pub fn is_running(&self) -> bool {
        self.watcher.is_some()
    }
}
