@echo off
:: Start the APT-LABS Multi-Model Engine HTTP wrapper on :9000
:: Run this in a separate terminal before using the "engine" provider in chat.
"C:\Users\zION\Documents\dreamer\engine\.venv\Scripts\python.exe" engine\engine_http_server.py --port 9000
