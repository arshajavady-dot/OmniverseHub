"@echo off
setlocal enabledelayedexpansion

:: Skinlr installer – copies a PNG skin into Minecraft resource pack folder
:: Usage: install_skin.bat "C:\path\to\skin.png"

if "%~1"=="" (
    echo No skin file supplied. Provide the path to your exported PNG.
    echo Usage: install_skin.bat "C:\path\to\skin.png"
    pause
    exit /b 1
)

set "SKIN_FILE=%~1"
if not exist "%SKIN_FILE%" (
    echo Skin file not found: %SKIN_FILE%
    pause
    exit /b 1
)

:: Determine Minecraft resourcepacks folder (Java Edition)
set "APPDATA_PATH=%APPDATA%"
set "MINECRAFT_RP=%APPDATA_PATH%\.minecraft\resourcepacks\Skinlr"

if not exist "%MINECRAFT_RP%" (
    echo Creating resource pack folder at "%MINECRAFT_RP%"
    mkdir "%MINECRAFT_RP%"
)

:: Copy the skin into the pack (named skin.png)
copy /Y "%SKIN_FILE%" "%MINECRAFT_RP%\skin.png"

if errorlevel 1 (
    echo Failed to copy the skin file.
    pause
    exit /b 1
) else (
    echo Skin installed successfully to "%MINECRAFT_RP%\skin.png"
)
:: Open the resource pack folder for user verification
explorer "%MINECRAFT_RP%"
npause
