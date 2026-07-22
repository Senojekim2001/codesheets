# Windows Forensics Guide — EVO-X1 Mini PC
## Keep this machine AIR-GAPPED at all times. Do NOT connect to any network.

---

## What You Need
- USB drive (freshly formatted, FAT32 or NTFS)
- This guide printed or on your phone
- Time and patience — work methodically

---

## Step 1: Download Tools BEFORE You Go (on your Mac)

Download these to your USB drive ahead of time:

1. **Autoruns** — https://learn.microsoft.com/en-us/sysinternals/downloads/autoruns
2. **Process Explorer** — https://learn.microsoft.com/en-us/sysinternals/downloads/process-explorer
3. **TCPView** — https://learn.microsoft.com/en-us/sysinternals/downloads/tcpview
4. **Malwarebytes Free** — https://www.malwarebytes.com (installer, run offline)
5. **FTK Imager Lite** — https://www.exterro.com/ftk-imager (free, for capturing RAM/disk)

All Sysinternals tools are from Microsoft — safe and trusted.

---

## Step 2: Power On the Machine (Do NOT connect to internet)

- Plug in your USB drive before powering on
- Boot normally into Windows
- Do NOT connect to Wi-Fi when prompted
- Do NOT let Windows Update run

---

## Step 3: Check Event Viewer (Login History)

1. Press **Windows + R**, type `eventvwr.msc`, press Enter
2. Navigate to: **Windows Logs → Security**
3. Filter by these Event IDs (right-click Security → Filter Current Log):
   - **4624** — Successful logins (look for Type 10 = Remote Interactive)
   - **4625** — Failed logins
   - **4688** — Process creation (what programs were run)
   - **4648** — Login with explicit credentials
4. **Export the entire Security log:**
   - Right-click Security → Save All Events As
   - Save to your USB drive as `security_log.evtx`
5. Also export **System** and **Application** logs the same way

### What to look for:
- Logins at unusual times (middle of the night)
- Logins with Logon Type 10 (RemoteInteractive) or Type 3 (Network)
- Unknown usernames or accounts
- IP addresses in the login records

---

## Step 4: Run Autoruns

1. Open Autoruns from your USB drive (run as Administrator)
2. Wait for it to fully load — this takes a minute
3. Look for anything highlighted in **yellow** (file not found) or **red** (suspicious)
4. Pay special attention to these tabs:
   - **Logon** — programs that run at startup
   - **Scheduled Tasks** — automated tasks
   - **Services** — background services
   - **Network Providers** — network interception tools
5. **Save the results:** File → Save → save as `autoruns_results.arn` to USB drive
6. Also File → Save → save as CSV for readability

### Red flags:
- Entries with no publisher/signature
- Entries pointing to temp folders or AppData
- Unknown services running as SYSTEM
- VPN or proxy software you didn't install
- Remote access tools (TeamViewer, AnyDesk, RustDesk, etc.)

---

## Step 5: Check Running Processes (Process Explorer)

1. Run Process Explorer from USB as Administrator
2. Look for processes with no verified signature (View → Show Lower Pane)
3. Right-click any suspicious process → Search Online
4. Look for:
   - Processes with no description or publisher
   - Processes running from temp or AppData folders
   - High network activity processes
5. File → Save As → save to USB as `processes.txt`

---

## Step 6: Check Scheduled Tasks

1. Press **Windows + R**, type `taskschd.msc`, press Enter
2. Click **Task Scheduler Library**
3. Look through all tasks — especially any you don't recognize
4. Check the **Triggers** and **Actions** columns
5. Screenshot or write down anything suspicious

---

## Step 7: Check Browser Data (Firefox & Opera)

### Firefox profile location:
`C:\Users\[YourUsername]\AppData\Roaming\Mozilla\Firefox\Profiles\`

### Opera profile location:
`C:\Users\[YourUsername]\AppData\Roaming\Opera Software\Opera Stable\`

Copy these entire folders to your USB drive:
- They contain cookies, session data, browsing history, saved passwords
- This can show what accounts were accessed and when

---

## Step 8: Check Network Configuration

1. Open Command Prompt as Administrator (Windows + R → cmd → Ctrl+Shift+Enter)
2. Run these commands and copy output to a text file on USB:

```
ipconfig /all > C:\usb_output\network_config.txt
netstat -ano > C:\usb_output\active_connections.txt
netsh wlan show profiles > C:\usb_output\wifi_profiles.txt
netsh wlan show profile name="*" key=clear >> C:\usb_output\wifi_profiles.txt
reg query HKLM\SYSTEM\CurrentControlSet\Services > C:\usb_output\services.txt
```

3. Check `active_connections.txt` for any ESTABLISHED connections (should be none if air-gapped)

---

## Step 9: Check Prefetch Files

Prefetch files show every program that has ever been run on the machine.

Location: `C:\Windows\Prefetch\`

1. Copy the entire Prefetch folder to your USB drive
2. Each .pf file is named after the program that ran
3. Look for:
   - Remote access tools (TeamViewer, AnyDesk, RustDesk, ngrok, etc.)
   - VPN clients you didn't install
   - Unusual executables with random names
   - Proxy software

---

## Step 10: Run Malwarebytes Scan

1. Install Malwarebytes from the installer on your USB
2. Do NOT let it connect to internet to update (or let it update once then disconnect)
3. Run a full scan
4. Save the scan report to USB

---

## Step 11: Capture RAM (Optional but Valuable)

If you want to capture what was running in memory:

1. Run **FTK Imager Lite** from USB as Administrator
2. File → Capture Memory
3. Save memory dump to USB (needs ~8-16GB free space)
4. This captures active processes, network connections, and encryption keys in memory

---

## Priority Order If Short on Time

1. Export Event Viewer Security Log ← most important
2. Run Autoruns and save results
3. Copy browser profiles
4. Check Prefetch folder
5. Run Malwarebytes

---

## What to Do With the Evidence

- Keep everything on the USB drive
- Do NOT upload anything to cloud services
- If pursuing legal action, consult a digital forensics professional before altering anything
- For Amazon security disclosure, the Event Viewer logs and Autoruns results are most relevant

---

## Key Things You're Looking For

| What | Where | Why |
|------|-------|-----|
| Remote logins | Event ID 4624 Type 10 | Someone logged in remotely |
| Attacker's IP | Event ID 4624 details | May show their real IP |
| Remote access tools | Autoruns / Prefetch | How they maintained access |
| Proxy software | Autoruns / Services | If your PC was used as a proxy |
| Session token theft | Browser profiles | How they accessed your accounts |
| Persistence mechanisms | Scheduled Tasks / Services | How they survived reboots |

---

*Created: March 24, 2026*
*Keep this document offline. Do not share.*
