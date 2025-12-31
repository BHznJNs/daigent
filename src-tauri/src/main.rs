// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use clap::Parser;
use dais_lib::Args;

fn main() {
    let args = Args::parse();
    dais_lib::run(args);
}
