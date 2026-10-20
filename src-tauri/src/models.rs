use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RouterProfile {
    pub id: String,
    pub name: String,
    pub host: String,
    pub http_port: u16,
    pub ssh_port: u16,
    pub username: String,
    pub auth_type: String, // "password" | "privateKey"
    pub password: Option<String>,
    pub private_key: Option<String>,
    pub use_https: bool,
    pub auto_connect: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConnectionTestResult {
    pub ubus_available: bool,
    pub ssh_available: bool,
    pub ubus_error: Option<String>,
    pub ssh_error: Option<String>,
    pub missing_packages: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SshExecResult {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UciUpdateResponse {
    pub success: bool,
    pub message: String,
}
