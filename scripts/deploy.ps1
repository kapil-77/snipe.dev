<#
.DESCRIPTION
Deploys snipe.dev edge functions, pushes pending migrations, then lists status.

Run from anywhere; it detects the project root from its own location.
Requires the Supabase CLI + a valid profile (`supabase login`) or
`SUPABASE_ACCESS_TOKEN` in the environment.

Examples:
  .\scripts\deploy.ps1               # deploy functions + push migrations, then list
  .\scripts\deploy.ps1 -OnlyVerify   # list-only status check
  .\scripts\deploy.ps1 -DBOnly       # apply pending migrations (grants) only, then list
#>
param(
  [switch]$OnlyVerify,
  [switch]$DBOnly
)

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)

$Functions = @(
    'onboardtime-hello', 'onboardtime-bootstrap',
    'onboardtime-runbooks', 'onboardtime-items',
    'prunblocker-hello', 'envsync-hello'
  )

function Invoke-Supabase {
  param([string[]]$Arguments)
  $cmd = Get-Command supabase -ErrorAction SilentlyContinue
  if (-not $cmd) {
    throw 'Supabase CLI not found. Install it with: winget install Supabase.CLI  (or: npm install -g supabase)'
  }
  & $cmd.Source @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "supabase $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
  }
}

Write-Host "---- snipe.dev | supabase CLI ----" -ForegroundColor DarkCyan
Invoke-Supabase -Arguments @('--version')

if (-not $OnlyVerify -and -not $DBOnly) {
  Write-Host ""
  Write-Host "---- deploying edge functions ----" -ForegroundColor DarkCyan
  foreach ($fn in $Functions) {
    Write-Host "  -> $fn"
    Invoke-Supabase -Arguments @('functions', 'deploy', $fn)
    Write-Host ""
  }
}

Write-Host ""
Write-Host "---- applying migrations / grants ----" -ForegroundColor DarkCyan
Invoke-Supabase -Arguments @('db', 'push')

Write-Host ""
Write-Host "---- deployed functions ----" -ForegroundColor DarkCyan
Invoke-Supabase -Arguments @('functions', 'list')