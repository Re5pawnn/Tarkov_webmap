Option Explicit

Dim shell
Dim fso
Dim appDir
Dim launcher
Dim args
Dim i

Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

If WScript.Arguments.Count >= 2 Then
  If LCase(CStr(WScript.Arguments(0))) = "--show-error" Then
    ShowStartupError CStr(WScript.Arguments(1))
    WScript.Quit 0
  End If
End If

appDir = fso.GetParentFolderName(WScript.ScriptFullName)
launcher = fso.BuildPath(appDir, "start_tool.bat")
args = ""

For i = 0 To WScript.Arguments.Count - 1
  args = args & " " & QuoteArgument(WScript.Arguments(i))
Next

shell.CurrentDirectory = appDir
shell.Environment("PROCESS")("TARKOV_MAP_HIDDEN_LAUNCH") = "1"
shell.Run QuoteArgument(launcher) & args, 0, False

Function QuoteArgument(value)
  QuoteArgument = """" & Replace(CStr(value), """", """""") & """"
End Function

Sub ShowStartupError(rawLogPath)
  Dim message
  Dim logPath
  logPath = shell.ExpandEnvironmentStrings(rawLogPath)
  message = "TarkovMapLocator startup failed."
  If fso.FileExists(logPath) Then
    message = message & vbCrLf & vbCrLf & TailText(logPath, 1800)
  End If
  message = message & vbCrLf & vbCrLf & "Log: " & logPath
  MsgBox message, vbCritical, "TarkovMapLocator"
End Sub

Function TailText(path, maxChars)
  Dim file
  Dim text
  On Error Resume Next
  Set file = fso.OpenTextFile(path, 1, False)
  If Err.Number <> 0 Then
    TailText = ""
    Err.Clear
    Exit Function
  End If
  text = file.ReadAll
  file.Close
  If Len(text) > maxChars Then
    TailText = Right(text, maxChars)
  Else
    TailText = text
  End If
  On Error GoTo 0
End Function
