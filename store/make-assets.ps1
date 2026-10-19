# Regenerates the Microsoft Store tile and logo images in build/appx from build/icon.png (1024x1024). Run from the repo root:
#   powershell -ExecutionPolicy Bypass -File store/make-assets.ps1
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile((Resolve-Path 'build/icon.png'))
$out = 'build/appx'
New-Item -ItemType Directory -Force -Path $out | Out-Null
$bg = [System.Drawing.ColorTranslator]::FromHtml('#020617')

function Save-Image($name, $w, $h, $iconSize) {
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'HighQuality'; $g.InterpolationMode = 'HighQualityBicubic'; $g.PixelOffsetMode = 'HighQuality'
  if ($iconSize -lt [Math]::Min($w, $h)) { $g.Clear($bg) } else { $g.Clear([System.Drawing.Color]::Transparent) }
  $x = [int](($w - $iconSize) / 2); $y = [int](($h - $iconSize) / 2)
  $g.DrawImage($src, $x, $y, $iconSize, $iconSize)
  $g.Dispose()
  $bmp.Save((Join-Path (Resolve-Path $out) $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

Save-Image 'StoreLogo.png' 50 50 50
Save-Image 'Square44x44Logo.png' 44 44 44
Save-Image 'Square150x150Logo.png' 150 150 150
Save-Image 'Wide310x150Logo.png' 310 150 120
Save-Image 'SmallTile.png' 71 71 71
Save-Image 'LargeTile.png' 310 310 310
Save-Image 'BadgeLogo.png' 24 24 24
Save-Image 'SplashScreen.png' 620 300 200
$src.Dispose()
Get-ChildItem $out | Select-Object Name, Length
