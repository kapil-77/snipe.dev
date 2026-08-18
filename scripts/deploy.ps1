<#
.DESCRIPTION
Deploys every snipe.dev edge function to Supabase and lists their status.

Run from anywhere; it detects the project root from its own location.
Requires the Supabase CLI + a valid profile (`supabase login`) or
`SUPABASE_ACCESS_TOKEN` in the environment.

Examples:
  .\scripts\deploy.ps1               # deploy all functions, then list
  .\scripts\deploy.ps1 -OnlyVerify   # skip deploy; just list status
#>
param(
  [switch]$OnlyVerify
)

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)

$Functions = @('onboardtime-hello', 'prunblocker-hello', 'envsync-hello')

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

if (-not $OnlyVerify) {
  Write-Host ""
  Write-Host "---- deploying edge functions ----" -ForegroundColor DarkCyan
  foreach ($fn in $Functions) {
    Write-Host "  -> $fn"
    Invoke-Supabase -Arguments @('functions', 'deploy', $fn)
    Write-Host ""
  }
}

Write-Host "---- deployed functions ----" -ForegroundColor DarkCyan
Invoke-Supabase -Arguments @('functions', 'list')