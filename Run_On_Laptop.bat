@echo off
SETLOCAL
SET PORT=8080

echo ==========================================================
echo       MYGYMDIARY CONSOLE - LOCAL SERVER
echo ==========================================================
echo.
echo Starting server at http://localhost:%PORT%
echo.
echo [!] Keep this window open to keep the website running.
echo [!] Press Ctrl+C and type 'Y' to stop the server.
echo.

powershell -windowstyle hidden -command "Start-Process 'http://localhost:%PORT%'"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$listener = New-Object System.Net.HttpListener; ^
     $listener.Prefixes.Add('http://localhost:%PORT%/'); ^
     try { ^
        $listener.Start(); ^
        while ($listener.IsListening) { ^
            $context = $listener.GetContext(); ^
            $request = $context.Request; ^
            $response = $context.Response; ^
            $path = $request.Url.LocalPath.TrimStart('/'); ^
            if ([string]::IsNullOrEmpty($path)) { $path = 'index.html' }; ^
            $filePath = Join-Path (Get-Location) $path; ^
            if (Test-Path $filePath -PathType Leaf) { ^
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower(); ^
                if ($ext -eq '.html') { $response.ContentType = 'text/html' } ^
                elseif ($ext -eq '.css') { $response.ContentType = 'text/css' } ^
                elseif ($ext -eq '.js') { $response.ContentType = 'application/javascript' } ^
                elseif ($ext -eq '.csv') { $response.ContentType = 'text/csv' } ^
                elseif ($ext -eq '.png') { $response.ContentType = 'image/png' } ^
                elseif ($ext -eq '.mp3') { $response.ContentType = 'audio/mpeg' } ^
                $response.AddHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); ^
                $response.AddHeader('Pragma', 'no-cache'); ^
                $response.AddHeader('Expires', '0'); ^
                $content = [System.IO.File]::ReadAllBytes($filePath); ^
                $response.OutputStream.Write($content, 0, $content.Length); ^
            } else { ^
                $response.StatusCode = 404; ^
            } ^
            $response.Close(); ^
        } ^
     } finally { ^
        $listener.Stop(); ^
     }"

pause
