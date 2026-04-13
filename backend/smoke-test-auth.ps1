$ErrorActionPreference = 'Stop'
$base = 'http://127.0.0.1:4000'
$script:results = @()

function Call-Api {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Path,
        $Body = $null,
        [string]$Token = $null
    )

    try {
        $headers = @{}
        if ($Token) {
            $headers['Authorization'] = "Bearer $Token"
        }

        $params = @{
            Uri             = "$base$Path"
            Method          = $Method
            Headers         = $headers
            TimeoutSec      = 20
            UseBasicParsing = $true
        }

        if ($null -ne $Body) {
            $params['ContentType'] = 'application/json'
            $params['Body'] = ($Body | ConvertTo-Json -Depth 8)
        }

        $resp = Invoke-WebRequest @params
        $content = [string]$resp.Content
        if ($null -eq $content) { $content = '' }

        $script:results += [PSCustomObject]@{
            Step   = $Name
            Status = [int]$resp.StatusCode
            Detail = $content.Substring(0, [Math]::Min(180, $content.Length))
        }

        return $resp
    }
    catch {
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $content = $reader.ReadToEnd()
            if ($null -eq $content) { $content = '' }

            $script:results += [PSCustomObject]@{
                Step   = $Name
                Status = $statusCode
                Detail = $content.Substring(0, [Math]::Min(180, $content.Length))
            }
        }
        else {
            $script:results += [PSCustomObject]@{
                Step   = $Name
                Status = 'ERR'
                Detail = $_.Exception.Message
            }
        }

        return $null
    }
}

# Public endpoint
Call-Api -Name 'Public plans list' -Method 'GET' -Path '/api/plans' | Out-Null

# Admin auth flow
$adminResp = Call-Api -Name 'Admin login' -Method 'POST' -Path '/api/auth/login' -Body @{ identifier = 'gigadmin@gmail.com'; password = 'gigadmin@123' }
$adminToken = $null
if ($adminResp) {
    try {
        $adminToken = ($adminResp.Content | ConvertFrom-Json).token
    }
    catch {
        $adminToken = $null
    }
}

if ($adminToken) {
    Call-Api -Name 'Admin users list' -Method 'GET' -Path '/api/admin/users' -Token $adminToken | Out-Null
    Call-Api -Name 'Admin plans list' -Method 'GET' -Path '/api/admin/plans' -Token $adminToken | Out-Null
    Call-Api -Name 'Admin queries list' -Method 'GET' -Path '/api/admin/queries' -Token $adminToken | Out-Null
    Call-Api -Name 'Admin payments list' -Method 'GET' -Path '/api/admin/payments' -Token $adminToken | Out-Null
}
else {
    $script:results += [PSCustomObject]@{ Step = 'Admin token extraction'; Status = 'SKIP'; Detail = 'No token from admin login' }
}

# User auth flow via social login (non-OTP path)
$userEmail = ('qa.user.{0}@example.com' -f (Get-Date -Format 'yyyyMMddHHmmss'))
$userResp = Call-Api -Name 'User social login' -Method 'POST' -Path '/api/auth/social' -Body @{ email = $userEmail; name = 'QA User' }
$userToken = $null
if ($userResp) {
    try {
        $userToken = ($userResp.Content | ConvertFrom-Json).token
    }
    catch {
        $userToken = $null
    }
}

if ($userToken) {
    Call-Api -Name 'User profile me' -Method 'GET' -Path '/api/auth/me' -Token $userToken | Out-Null
    Call-Api -Name 'User subscriptions my' -Method 'GET' -Path '/api/subscriptions/my' -Token $userToken | Out-Null
    Call-Api -Name 'User notifications' -Method 'GET' -Path '/api/notifications' -Token $userToken | Out-Null
    Call-Api -Name 'User queries my' -Method 'GET' -Path '/api/queries/my' -Token $userToken | Out-Null
    Call-Api -Name 'User claim requests my' -Method 'GET' -Path '/api/claims/requests/my' -Token $userToken | Out-Null
}
else {
    $script:results += [PSCustomObject]@{ Step = 'User token extraction'; Status = 'SKIP'; Detail = 'No token from user social login' }
}

# Razorpay disabled check
Call-Api -Name 'Razorpay key endpoint' -Method 'GET' -Path '/api/payments/razorpay/key' | Out-Null

$script:results | ConvertTo-Json -Depth 5
