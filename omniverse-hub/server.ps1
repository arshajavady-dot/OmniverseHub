# Zero-dependency PowerShell HTTP Server for OmniVerse Hub
$Port = 8080
$ScratchDir = (Get-Item "$PSScriptRoot\..").FullName

$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add("http://localhost:$Port/")
$Listener.Start()

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " 🌌 OmniVerse Hub PowerShell Server Running!" -ForegroundColor LightGreen
Write-Host " 👉 Open: http://localhost:$Port/omniverse-hub/index.html" -ForegroundColor Yellow
Write-Host " Press Ctrl+C in this window to stop the server." -ForegroundColor Gray
Write-Host "====================================================" -ForegroundColor Cyan

$MimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".mp3"  = "audio/mpeg"
    ".wasm" = "application/wasm"
}

try {
    while ($Listener.IsListening) {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response

        $UrlPath = [System.Uri]::UnescapeDataString($Request.Url.AbsolutePath)
        if ($UrlPath -eq "/") {
            $UrlPath = "/omniverse-hub/index.html"
        }

        $RelPath = $UrlPath.TrimStart('/').Replace('/', '\')
        $FilePath = [System.IO.Path]::Combine($ScratchDir, $RelPath)

        if ((Test-Path -Path $FilePath) -and -not (Test-Path -Path $FilePath -PathType Container)) {
            $Ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
            $ContentType = if ($MimeTypes.ContainsKey($Ext)) { $MimeTypes[$Ext] } else { "application/octet-stream" }
            
            $Response.Headers.Add("Access-Control-Allow-Origin", "*")
            $Response.ContentType = $ContentType
            $Bytes = [System.IO.File]::ReadAllBytes($FilePath)
            $Response.ContentLength64 = $Bytes.Length
            $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
        } else {
            $Response.StatusCode = 404
            $Buf = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $Response.OutputStream.Write($Buf, 0, $Buf.Length)
        }
        $Response.Close()
    }
} finally {
    $Listener.Stop()
}
