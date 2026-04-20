[Setup]
AppId={{9AE14130-FA4E-4468-867F-5C7165B0F6E2}
AppName=塔科夫地图定位工具
AppVersion=1.0.0
AppPublisher=TarkovMapLocator
DefaultDirName={localappdata}\TarkovMapLocator
DefaultGroupName=塔科夫地图定位工具
OutputDir=..\release
OutputBaseFilename=TarkovMapLocator
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
DisableProgramGroupPage=no
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "chinesesimp"; MessagesFile: "ChineseSimplified.isl"

[Tasks]
Name: "desktopicon"; Description: "创建桌面快捷方式"; GroupDescription: "附加任务："; Flags: unchecked

[Files]
Source: "..\release_payload\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs ignoreversion

[Icons]
Name: "{group}\启动 塔科夫地图定位工具"; Filename: "{app}\start_tool.bat"
Name: "{group}\卸载 塔科夫地图定位工具"; Filename: "{uninstallexe}"
Name: "{autodesktop}\TarkovMapLocator"; Filename: "{app}\start_tool.bat"; Tasks: desktopicon

[Run]
Filename: "{app}\start_tool.bat"; Description: "立即启动 塔科夫地图定位工具"; Flags: nowait postinstall skipifsilent
