$ProgressPreference = 'SilentlyContinue'

$outputDir = "images\cards\sv151\large"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
    Write-Host "Opprettet mappe: $outputDir"
}

Write-Host "Henter kortliste fra API..."
$apiUrl   = "https://api.pokemontcg.io/v2/cards?q=set.id:sv3pt5&orderBy=number&pageSize=250"
$response = Invoke-RestMethod -Uri $apiUrl -Method Get
$cards    = $response.data
Write-Host "Fant $($cards.Count) kort`n"

$downloaded = 0
$skipped    = 0
$failed     = 0
$total      = $cards.Count

foreach ($card in $cards) {

    # Nummer: hent numerisk del og null-pad til 3 siffer
    $numStr    = $card.number -replace '[^0-9]', ''
    $paddedNum = if ($numStr -and [int]$numStr -gt 0) {
        ([int]$numStr).ToString("000")
    } else {
        $card.number.ToLower() -replace '[^a-z0-9]', ''
    }

    # Navn: lowercase, fjern apostrof, erstatt resten med bindestreker
    $name = $card.name.ToLower() -replace "[''']", '' -replace '[^a-z0-9]+', '-'
    $name = $name.Trim('-')

    $filename = "$paddedNum-$name.png"
    $filepath = Join-Path $outputDir $filename
    $imgUrl   = $card.images.large

    if (-not $imgUrl) {
        Write-Host "  HOPPER OVER (ingen large-bilde): $($card.name)"
        $failed++
        continue
    }

    if (Test-Path $filepath) {
        $skipped++
        continue
    }

    try {
        Invoke-WebRequest -Uri $imgUrl -OutFile $filepath -ErrorAction Stop
        $downloaded++
        Write-Host "  [$downloaded/$total] $filename"
    } catch {
        Write-Host "  FEIL [$($card.name)]: $_"
        $failed++
    }

    Start-Sleep -Milliseconds 150
}

Write-Host ""
Write-Host "==========================="
Write-Host "Lastet ned : $downloaded"
Write-Host "Allerede OK: $skipped"
Write-Host "Feilet     : $failed"
Write-Host "Mappe      : $outputDir"
