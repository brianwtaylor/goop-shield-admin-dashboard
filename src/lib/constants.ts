export const MITRE_TECHNIQUES = [
  { id: 'T1059', name: 'Command & Scripting Interpreter', covered: true },
  { id: 'T1190', name: 'Exploit Public-Facing Application', covered: true },
  { id: 'T1566', name: 'Phishing', covered: true },
  { id: 'T1078', name: 'Valid Accounts', covered: true },
  { id: 'T1110', name: 'Brute Force', covered: true },
  { id: 'T1557', name: 'Adversary-in-the-Middle', covered: false },
  { id: 'T1071', name: 'Application Layer Protocol', covered: false },
  { id: 'T1486', name: 'Data Encrypted for Impact', covered: false },
  { id: 'T1027', name: 'Obfuscated Files or Information', covered: true },
  { id: 'T1055', name: 'Process Injection', covered: true },
  { id: 'T1547', name: 'Boot or Logon Autostart', covered: false },
  { id: 'T1068', name: 'Exploitation for Privilege Escalation', covered: true },
  { id: 'T1562', name: 'Impair Defenses', covered: true },
  { id: 'T1070', name: 'Indicator Removal', covered: false },
  { id: 'T1552', name: 'Unsecured Credentials', covered: true },
  { id: 'T1048', name: 'Exfiltration Over Alternative Protocol', covered: false },
] as const;

export const NAV_ITEMS = [
  { path: '/', label: 'Command Center', icon: 'LayoutDashboard' },
  { path: '/defense-matrix', label: 'Defense Matrix', icon: 'Shield' },
  { path: '/threat-intel', label: 'Threat Intelligence', icon: 'Globe' },
  { path: '/audit-log', label: 'Audit Log', icon: 'FileText' },
  { path: '/red-team', label: 'Red Team', icon: 'Target' },
  { path: '/agent-protection', label: 'Agent Protection', icon: 'Bot' },
  { path: '/brorl', label: 'BroRL Explorer', icon: 'TrendingUp' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
] as const;
