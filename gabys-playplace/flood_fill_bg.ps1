Add-Type -AssemblyName System.Drawing

# 1. Restore Fresh Original Jax Bunny & Babysitter Images
Copy-Item "C:/Users/arsha/.gemini/antigravity/brain/5d421eed-ccef-4efd-9844-e6aa8113fe84/.user_uploaded/media_1787845230741.png" "C:/Users/arsha/.gemini/antigravity/scratch/gabys-playplace/babysitter.png" -Force
Copy-Item "C:/Users/arsha/.gemini/antigravity/brain/5d421eed-ccef-4efd-9844-e6aa8113fe84/.user_uploaded/media_1787845235262.png" "C:/Users/arsha/.gemini/antigravity/scratch/gabys-playplace/jax_bunny.png" -Force

function Clean-JaxBunny {
    param([string]$FilePath)

    Write-Host "Processing Jax Bunny arm/body gaps and background..."
    $orig = [System.Drawing.Bitmap]::FromFile($FilePath)
    $bmp = New-Object System.Drawing.Bitmap($orig)
    $orig.Dispose()

    $w = $bmp.Width
    $h = $bmp.Height
    $transparent = [System.Drawing.Color]::FromArgb(0, 0, 0, 0)
    $headCutoffY = [math]::Truncate($h * 0.28) # Head & ears are in top 28%

    # 1. Below head (y >= headCutoffY): ALL dark pixels are background gaps (between arms & body, between legs, etc.)
    for ($x = 0; $x -lt $w; $x++) {
        for ($y = $headCutoffY; $y -lt $h; $y++) {
            $c = $bmp.GetPixel($x, $y)
            if ($c.R -le 35 -and $c.G -le 35 -and $c.B -le 35) {
                $bmp.SetPixel($x, $y, $transparent)
            }
        }
    }

    # 2. Top area (y < headCutoffY): Flood-fill from top border to clear outer space and gaps between ears, leaving eyes/mouth intact
    $visited = New-Object 'bool[]' ($w * $h)
    $q = New-Object System.Collections.Queue

    for ($x = 0; $x -lt $w; $x++) {
        $q.Enqueue($x) # top border
    }
    for ($y = 0; $y -lt $headCutoffY; $y++) {
        $q.Enqueue(($y * $w)) # left border
        $q.Enqueue(($y * $w + ($w - 1))) # right border
    }

    while ($q.Count -gt 0) {
        $idx = $q.Dequeue()
        if ($visited[$idx]) { continue }
        $visited[$idx] = $true

        $x = $idx % $w
        $y = [math]::Truncate($idx / $w)
        if ($y -ge $headCutoffY) { continue }

        $c = $bmp.GetPixel($x, $y)
        if ($c.R -le 35 -and $c.G -le 35 -and $c.B -le 35) {
            $bmp.SetPixel($x, $y, $transparent)

            if ($x + 1 -lt $w) { $n = $y * $w + ($x + 1); if (-not $visited[$n]) { $q.Enqueue($n) } }
            if ($x - 1 -ge 0) { $n = $y * $w + ($x - 1); if (-not $visited[$n]) { $q.Enqueue($n) } }
            if ($y + 1 -lt $headCutoffY) { $n = ($y + 1) * $w + $x; if (-not $visited[$n]) { $q.Enqueue($n) } }
            if ($y - 1 -ge 0) { $n = ($y - 1) * $w + $x; if (-not $visited[$n]) { $q.Enqueue($n) } }
        }
    }

    $outPath = $FilePath + ".clean.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Move-Item $outPath $FilePath -Force
    Write-Host "Jax Bunny arm gaps and background cleaned successfully!"
}

function Clean-Babysitter {
    param([string]$FilePath)

    Write-Host "Processing Babysitter outer white background..."
    $orig = [System.Drawing.Bitmap]::FromFile($FilePath)
    $bmp = New-Object System.Drawing.Bitmap($orig)
    $orig.Dispose()

    $w = $bmp.Width
    $h = $bmp.Height
    $transparent = [System.Drawing.Color]::FromArgb(0, 0, 0, 0)
    $visited = New-Object 'bool[]' ($w * $h)
    $q = New-Object System.Collections.Queue

    for ($x = 0; $x -lt $w; $x++) {
        $q.Enqueue($x)
        $q.Enqueue((($h - 1) * $w + $x))
    }
    for ($y = 0; $y -lt $h; $y++) {
        $q.Enqueue(($y * $w))
        $q.Enqueue(($y * $w + ($w - 1)))
    }

    while ($q.Count -gt 0) {
        $idx = $q.Dequeue()
        if ($visited[$idx]) { continue }
        $visited[$idx] = $true

        $x = $idx % $w
        $y = [math]::Truncate($idx / $w)

        $c = $bmp.GetPixel($x, $y)
        if ($c.R -ge 215 -and $c.G -ge 215 -and $c.B -ge 215) {
            $bmp.SetPixel($x, $y, $transparent)

            if ($x + 1 -lt $w) { $n = $y * $w + ($x + 1); if (-not $visited[$n]) { $q.Enqueue($n) } }
            if ($x - 1 -ge 0) { $n = $y * $w + ($x - 1); if (-not $visited[$n]) { $q.Enqueue($n) } }
            if ($y + 1 -lt $h) { $n = ($y + 1) * $w + $x; if (-not $visited[$n]) { $q.Enqueue($n) } }
            if ($y - 1 -ge 0) { $n = ($y - 1) * $w + $x; if (-not $visited[$n]) { $q.Enqueue($n) } }
        }
    }

    $outPath = $FilePath + ".clean.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Move-Item $outPath $FilePath -Force
    Write-Host "Babysitter outer background cleaned successfully!"
}

Clean-JaxBunny -FilePath "C:\Users\arsha\.gemini\antigravity\scratch\gabys-playplace\jax_bunny.png"
Clean-Babysitter -FilePath "C:\Users\arsha\.gemini\antigravity\scratch\gabys-playplace\babysitter.png"

Write-Host "ARM GAPS AND ALL BACKGROUNDS REMOVED PERFECTLY!"
