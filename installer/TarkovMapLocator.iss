#define MyAppName "TarkovMapLocator"
#define MyAppVersion "1.2.0"
#define MyAppPublisher "Re5pawnn"
#define MyAppURL "https://github.com/Re5pawnn/Tarkov_webmap"
#define MyAppLauncher "start_tool.bat"

[Setup]
AppId={{A3E3D2D1-77EF-4D33-8A31-B8E77EA1A4F2}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DisableDirPage=no
UsePreviousAppDir=no
DisableProgramGroupPage=yes
OutputDir={#SourcePath}\dist
OutputBaseFilename=TarkovMapLocator
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
UninstallDisplayIcon={app}\{#MyAppLauncher}

[Languages]
Name: "chinesesimplified"; MessagesFile: "{#SourcePath}\ChineseSimplified.isl"

[Tasks]
Name: "desktopicon"; Description: "创建桌面快捷方式"; GroupDescription: "附加任务:"; Flags: unchecked

[Files]
Source: "{#SourcePath}\..\app.js"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}\..\index.html"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}\..\styles.css"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}\..\launcher.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}\..\start_tool.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}\..\maps_detail.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}\..\maps_list.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}\..\README.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}\..\使用方法.txt"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}\..\runtime\python\*"; DestDir: "{app}\runtime\python"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppLauncher}"; WorkingDir: "{app}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppLauncher}"; WorkingDir: "{app}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppLauncher}"; Description: "立即启动工具"; Flags: nowait postinstall skipifsilent
