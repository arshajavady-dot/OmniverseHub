# Windows PowerShell HTTP Static File Server for E-MOOD AI
Param(
    [int]$Port = 3000
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Prefixes.Add("http://127.0.0.1:$Port/")

try {
    $listener.Start()
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "  E-MOOD AI Web App Running Successfully!" -ForegroundColor Green
    Write-Host "  Access in Browser: http://localhost:$Port/" -ForegroundColor Yellow
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        try {
            $path = $request.Url.LocalPath
            if ($path -eq "/") { $path = "/index.html" }

            $localPath = Join-Path $PSScriptRoot $path.TrimStart('/')

            if (Test-Path $localPath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
                $mime = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "text/javascript; charset=utf-8" }
                    ".json" { "application/json" }
                    ".png"  { "image/png" }
                    ".jpg"  { "image/jpeg" }
                    ".svg"  { "image/svg+xml" }
                    ".wasm" { "application/wasm" }
                    default { "application/octet-stream" }
                }

                $bytes = [System.IO.File]::ReadAllBytes($localPath)
                $response.ContentType = $mime
                $response.ContentLength64 = $bytes.Length
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
                $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
        } catch {
            # Catch per-request errors without crashing server loop
        } finally {
            $response.Close()
        }
    }
} catch {
    Write-Host "Server error: $_" -ForegroundColor Red
} finally {
    if ($listener.IsListening) { $listener.Stop() }
}
