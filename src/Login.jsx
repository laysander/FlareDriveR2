// src/Login.jsx
import React, { useState } from "react";
import { Box, Paper, Typography, TextField, Button, Alert } from "@mui/material";
import { setBasicAuth, authFetch, logout } from "./auth";

export default function Login({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // simpan dulu agar authFetch otomatis pakai header
      setBasicAuth(username, password);

      // Validasi: PROPFIND Depth: 0 ke root
      const res = await authFetch("/webdav/", {
        method: "PROPFIND",
        headers: {
          Depth: "0",
        },
      });

      if (!res.ok) {
        // kredensial salah atau server beda
        logout();
        setError(`Login gagal. Status: ${res.status}`);
        return;
      }

      onSuccess?.();
    } catch (err) {
      logout();
      setError(err?.message || "Login gagal");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Paper sx={{ width: 420, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Sign in
        </Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
            autoComplete="username"
          />
          <TextField
            label="Password"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
            autoComplete="current-password"
          />

          <Button type="submit" variant="contained" fullWidth disabled={submitting || !username || !password}>
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
