$b64 = Get-Content -Path 'C:\Users\arsha\.gemini\antigravity\scratch\arspin\avatar_b64.txt' -Raw
$b64Winner = Get-Content -Path 'C:\Users\arsha\.gemini\antigravity\scratch\arspin\avatar_winner_b64.txt' -Raw
$html = Get-Content -Path 'C:\Users\arsha\.gemini\antigravity\scratch\arspin\index.html' -Raw
$js = Get-Content -Path 'C:\Users\arsha\.gemini\antigravity\scratch\arspin\app.js' -Raw

$imgData = "data:image/png;base64," + $b64.Trim()
$imgDataWinner = "data:image/png;base64," + $b64Winner.Trim()

$html = $html.Replace('src="avatar.png"', "src=""$imgData""")
$html = $html.Replace('src="avatar_winner.png"', "src=""$imgDataWinner""")

$inlineJs = "window.AVATAR_DEFAULT_SRC = ""$imgData"";`nwindow.AVATAR_WINNER_SRC = ""$imgDataWinner"";`n" + $js
$html = $html.Replace('<script src="app.js"></script>', "<script>`n$inlineJs`n</script>")

[System.IO.File]::WriteAllText('C:\Users\arsha\.gemini\antigravity\brain\4e82f2e8-7e86-47dd-8490-80060423342c\arspin.html', $html)
Write-Host "Bundle completed successfully!"
