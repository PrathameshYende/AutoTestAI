# AutoTestAI static frontend server
param([int]$Port = 5173)

$root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")

$types = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".jsx"  = "text/plain; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

try {
    $listener.Start()
    Write-Host "AutoTestAI running at http://localhost:$Port/"
    Write-Host "Press Ctrl+C to stop."

    while ($listener.IsListening) {
        $ctx = $null

        try {
            $ctx = $listener.GetContext()
            $res = $ctx.Response

            $path = [Uri]::UnescapeDataString(
                $ctx.Request.Url.AbsolutePath.TrimStart('/')
            )

            if ([string]::IsNullOrWhiteSpace($path)) {
                $path = "index.html"
            }

            $file = [System.IO.Path]::GetFullPath(
                (Join-Path $root $path)
            )

            # Prevent requests from accessing files outside the frontend folder.
            $safeRoot = $root.TrimEnd('\') + '\'

            if (
                $file.StartsWith(
                    $safeRoot,
                    [System.StringComparison]::OrdinalIgnoreCase
                ) -and
                (Test-Path -LiteralPath $file -PathType Leaf)
            ) {
                $ext = [System.IO.Path]::GetExtension($file).ToLowerInvariant()
                $bytes = [System.IO.File]::ReadAllBytes($file)

                if ($types.ContainsKey($ext)) {
                    $res.ContentType = $types[$ext]
                } else {
                    $res.ContentType = "application/octet-stream"
                }

                $res.Headers["Cache-Control"] = "no-store"
                $res.StatusCode = 200
                $res.ContentLength64 = $bytes.Length

                if ($ctx.Request.HttpMethod -ne "HEAD") {
                    $res.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                Write-Host "200 $path"
            } else {
                $message = [System.Text.Encoding]::UTF8.GetBytes("404 - File not found")
                $res.StatusCode = 404
                $res.ContentType = "text/plain; charset=utf-8"
                $res.ContentLength64 = $message.Length
                $res.OutputStream.Write($message, 0, $message.Length)

                Write-Host "404 $path"
            }
        } catch {
            Write-Host "Request error: $($_.Exception.Message)"
        } finally {
            if ($null -ne $ctx) {
                try {
                    $ctx.Response.Close()
                } catch {
                    # Ignore errors when a client disconnects.
                }
            }
        }
    }
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }

    $listener.Close()
}