#define MyAppName "塔科夫网页地图定位工具"
#define MyAppVersion "1.1.0"
#define MyAppPublisher "本地构建"
#define MyLaunchBat "start_tool.bat"
#define MyPayloadDir "..\\release_payload"

[Setup]
AppId={{9AE14130-FA4E-4468-867F-5C7165B0F6E2}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={localappdata}\TarkovMapLocator
UsePreviousAppDir=yes
DisableDirPage=no
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
OutputDir=..\release
OutputBaseFilename=TarkovMapLocator
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "chinesesimp"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "创建桌面快捷方式"; GroupDescription: "附加任务:"

[Files]
Source: "{#MyPayloadDir}\\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyLaunchBat}"; WorkingDir: "{app}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyLaunchBat}"; WorkingDir: "{app}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyLaunchBat}"; WorkingDir: "{app}"; Description: "启动 {#MyAppName}"; Flags: nowait postinstall skipifsilent
