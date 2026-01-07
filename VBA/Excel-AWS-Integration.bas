Attribute VB_Name = "AWSIntegration"
' ================================================================
' AWS-Excel Integration Module
' Provides Excel with AWS service capabilities
' ================================================================

Option Explicit

' AWS Configuration Variables
Private Const AWS_REGION As String = "us-east-1"
Private AWSAccessKey As String
Private AWSSecretKey As String
Private AWSSessionToken As String
Private AWSProfile As String

' ================================================================
' SETUP & CONFIGURATION
' ================================================================

Public Sub ConfigureAWSCredentials()
    ' Configure AWS access: allow AWS CLI profile or Windows Credential Manager
    Dim choice As String
    choice = InputBox("Choose credential storage: (1) AWS CLI profile, (2) Windows Credential Manager" & vbCrLf & _
                      "Enter 1 or 2:", "AWS Configuration", "1")
    If Trim(choice) = "2" Then
        Dim profile As String, access As String, secret As String
        profile = InputBox("Enter a logical profile name to use for Windows Credential Manager:", "AWS Configuration", "default")
        If profile = "" Then profile = "default"
        access = InputBox("Enter your AWS Access Key ID (will be stored securely):", "AWS Configuration")
        secret = InputBox("Enter your AWS Secret Access Key (will be stored securely):", "AWS Configuration")
        If access <> "" And secret <> "" Then
            AWSProfile = profile
            SaveCredentialsToWindowsCredentialManager AWSProfile, access, secret
            MsgBox "AWS credentials stored to Windows Credential Manager under profile '" & AWSProfile & "'", vbInformation
            SaveCredentialsToSheet
        Else
            MsgBox "Credentials required.", vbExclamation
        End If
    Else
        profile = InputBox("Enter AWS CLI profile name to use (leave blank to use default):", "AWS Configuration", "default")
        If profile = "" Then profile = "default"
        AWSProfile = profile
        MsgBox "AWS profile set to '" & AWSProfile & "'", vbInformation
        SaveCredentialsToSheet
    End If
End Sub

Private Sub SaveCredentialsToSheet()
    ' Save configuration to hidden sheet (do not store secret keys here)
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Sheets("AWSConfig")
    On Error GoTo 0
    
    If ws Is Nothing Then
        Set ws = ThisWorkbook.Sheets.Add
        ws.Name = "AWSConfig"
        ws.Visible = xlSheetVeryHidden
    End If
    
    ws.Range("A1").Value = "Profile"
    ws.Range("B1").Value = AWSProfile
    ws.Range("A2").Value = "Region"
    ws.Range("B2").Value = AWS_REGION
    ws.Range("A4").Value = "UseWinCred"
    ws.Range("B4").Value = IIf(AWSProfile <> "", "1", "0")
End Sub

Private Sub LoadCredentialsFromSheet()
    On Error Resume Next
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("AWSConfig")
    
    If Not ws Is Nothing Then
        AWSProfile = ws.Range("B1").Value
        If AWSProfile = "" Then AWSProfile = "default"
        ' If UseWinCred flag present, attempt to load access/secret from Windows Credential Manager
        On Error Resume Next
        Dim useWin As String
        useWin = ws.Range("B4").Value
        On Error GoTo 0
        If useWin = "1" Then
            Dim aKey As String, sKey As String
            If LoadCredentialsFromWindowsCredentialManager(AWSProfile, aKey, sKey) Then
                AWSAccessKey = aKey
                AWSSecretKey = sKey
            End If
        End If
    End If
    On Error GoTo 0
End Sub

' ================================================================
' S3 OPERATIONS
' ================================================================

Public Function UploadToS3(bucketName As String, fileName As String, filePath As String) As Boolean
    ' Upload file to S3 bucket using AWS CLI
    On Error GoTo ErrorHandler

    LoadCredentialsFromSheet

    Dim cmd As String, out As String, exitCode As Long
    cmd = "aws s3 cp """ & filePath & """ ""s3://" & bucketName & "/" & fileName & """ --region " & AWS_REGION & IIf(AWSProfile <> "", " --profile " & AWSProfile, "")
    exitCode = ExecCommandWithRetry(cmd, out, 3, 2)

    If exitCode = 0 Then
        UploadToS3 = True
        MsgBox "File uploaded successfully to S3!", vbInformation
    Else
        MsgBox "Upload failed (exit " & exitCode & "): " & out, vbCritical
        UploadToS3 = False
    End If

    Exit Function

ErrorHandler:
    MsgBox "Error uploading to S3: " & Err.Description, vbCritical
    UploadToS3 = False
End Function

Public Function DownloadFromS3(bucketName As String, fileName As String, savePath As String) As Boolean
    ' Download file from S3 using AWS CLI
    On Error GoTo ErrorHandler

    LoadCredentialsFromSheet

    Dim cmd As String, out As String, exitCode As Long
    cmd = "aws s3 cp ""s3://" & bucketName & "/" & fileName & """ """ & savePath & """ --region " & AWS_REGION & IIf(AWSProfile <> "", " --profile " & AWSProfile, "")
    exitCode = ExecCommandWithRetry(cmd, out, 3, 2)

    If exitCode = 0 Then
        DownloadFromS3 = True
        MsgBox "File downloaded successfully from S3!", vbInformation
    Else
        MsgBox "Download failed (exit " & exitCode & "): " & out, vbCritical
        DownloadFromS3 = False
    End If

    Exit Function

ErrorHandler:
    MsgBox "Error downloading from S3: " & Err.Description, vbCritical
    DownloadFromS3 = False
End Function

Public Function ListS3Objects(bucketName As String) As Collection
    ' List objects in S3 bucket using AWS CLI
    On Error GoTo ErrorHandler

    LoadCredentialsFromSheet

    Dim cmd As String, out As String, exitCode As Long
    cmd = "aws s3api list-objects-v2 --bucket " & bucketName & " --region " & AWS_REGION & " --query 'Contents[].Key' --output text" & IIf(AWSProfile <> "", " --profile " & AWSProfile, "")
    exitCode = ExecCommandWithRetry(cmd, out, 3, 2)

    Dim objList As New Collection
    If exitCode = 0 Then
        Dim lines() As String, i As Long
        lines = Split(out, vbNewLine)
        For i = LBound(lines) To UBound(lines)
            If Trim(lines(i)) <> "" Then objList.Add Trim(lines(i))
        Next i
        MsgBox "Found " & objList.Count & " objects in bucket", vbInformation
    Else
        MsgBox "List failed: " & out, vbExclamation
    End If

    Set ListS3Objects = objList
    Exit Function

ErrorHandler:
    MsgBox "Error listing S3 objects: " & Err.Description, vbCritical
    Set ListS3Objects = New Collection
End Function

' ================================================================
' AWS LAMBDA OPERATIONS
' ================================================================

Public Function InvokeLambdaFunction(functionName As String, payload As String) As String
    ' Invoke AWS Lambda using AWS CLI (payload written to temp file)
    On Error GoTo ErrorHandler

    LoadCredentialsFromSheet

    Dim tmpPayload As String, tmpOut As String
    tmpPayload = Environ("TEMP") & "\lambda_payload_" & Format(Now, "yyyymmddhhnnss") & ".json"
    tmpOut = Environ("TEMP") & "\lambda_output_" & Format(Now, "yyyymmddhhnnss") & ".json"
    WriteTextFile tmpPayload, payload

    Dim cmd As String, out As String, exitCode As Long
    cmd = "aws lambda invoke --function-name " & functionName & " --payload file://""" & tmpPayload & """ """ & tmpOut & """ --region " & AWS_REGION & " --cli-binary-format raw-in-base64-out" & IIf(AWSProfile <> "", " --profile " & AWSProfile, "")
    exitCode = ExecCommandWithRetry(cmd, out, 3, 2)

    If exitCode = 0 Then
        Dim resultText As String
        resultText = ReadFileContent(tmpOut)
        InvokeLambdaFunction = resultText
        MsgBox "Lambda function invoked successfully!", vbInformation
    Else
        InvokeLambdaFunction = "Error: " & exitCode & " - " & out
        MsgBox "Lambda invocation failed: " & out, vbCritical
    End If

    On Error Resume Next
    Kill tmpPayload
    Kill tmpOut
    On Error GoTo 0

    Exit Function

ErrorHandler:
    MsgBox "Error invoking Lambda: " & Err.Description, vbCritical
    InvokeLambdaFunction = "Error: " & Err.Description
End Function

' ================================================================
' AWS DYNAMODB OPERATIONS
' ================================================================

Public Function PutItemDynamoDB(tableName As String, itemJSON As String) As Boolean
    ' Put item into DynamoDB using AWS CLI (item JSON written to temp file)
    On Error GoTo ErrorHandler

    LoadCredentialsFromSheet

    Dim tmpItem As String
    tmpItem = Environ("TEMP") & "\dynamo_item_" & Format(Now, "yyyymmddhhnnss") & ".json"
    WriteTextFile tmpItem, itemJSON

    Dim cmd As String, out As String, exitCode As Long
    cmd = "aws dynamodb put-item --table-name " & tableName & " --item file://""" & tmpItem & """ --region " & AWS_REGION & IIf(AWSProfile <> "", " --profile " & AWSProfile, "")
    exitCode = ExecCommandWithRetry(cmd, out, 3, 2)

    If exitCode = 0 Then
        PutItemDynamoDB = True
        MsgBox "Item added to DynamoDB successfully!", vbInformation
    Else
        PutItemDynamoDB = False
        MsgBox "DynamoDB put failed: " & out, vbCritical
    End If

    On Error Resume Next
    Kill tmpItem
    On Error GoTo 0

    Exit Function

ErrorHandler:
    MsgBox "Error putting item to DynamoDB: " & Err.Description, vbCritical
    PutItemDynamoDB = False
End Function

Public Function QueryDynamoDB(tableName As String, keyCondition As String) As String
    ' Query DynamoDB using AWS CLI. keyCondition should be a JSON fragment or expression; we build a CLI input JSON file.
    On Error GoTo ErrorHandler

    LoadCredentialsFromSheet

    Dim tmpQuery As String
    tmpQuery = Environ("TEMP") & "\dynamo_query_" & Format(Now, "yyyymmddhhnnss") & ".json"
    Dim queryJSON As String
    queryJSON = "{""TableName"":""" & tableName & """,""KeyConditionExpression"":""" & keyCondition & """}"
    WriteTextFile tmpQuery, queryJSON

    Dim cmd As String, out As String, exitCode As Long
    cmd = "aws dynamodb query --cli-input-json file://""" & tmpQuery & """ --region " & AWS_REGION & IIf(AWSProfile <> "", " --profile " & AWSProfile, "")
    exitCode = ExecCommandWithRetry(cmd, out, 3, 2)

    If exitCode = 0 Then
        QueryDynamoDB = out
    Else
        QueryDynamoDB = "Error: " & out
    End If

    On Error Resume Next
    Kill tmpQuery
    On Error GoTo 0

    Exit Function

ErrorHandler:
    MsgBox "Error querying DynamoDB: " & Err.Description, vbCritical
    QueryDynamoDB = "Error: " & Err.Description
End Function

' ================================================================
' EXCEL DATA TO AWS
' ================================================================

Public Sub ExportRangeToS3()
    ' Export selected Excel range to S3 as CSV
    Dim selectedRange As Range
    Set selectedRange = Selection
    
    If selectedRange Is Nothing Then
        MsgBox "Please select a range to export", vbExclamation
        Exit Sub
    End If
    
    Dim bucketName As String
    bucketName = InputBox("Enter S3 bucket name:", "Export to S3")
    
    If bucketName = "" Then Exit Sub
    
    Dim fileName As String
    fileName = InputBox("Enter file name (e.g., data.csv):", "Export to S3", "export.csv")
    
    If fileName = "" Then Exit Sub
    
    ' Convert range to CSV
    Dim csvContent As String
    csvContent = RangeToCSV(selectedRange)
    
    ' Save temporarily
    Dim tempPath As String
    tempPath = Environ("TEMP") & "\" & fileName
    
    Dim fso As Object
    Set fso = CreateObject("Scripting.FileSystemObject")
    Dim textFile As Object
    Set textFile = fso.CreateTextFile(tempPath, True)
    textFile.Write csvContent
    textFile.Close
    
    ' Upload to S3
    If UploadToS3(bucketName, fileName, tempPath) Then
        MsgBox "Data exported to S3 successfully!", vbInformation
    End If
    
    ' Cleanup
    fso.DeleteFile tempPath
End Sub

Public Sub ImportFromS3ToExcel()
    ' Import CSV from S3 to Excel
    Dim bucketName As String
    bucketName = InputBox("Enter S3 bucket name:", "Import from S3")
    
    If bucketName = "" Then Exit Sub
    
    Dim fileName As String
    fileName = InputBox("Enter file name to import:", "Import from S3")
    
    If fileName = "" Then Exit Sub
    
    Dim tempPath As String
    tempPath = Environ("TEMP") & "\" & fileName
    
    If DownloadFromS3(bucketName, fileName, tempPath) Then
        ' Import to Excel
        Workbooks.OpenText fileName:=tempPath, DataType:=xlDelimited, Comma:=True
        MsgBox "Data imported from S3 successfully!", vbInformation
    End If
End Sub

' ================================================================
' HELPER FUNCTIONS
' ================================================================

Private Function RangeToCSV(rng As Range) As String
    Dim row As Range, cell As Range
    Dim csvText As String
    Dim rowText As String
    
    For Each row In rng.Rows
        rowText = ""
        For Each cell In row.Cells
            rowText = rowText & cell.Value & ","
        Next cell
        csvText = csvText & Left(rowText, Len(rowText) - 1) & vbCrLf
    Next row
    
    RangeToCSV = csvText
End Function

Private Function ReadFileContent(filePath As String) As String
    Dim fso As Object
    Set fso = CreateObject("Scripting.FileSystemObject")
    Dim textFile As Object
    Set textFile = fso.OpenTextFile(filePath, 1)
    ReadFileContent = textFile.ReadAll
    textFile.Close
End Function

Private Sub SaveBinaryFile(filePath As String, data As Variant)
    Dim stream As Object
    Set stream = CreateObject("ADODB.Stream")
    stream.Type = 1 ' Binary
    stream.Open
    stream.Write data
    stream.SaveToFile filePath, 2 ' Overwrite
    stream.Close
End Sub

' Execute a shell command and return its exit code and output
Private Function ExecCommand(cmd As String, ByRef output As String) As Long
    On Error GoTo ErrHandler
    Dim shell As Object, execObj As Object
    Set shell = CreateObject("WScript.Shell")
    Set execObj = shell.Exec(cmd)
    Do While execObj.Status = 0
        DoEvents
    Loop
    output = ""
    On Error Resume Next
    output = execObj.StdOut.ReadAll & execObj.StdErr.ReadAll
    On Error GoTo 0
    ExecCommand = execObj.ExitCode
    Exit Function
ErrHandler:
    output = "Exec error: " & Err.Description
    ExecCommand = -1
End Function

' Exec with simple retry/backoff
Private Function ExecCommandWithRetry(cmd As String, ByRef output As String, maxRetries As Long, delaySeconds As Long) As Long
    Dim attempt As Long, exitCode As Long
    For attempt = 1 To maxRetries
        exitCode = ExecCommand(cmd, output)
        If exitCode = 0 Then
            ExecCommandWithRetry = 0
            Exit Function
        End If
        If attempt < maxRetries Then
            Dim t As Single: t = Timer
            Do While Timer < t + delaySeconds
                DoEvents
            Loop
        End If
    Next attempt
    ExecCommandWithRetry = exitCode
End Function

' Write text to file (UTF-8 by default via ADODB.Stream)
Private Sub WriteTextFile(filePath As String, content As String)
    Dim stream As Object
    Set stream = CreateObject("ADODB.Stream")
    stream.Type = 2 ' text
    stream.Charset = "utf-8"
    stream.Open
    stream.WriteText content
    stream.SaveToFile filePath, 2
    stream.Close
End Sub

Private Function GetAWSTimestamp() As String
    ' Get current timestamp in AWS format (ISO 8601)
    Dim utcTime As Date
    utcTime = Now() ' In production, convert to UTC
    GetAWSTimestamp = Format(utcTime, "yyyymmdd\THHnnss\Z")
End Function

' -------------------------
' Windows Credential Manager helpers (use PowerShell CredentialManager module)
' -------------------------
Private Sub SaveCredentialsToWindowsCredentialManager(profile As String, accessKey As String, secretKey As String)
    Dim cmd As String, out As String, exitCode As Long
    Dim escAccess As String, escSecret As String
    escAccess = Replace(accessKey, """", "'""" )
    escSecret = Replace(secretKey, """", "'""" )
    cmd = "powershell -NoProfile -Command " & _
          Chr(34) & "Import-Module -Name CredentialManager -ErrorAction SilentlyContinue; if (-not (Get-Module -ListAvailable -Name CredentialManager)) { Install-Module -Name CredentialManager -Force -Scope CurrentUser -Repository PSGallery -AcceptLicense -ErrorAction SilentlyContinue } ; " & _
          "New-StoredCredential -Target 'ExcelAWS_" & profile & "_AccessKey' -UserName 'access' -Password '" & accessKey & "' -Persist LocalMachine ; " & _
          "New-StoredCredential -Target 'ExcelAWS_" & profile & "_SecretKey' -UserName 'secret' -Password '" & secretKey & "' -Persist LocalMachine" & Chr(34)
    exitCode = ExecCommandWithRetry(cmd, out, 3, 1)
End Sub

Private Function LoadCredentialsFromWindowsCredentialManager(profile As String, ByRef accessKey As String, ByRef secretKey As String) As Boolean
    Dim cmd As String, out As String, exitCode As Long
    cmd = "powershell -NoProfile -Command " & _
          Chr(34) & "Import-Module -Name CredentialManager -ErrorAction SilentlyContinue; " & _
          "(Get-StoredCredential -Target 'ExcelAWS_" & profile & "_AccessKey').Password; Write-Output '::SEP::'; (Get-StoredCredential -Target 'ExcelAWS_" & profile & "_SecretKey').Password" & Chr(34)
    exitCode = ExecCommandWithRetry(cmd, out, 3, 1)
    If exitCode = 0 Then
        Dim parts() As String
        parts = Split(out, "::SEP::")
        If UBound(parts) >= 1 Then
            accessKey = Trim(parts(0))
            secretKey = Trim(parts(1))
            LoadCredentialsFromWindowsCredentialManager = True
            Exit Function
        End If
    End If
    LoadCredentialsFromWindowsCredentialManager = False
End Function

' ================================================================
' AWS SIGNATURE V4 (Simplified - Use AWS SDK in production)
' ================================================================

Private Function CreateAWSSignature(method As String, bucket As String, key As String, payload As String) As String
    ' Simplified AWS Signature V4
    ' In production, use proper AWS SDK or library
    Dim timestamp As String
    timestamp = GetAWSTimestamp()
    
    Dim credential As String
    credential = AWSAccessKey & "/" & Format(Now(), "yyyymmdd") & "/" & AWS_REGION & "/s3/aws4_request"
    
    CreateAWSSignature = "AWS4-HMAC-SHA256 Credential=" & credential & ", SignedHeaders=host;x-amz-date, Signature=placeholder"
End Function

Private Function CreateAWSLambdaSignature(functionName As String, payload As String) As String
    ' Simplified Lambda signature
    CreateAWSLambdaSignature = CreateAWSSignature("POST", "lambda", functionName, payload)
End Function

Private Function CreateDynamoDBSignature(operation As String, payload As String) As String
    ' Simplified DynamoDB signature
    CreateDynamoDBSignature = CreateAWSSignature("POST", "dynamodb", operation, payload)
End Function

' ================================================================
' DEMO & TEST FUNCTIONS
' ================================================================

Public Sub TestAWSConnection()
    Dim out As String, cmd As String, exitCode As Long
    LoadCredentialsFromSheet
    cmd = "aws sts get-caller-identity --region " & AWS_REGION & IIf(AWSProfile <> "", " --profile " & AWSProfile, "")
    exitCode = ExecCommandWithRetry(cmd, out, 2, 1)
    If exitCode = 0 Then
        MsgBox "AWS CLI reachable. Identity: " & vbCrLf & out, vbInformation
    Else
        MsgBox "AWS CLI test failed: " & out, vbExclamation
    End If
End Sub

Public Sub ShowAWSMenu()
    ' Create custom ribbon menu (requires XML customization)
    MsgBox "AWS Integration Module Loaded!" & vbCrLf & vbCrLf & _
           "Available Functions:" & vbCrLf & _
           "- ConfigureAWSCredentials()" & vbCrLf & _
           "- ExportRangeToS3()" & vbCrLf & _
           "- ImportFromS3ToExcel()" & vbCrLf & _
           "- InvokeLambdaFunction()" & vbCrLf & _
           "- ListS3Objects()" & vbCrLf & _
           "- PutItemDynamoDB()", vbInformation
End Sub