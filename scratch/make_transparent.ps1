Add-Type -AssemblyName System.Drawing

$sourcePath = "c:\Users\PROBOOK\Documents\Desarrollo\futbol-manager\public\logo-main.png"
if (-not (Test-Path $sourcePath)) {
    $sourcePath = "c:\Users\PROBOOK\Documents\Desarrollo\futbol-manager\public\logo.png"
}
$outputPath = "c:\Users\PROBOOK\Documents\Desarrollo\futbol-manager\public\logo.png"

Write-Host "Loading image from $sourcePath..."
$bmp = New-Object System.Drawing.Bitmap($sourcePath)

$minX = $bmp.Width
$maxX = 0
$minY = $bmp.Height
$maxY = 0

Write-Host "Creating transparent canvas..."
$newBmp = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height)
$g = [System.Drawing.Graphics]::FromImage($newBmp)
$g.Clear([System.Drawing.Color]::Transparent)

Write-Host "Processing pixels (removing near-black background)..."
for ($x = 0; $x -lt $bmp.Width; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $pixel = $bmp.GetPixel($x, $y)
        
        # Check if pixel is near-black (threshold 30)
        if ($pixel.R -lt 30 -and $pixel.G -lt 30 -and $pixel.B -lt 30) {
            $newBmp.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        } else {
            $newBmp.SetPixel($x, $y, $pixel)
            
            # Update bounds
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$g.Dispose()
$bmp.Dispose()

# Crop padding
$padding = 8
$minX = [Math]::Max(0, $minX - $padding)
$minY = [Math]::Max(0, $minY - $padding)
$maxX = [Math]::Min($newBmp.Width - 1, $maxX + $padding)
$maxY = [Math]::Min($newBmp.Height - 1, $maxY + $padding)

$width = $maxX - $minX
$height = $maxY - $minY

Write-Host "Bounds calculated: MinX=$minX, MinY=$minY, Width=$width, Height=$height"

if ($width -gt 0 -and $height -gt 0) {
    Write-Host "Cropping and saving image to $outputPath..."
    $rect = New-Object System.Drawing.Rectangle($minX, $minY, $width, $height)
    $cropped = $newBmp.Clone($rect, $newBmp.PixelFormat)
    $newBmp.Dispose()
    
    # Try deleting original if saving to same path, or just save
    if (Test-Path $outputPath) {
        Remove-Item $outputPath -Force
    }
    
    $cropped.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()
    Write-Host "SUCCESS: Background is now 100% transparent!"
} else {
    $newBmp.Dispose()
    Write-Host "ERROR: Bounding box empty!"
}
