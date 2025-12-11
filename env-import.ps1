Get-Content .env | ForEach-Object {
    $name, $value = $_.Split('=', 2)
    if ($name -and $value) {
        [System.Environment]::SetEnvironmentVariable($name, $value, [System.EnvironmentVariableTarget]::Process)
    }
}
