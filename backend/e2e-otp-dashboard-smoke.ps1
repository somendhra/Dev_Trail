$ErrorActionPreference = 'Stop'
$base = 'http://127.0.0.1:4000'
$frontend = 'http://localhost:5173'
$script:results = @()

function Add-Result {
    param([string]$Step, [string]$Status, [string]$Detail)
    $script:results += [PSCustomObject]@{
        Step = $Step
        Status = $Status
        Detail = $Detail
    }
}

function Invoke-Json {
    param(
        [string]$Method,
        [string]$Url,
        $Body = $null,
        [string]$Token = $null
    )

    try {
        $headers = @{}
        if ($Token) {
            $headers['Authorization'] = "Bearer $Token"
        }

        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $headers
            TimeoutSec = 25
            UseBasicParsing = $true
        }

        if ($null -ne $Body) {
            $params['ContentType'] = 'application/json'
            $params['Body'] = ($Body | ConvertTo-Json -Depth 8)
        }

        $resp = Invoke-WebRequest @params
        $text = [string]$resp.Content
        $json = $null
        try {
            if ($text) { $json = $text | ConvertFrom-Json }
        } catch {}

        return [PSCustomObject]@{
            ok = $true
            status = [int]$resp.StatusCode
            text = $text
            json = $json
        }
    } catch {
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $text = $reader.ReadToEnd()
            $json = $null
            try {
                if ($text) { $json = $text | ConvertFrom-Json }
            } catch {}

            return [PSCustomObject]@{
                ok = $false
                status = $statusCode
                text = $text
                json = $json
            }
        }

        return [PSCustomObject]@{
            ok = $false
            status = 'ERR'
            text = $_.Exception.Message
            json = $null
        }
    }
}

function Short-Text {
    param([string]$Text, [int]$Max = 180)
    if ($null -eq $Text) { return '' }
    if ($Text.Length -le $Max) { return $Text }
    return $Text.Substring(0, $Max)
}

# Frontend routes
foreach ($route in @('/', '/login', '/register', '/dashboard')) {
    $resp = Invoke-Json -Method 'GET' -Url "$frontend$route"
    Add-Result -Step "Frontend route $route" -Status ([string]$resp.status) -Detail (Short-Text -Text $resp.text -Max 90)
}

$seed = Get-Date -Format 'yyyyMMddHHmmss'
$regEmail = "gigprotectiontrails+e2e$seed@gmail.com"
$regPhone = '9' + (Get-Random -Minimum 100000000 -Maximum 999999999)

# Register init OTP
$registerInit = Invoke-Json -Method 'POST' -Url "$base/api/auth/register-init" -Body @{ email = $regEmail; phone = $regPhone }
Add-Result -Step 'Register init OTP send' -Status ([string]$registerInit.status) -Detail (Short-Text -Text $registerInit.text)

# Admin login
$adminLogin = Invoke-Json -Method 'POST' -Url "$base/api/auth/login" -Body @{ identifier = 'gigadmin@gmail.com'; password = 'gigadmin@123' }
$adminToken = if ($adminLogin.json) { $adminLogin.json.token } else { $null }
Add-Result -Step 'Admin login' -Status ([string]$adminLogin.status) -Detail (Short-Text -Text $adminLogin.text)

# User bootstrap
$userEmail = "qa.otpflow.$seed@example.com"
$userBootstrap = Invoke-Json -Method 'POST' -Url "$base/api/auth/social" -Body @{ email = $userEmail; name = 'QA OTP Flow' }
$userBootstrapToken = if ($userBootstrap.json) { $userBootstrap.json.token } else { $null }
Add-Result -Step 'User social login bootstrap' -Status ([string]$userBootstrap.status) -Detail (Short-Text -Text $userBootstrap.text)

if ($userBootstrapToken) {
    $setPassword = Invoke-Json -Method 'PUT' -Url "$base/api/auth/me" -Token $userBootstrapToken -Body @{ password = 'E2Epass@123' }
    Add-Result -Step 'Set user password' -Status ([string]$setPassword.status) -Detail (Short-Text -Text $setPassword.text -Max 140)

    $loginOtp = Invoke-Json -Method 'POST' -Url "$base/api/auth/login" -Body @{ identifier = $userEmail; password = 'E2Epass@123' }
    Add-Result -Step 'User login credentials (expect OTP)' -Status ([string]$loginOtp.status) -Detail (Short-Text -Text $loginOtp.text)

    if ($adminToken) {
        $usersResp = Invoke-Json -Method 'GET' -Url "$base/api/admin/users" -Token $adminToken
        Add-Result -Step 'Admin users list access' -Status ([string]$usersResp.status) -Detail 'Fetched user list'

        $hasPassword = $false
        $hasOtp = $false
        $hasOtpExpiry = $false
        if ($usersResp.text) {
            $hasPassword = $usersResp.text -match '"password"\s*:'
            $hasOtp = $usersResp.text -match '"otp"\s*:'
            $hasOtpExpiry = $usersResp.text -match '"otpExpiry"\s*:'
        }

        if (-not $hasPassword -and -not $hasOtp -and -not $hasOtpExpiry) {
            Add-Result -Step 'Sensitive fields redacted in /admin/users' -Status 'OK' -Detail 'password, otp, otpExpiry are not exposed'
        } else {
            Add-Result -Step 'Sensitive fields redacted in /admin/users' -Status 'FAIL' -Detail ("password=" + $hasPassword + ", otp=" + $hasOtp + ", otpExpiry=" + $hasOtpExpiry)
        }

        # OTP is intentionally not exposed anymore. Verify that random OTP does NOT authenticate.
        $verifyOtp = Invoke-Json -Method 'POST' -Url "$base/api/auth/verify-otp" -Body @{ identifier = $userEmail; otp = '000000' }
        if ([string]$verifyOtp.status -eq '400') {
            Add-Result -Step 'OTP verification rejects invalid OTP' -Status 'OK' -Detail (Short-Text -Text $verifyOtp.text -Max 120)
        } else {
            Add-Result -Step 'OTP verification rejects invalid OTP' -Status ([string]$verifyOtp.status) -Detail (Short-Text -Text $verifyOtp.text -Max 120)
        }

        # Dashboard can still be validated using the bootstrap token from social login.
        $meAfter = Invoke-Json -Method 'GET' -Url "$base/api/auth/me" -Token $userBootstrapToken
        Add-Result -Step 'User me (bootstrap token)' -Status ([string]$meAfter.status) -Detail (Short-Text -Text $meAfter.text -Max 140)

        $dashboard = Invoke-Json -Method 'GET' -Url "$base/api/subscriptions/dashboard" -Token $userBootstrapToken
        Add-Result -Step 'Dashboard summary API (bootstrap token)' -Status ([string]$dashboard.status) -Detail (Short-Text -Text $dashboard.text)
    } else {
        Add-Result -Step 'Sensitive fields redacted in /admin/users' -Status 'SKIP' -Detail 'Admin token unavailable'
        Add-Result -Step 'OTP verification rejects invalid OTP' -Status 'SKIP' -Detail 'Admin token unavailable'

        $meAfter = Invoke-Json -Method 'GET' -Url "$base/api/auth/me" -Token $userBootstrapToken
        Add-Result -Step 'User me (bootstrap token)' -Status ([string]$meAfter.status) -Detail (Short-Text -Text $meAfter.text -Max 140)

        $dashboard = Invoke-Json -Method 'GET' -Url "$base/api/subscriptions/dashboard" -Token $userBootstrapToken
        Add-Result -Step 'Dashboard summary API (bootstrap token)' -Status ([string]$dashboard.status) -Detail (Short-Text -Text $dashboard.text)
    }
} else {
    Add-Result -Step 'Set user password' -Status 'SKIP' -Detail 'User bootstrap failed'
    Add-Result -Step 'User login credentials (expect OTP)' -Status 'SKIP' -Detail 'User bootstrap failed'
    Add-Result -Step 'Sensitive fields redacted in /admin/users' -Status 'SKIP' -Detail 'User bootstrap failed'
    Add-Result -Step 'OTP verification rejects invalid OTP' -Status 'SKIP' -Detail 'User bootstrap failed'
    Add-Result -Step 'User me (bootstrap token)' -Status 'SKIP' -Detail 'User bootstrap failed'
    Add-Result -Step 'Dashboard summary API (bootstrap token)' -Status 'SKIP' -Detail 'User bootstrap failed'
}

$script:results | ConvertTo-Json -Depth 5
