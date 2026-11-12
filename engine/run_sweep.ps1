Remove-Item -Recurse -Force "$env:PYTHONPATH" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "C:\Users\zION\Documents\dreamer\engine\src\__pycache__" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "C:\Users\zION\Documents\dreamer\engine\src\engine\__pycache__" -ErrorAction SilentlyContinue
$env:PYTHONPATH="src"
& "C:\Users\zION\Documents\dreamer\engine\.venv\Scripts\python.exe" -u -m engine.cli sweep --levels "1,2,4,8" --max-tokens 200 2>&1
