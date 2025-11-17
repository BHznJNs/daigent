mod plugins;
mod utils;

use std::collections::HashMap;
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;
pub use utils::Args;

fn start_sidecar(app: tauri::AppHandle, server_port: u16) -> Result<(), String> {
  let mut child = app
    .shell()
    .sidecar("server")
    .expect("Failed to get sidecar")
    .args(["--port", &server_port.to_string()])
    .spawn()
    .expect("Failed to spawn sidecar");

  tauri::async_runtime::spawn(async move {
    while let Some(event) = child.0.recv().await {
      match event {
        CommandEvent::Stdout(line) => {
          println!("Sidecar output: {:?}", String::from_utf8(line));
        }
        CommandEvent::Stderr(line) => {
          eprintln!("Sidecar error: {:?}", String::from_utf8(line));
        }
        CommandEvent::Error(err) => {
          eprintln!("Sidecar error: {}", err);
        }
        CommandEvent::Terminated(code) => {
          println!("Sidecar exited with code: {:?}", code);
        }
        _ => {},
      }
    }
  });
  return Ok(());
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(args: Args) {
  const DEV_PORT: u16 = 1460;
  let server_port = if args.dev {
    DEV_PORT
  } else {
    utils::get_available_tcp_port().expect("Failed to get available port")
  };

  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(plugins::inject_vars::init(HashMap::from([
      ("dev", args.dev.to_string()),
      ("server_port", server_port.to_string()),
    ])))
    .setup(move |app| {
      if !args.dev {
        // only start sidecar in production mode
        start_sidecar(app.handle().clone(), server_port)?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
