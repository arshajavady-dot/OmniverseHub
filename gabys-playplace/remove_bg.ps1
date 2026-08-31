Add-Type -AssemblyName System.Drawing

Write-Host "Processing Babysitter image..."
$path1 = "C:\Users\arsha\.gemini\antigravity\scratch\gabys-playplace\babysitter.png"
$orig1 = [System.Drawing.Bitmap]::FromFile($path1)
$bmp1 = New-Object System.Drawing.Bitmap($orig1)
$orig1.Dispose()

for ($x = 0; $x -lt $bmp1.Width; $x++) {
    for ($y = 0; $y -lt $bmp1.Height; $y++) {
        $c = $bmp1.GetPixel($x, $y)
        if ($c.R -gt 220 -and $c.G -gt 220 -and $c.B -gt 220) {
            $bmp1.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

$out1 = "C:\Users\arsha\.gemini\antigravity\scratch\gabys-playplace\babysitter_clean.png"
$bmp1.Save($out1, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp1.Dispose()
Move-Item $out1 $path1 -Force

Write-Host "Processing Jax Bunny image..."
$path2 = "C:\Users\arsha\.gemini\antigravity\scratch\gabys-playplace\jax_bunny.png"
$orig2 = [System.Drawing.Bitmap]::FromFile($path2)
$bmp2 = New-Object System.Drawing.Bitmap($orig2)
$orig2.Dispose()

for ($x = 0; $x -lt $bmp2.Width; $x++) {
    for ($y = 0; $y -lt $bmp2.Height; $y++) {
        $c = $bmp2.GetPixel($x, $y)
        if ($c.R -lt 35 -and $c.G -lt 35 -and $c.B -lt 35) {
            $bmp2.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

$out2 = "C:\Users\arsha\.gemini\antigravity\scratch\gabys-playplace\jax_bunny_clean.png"
$bmp2.Save($out2, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp2.Dispose()
Move-Item $out2 $path2 -Force

Write-Host "BACKGROUND REMOVAL COMPLETE!"
