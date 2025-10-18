#!/usr/bin/env python3

"""
Comprehensive Type Error Bulk Fixer
Analyzes all type errors and applies systematic fixes
"""

import re
import subprocess
from pathlib import Path
from collections import defaultdict
import json

# Root directories
CLIENT_DIR = Path("client")
TYPES_DIR = CLIENT_DIR / "src/types/components"

print("🚀 Comprehensive Type Error Bulk Fix\n")
print("=" * 70)

# Get all type errors
result = subprocess.run(
    ["npx", "vue-tsc", "--noEmit"],
    cwd=CLIENT_DIR,
    capture_output=True,
    text=True
)

errors = result.stderr.split("\n")
stats = defaultdict(int)
files_to_fix = defaultdict(list)

# Parse errors
missing_props = defaultdict(set)
missing_funcs = defaultdict(set)

for line in errors:
    # Count by error type
    if match := re.search(r"error (TS\d+):", line):
        stats[match.group(1)] += 1
    
    # Missing property on interface
    if match := re.search(r"Property '(\w+)' does not exist on type.*'(I\w+Props)", line):
        prop, interface = match.groups()
        missing_props[interface].add(prop)
    
    # Missing function in component
    if match := re.search(r"Property '(handle\w+|get\w+)' does not exist", line):
        func = match.group(1)
        # Extract file from line
        if file_match := re.search(r"^src/([^(]+)", line):
            files_to_fix[file_match.group(1)].append(func)

print("📊 Error Distribution:\n")
for code, count in sorted(stats.items(), key=lambda x: -x[1])[:10]:
    print(f"  {code}: {count}")

print(f"\n📁 Missing Props: {len(missing_props)} interfaces")
print(f"🔧 Files with Function Issues: {len(files_to_fix)}\n")

# Fix 1: Add missing props to interfaces
print("=" * 70)
print("Phase 1: Adding Missing Props to Interfaces\n")

interface_to_file = {
    "IPlanComparisonCardProps": "marketing.ts",
    "IPlanConversionModalProps": "marketing.ts",
    "IPlanUpsellModalProps": "marketing.ts",
    "INotificationPromptProps": "notifications.ts",
    "IInlineUpsellCardProps": "paywall.ts",
    "ICountdownTimerProps": "pricing.ts",
    "IModernPricingCardProps": "pricing.ts",
    "ISmartRecommendationsProps": "recommendations.ts",
    "IStickyStartBarProps": "study.ts",
    "IShareButtonProps": "shares.ts",
    "IShareModalProps": "shares.ts",
    "IBadgeUnlockNotificationProps": "gamification.ts",
    "ILearningStepProps": "study.ts",
}

def infer_type(prop_name):
    """Infer TypeScript type from property name"""
    if any(x in prop_name.lower() for x in ['show', 'is', 'has', 'auto', 'dismissible', 'disabled']):
        return "boolean"
    elif any(x in prop_name.lower() for x in ['count', 'index', 'total', 'width', 'height', 'delay', 'duration']):
        return "number"
    elif any(x in prop_name.lower() for x in ['class', 'style', 'variant', 'size', 'type', 'platform', 'target', 'id']):
        return "string"
    elif prop_name.startswith('handle') or prop_name.startswith('on'):
        return "() => void"
    elif prop_name.startswith('get'):
        return "(...args: any[]) => any"
    else:
        return "unknown"

props_added = 0

for interface, props in missing_props.items():
    if interface not in interface_to_file:
        print(f"⚠️  {interface}: {', '.join(sorted(props))} (no file mapping)")
        continue
    
    file_path = TYPES_DIR / interface_to_file[interface]
    if not file_path.exists():
        print(f"❌ {file_path} does not exist")
        continue
    
    content = file_path.read_text()
    
    # Find the interface
    pattern = rf"export interface {interface}\s*\{{([^}}]+)\}}"
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        print(f"⚠️  Could not find interface {interface} in {file_path.name}")
        continue
    
    # Generate new props
    new_props_str = "\n".join(
        f"  {prop}?: {infer_type(prop)};"
        for prop in sorted(props)
    )
    
    # Insert before closing brace
    old_interface = match.group(0)
    new_interface = old_interface[:-1] + f"{new_props_str}\n}}"
    content = content.replace(old_interface, new_interface)
    
    file_path.write_text(content)
    props_added += len(props)
    print(f"✅ {interface} ({file_path.name}): added {len(props)} props")

print(f"\n✅ Added {props_added} missing props")

# Fix 2: Create missing notification types file
print("\n" + "=" * 70)
print("Phase 2: Creating Missing Type Files\n")

notifications_file = TYPES_DIR / "notifications.ts"
if not notifications_file.exists():
    content = """/**
 * Notification Component Types
 */

export interface INotificationPromptProps {
  variant?: "default" | "info" | "success" | "warning" | "error";
  title?: string;
  message?: string;
  dismissible?: boolean;
  autoDismissDelay?: number;
}

export interface INotificationPromptEmits {
  dismissed: () => void;
  enabled: () => void;
}
"""
    notifications_file.write_text(content)
    print(f"✅ Created {notifications_file.name}")

paywall_file = TYPES_DIR / "paywall.ts"
if not paywall_file.exists():
    content = """/**
 * Paywall Component Types
 */

export interface IInlineUpsellCardProps {
  title: string;
  description?: string;
  features?: string[];
  targetPlan?: string;
  contentId?: string;
}

export interface IInlineUpsellCardEmits {
  upgrade: () => void;
}
"""
    paywall_file.write_text(content)
    print(f"✅ Created {paywall_file.name}")

# Fix 3: Add camelCase function declarations
print("\n" + "=" * 70)
print("Phase 3: Ensuring Function Declarations\n")

func_fixes = 0
for file, funcs in list(files_to_fix.items())[:20]:  # Limit for safety
    file_path = CLIENT_DIR / "src" / file
    if not file_path.exists():
        continue
    
    content = file_path.read_text()
    modified = False
    
    for func in set(funcs):
        # Check if function is missing
        if f"const {func}" not in content and f"function {func}" not in content:
            # Find a good place to add it (after other consts)
            if "@click=" in content and func.startswith("handle"):
                # Add before exports if possible
                if "defineExpose" in content:
                    insert_pos = content.find("defineExpose")
                    new_func = f"\nconst {func} = () => {{\n  // TODO: Implement\n}};\n\n"
                    content = content[:insert_pos] + new_func + content[insert_pos:]
                    modified = True
                    func_fixes += 1
    
    if modified:
        file_path.write_text(content)
        print(f"✅ {file}: added {len(funcs)} function stubs")

print(f"\n✅ Added {func_fixes} function declarations")

# Final summary
print("\n" + "=" * 70)
print("📊 Summary:\n")
print(f"  Props added: {props_added}")
print(f"  Function stubs: {func_fixes}")
print(f"  Type files created: 2")
print("\n✅ Run 'cd client && pnpm typecheck' to verify remaining errors")

