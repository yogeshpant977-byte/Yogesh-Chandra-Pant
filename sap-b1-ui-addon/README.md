# Him Electronics — SAP B1 UI Add-on

A .NET UI API add-on skeleton for the SAP Business One desktop client,
scoped to Him Electronics (company DB `ZZZ_HPL_LIVE_29082026`).

## Prerequisites

- SAP Business One client installed, including the **SDK** component
  (Add/Remove Programs → SAP Business One → Modify → SDK), which provides
  `Interop.SAPbouiCOM.dll` and `Interop.SAPbobsCOM.dll`.
- .NET Framework 4.8 SDK (SAP B1 UI API add-ons target classic .NET
  Framework, not .NET / .NET Core).
- Visual Studio 2019+ or `msbuild` on Windows (the UI API is COM-based and
  Windows-only; it cannot be built or run on Linux/macOS).

## Setup

1. Copy `Interop.SAPbouiCOM.dll` and `Interop.SAPbobsCOM.dll` from
   `C:\Program Files (x86)\SAP\SAP Business One\SDK\Interop` into
   `HimElectronics.SapB1Addon\lib\`.
2. Build:
   ```
   msbuild HimElectronics.SapB1Addon\HimElectronics.SapB1Addon.csproj /p:Configuration=Release /p:Platform=x86
   ```
3. In SAP B1: **Administration → Add-Ons → Add-On Administration → Import**,
   pointing at `AddOnInstall.xml` and the built `HimElectronics.SapB1Addon.exe`.
4. Assign the add-on to the relevant users/companies (`ZZZ_HPL_LIVE_29082026`)
   and start it from **Administration → Add-Ons**.

## What's here

- `Program.cs` — connects to the running B1 client via `SboGuiApi`, opens a
  DI API `Company` connection, and wires up app/menu events.
- `MenuHandler.cs` — adds a "Him Electronics" menu with a sample screen;
  extend this with the real screens/workflows needed (custom forms,
  reports, bulk actions against Service Layer/DI API).
- `AddOnInstall.xml` — the add-on manifest imported into SAP B1.

## Notes

- This is a build skeleton, not a finished add-on: fill in `MenuHandler`
  and add UI XML/forms for the actual Him Electronics screens once
  requirements for those screens are defined.
- For anything that doesn't need to live inside the B1 client window
  (batch jobs, AI-driven queries/postings, reporting), prefer the
  `sap-b1-mcp-connector` in this repo instead of extending this add-on.
