Add-Type -AssemblyName System.Drawing

$sourcePath = "public/logo.png"
$outputPath = "public/logo.png"

$bmp = New-Object System.Drawing.Bitmap($sourcePath)

$minX = $bmp.Width
$maxX = 0
$minY = $bmp.Height
$maxY = 0

# Loop through pixels to find bounding box of non-black content (step 2 for speed)
for ($x = 0; $x -lt $bmp.Width; $x += 2) {
    for ($y = 0; $y -lt $bmp.Height; $y += 2) {
        $pixel = $bmp.GetPixel($x, $y)
        if ($pixel.R -gt 15 -or $pixel.G -gt 15 -or $pixel.B -gt 15) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

# Add a clean padding of 8 pixels
$padding = 8
$minX = [Math]::Max(0, $minX - $padding)
$minY = [Math]::Max(0, $minY - $padding)
$maxX = [Math]::Min($bmp.Width - 1, $maxX + $padding)
$maxY = [Math]::Min($bmp.Height - 1, $maxY + $padding)

$width = $maxX - $minX
$height = $maxY - $minY

Write-Output "Detected Bounds: MinX=$minX, MinY=$minY, Width=$width, Height=$height"

if ($width -gt 0 -and $height -gt 0) {
    # Crop the image
    $rect = New-Object System.Drawing.Rectangle($minX, $minY, $width, $height)
    $cropped = $bmp.Clone($rect, $bmp.PixelFormat)
    $bmp.Dispose()
    
    # Save the cropped image back to public/logo.png
    $cropped.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()
    Write-Output "SUCCESS: Logo cropped successfully!"
} else {
    $bmp.Dispose()
    Write-Output "ERROR: Bounding box was empty."
}
