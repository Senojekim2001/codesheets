#!/usr/bin/env python3
"""
Find entries with missing tiers in the Python vault.
"""

import os
import re
from pathlib import Path

def find_missing_tiers(vault_path):
    """Find entries missing specific tiers."""
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
            
            has_intro = bool(re.search(r'## Example — Intro \(Entry-Level\)', content))
            has_junior = bool(re.search(r'## Example — Junior \(Intermediate\)', content))
            has_senior = bool(re.search(r'## Example — Senior \(Production\)', content))
            
            if not has_intro:
                missing_tiers['missing_intro'].append(entry_path)
            if not has_junior:
                missing_tiers['missing_junior'].append(entry_path)
            if not has_senior:
                missing_tiers['missing_senior'].append(entry_path)
                
        except Exception as e:
            print(f"Error reading {entry_path}: {e}")
    
    return missing_tiers

if __name__ == "__main__":
    vault_path = "/Users/senojekim/Documents/projects/codesheets/python-vault"
    missing = find_missing_tiers(vault_path)
    
    print("Entries with missing tiers:")
    for tier, entries in missing.items():
        print(f"\n{tier}: {len(entries)} entries")
        for entry in entries:
            print(f"  - {entry.relative_to(vault_path)}")
