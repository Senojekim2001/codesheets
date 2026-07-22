#!/usr/bin/env python3
"""
Find the actual entries with missing tiers.
"""

import os
import re
from pathlib import Path

def find_missing_tiers_detailed(vault_path):
    """Find entries missing specific tiers with detailed analysis."""
    vault_path = Path(vault_path)
    missing_tiers = {
        'missing_intro': [],
        'missing_junior': [],
        'missing_senior': []
    }
    
    for entry_path in vault_path.rglob("*.md"):
        # Skip index files and special files
        if (entry_path.name == "_Index.md" or 
            "MOC/" in str(entry_path) or
            entry_path.name in ["README.md", "_Index.md", "RAG.md"]):
            continue
        
        try:
            with open(entry_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Use the correct patterns
            has_intro = bool(re.search(r'## Example — Intro \(Entry-Level\)', content))
            has_junior = bool(re.search(r'## Example — Junior \(Intermediate\)', content))
            has_senior = bool(re.search(r'## Example — Senior \(Production\)', content))
            
            # Also check if they have code blocks
            intro_blocks = re.findall(r'## Example — Intro \(Entry-Level\).*?```python\n(.*?)\n```', content, re.DOTALL)
            junior_blocks = re.findall(r'## Example — Junior \(Intermediate\).*?```python\n(.*?)\n```', content, re.DOTALL)
            senior_blocks = re.findall(r'## Example — Senior \(Production\).*?```python\n(.*?)\n```', content, re.DOTALL)
            
            has_intro_code = bool(intro_blocks)
            has_junior_code = bool(junior_blocks)
            has_senior_code = bool(senior_blocks)
            
            if not has_intro_code:
                missing_tiers['missing_intro'].append(entry_path)
            if not has_junior_code:
                missing_tiers['missing_junior'].append(entry_path)
            if not has_senior_code:
                missing_tiers['missing_senior'].append(entry_path)
                
        except Exception as e:
            print(f"Error reading {entry_path}: {e}")
    
    return missing_tiers

if __name__ == "__main__":
    vault_path = "/Users/senojekim/Documents/projects/codesheets/python-vault"
    missing = find_missing_tiers_detailed(vault_path)
    
    print("Entries with missing tiers:")
    total_missing = 0
    for tier, entries in missing.items():
        print(f"\n{tier}: {len(entries)} entries")
        total_missing += len(entries)
        for entry in entries:
            print(f"  - {entry.relative_to(vault_path)}")
    
    print(f"\nTotal missing tier instances: {total_missing}")
    print(f"Expected from audit: 1 + 4 + 2 = 7")
