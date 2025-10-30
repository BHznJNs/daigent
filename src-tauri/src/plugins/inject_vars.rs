use std::collections::HashMap;

use tauri::{
  plugin::{Builder, TauriPlugin},
  Runtime,
};

fn create_init_script(vars: HashMap<&str, String>) -> String {
  let vars_str = vars
    .iter()
    .map(|(k, v)| format!("{}: '{}'", k, v))
    .collect::<Vec<_>>()
    .join(",\n");
  format!(
    r#"
        console.log("Successfully injected tauri variables");
        window.__INJECTED__ = {{
            {}
        }};
    "#,
    vars_str
  )
}

pub fn init<R: Runtime>(vars: HashMap<&str, String>) -> TauriPlugin<R> {
  let init_script = create_init_script(vars);
  Builder::new("inject_vars")
    .js_init_script(init_script)
    .build()
}