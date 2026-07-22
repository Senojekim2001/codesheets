#!/usr/bin/env python3
"""
Fixed audit script for Python vault entries.
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import sys

class VaultAuditor:
    def __init__(self, vault_path: str):
        self.vault_path = Path(vault_path)
        self.errors = []
        self.warnings = []
        self.stats = {
            'total_entries': 0,
            'entries_with_tiers': 0,
            'missing_intro': 0,
            'missing_junior': 0,
            'missing_senior': 0,
            'frontmatter_errors': 0,
            'code_block_errors': 0,
            'inconsistent_tiers': 0
        }
    
    def find_all_entries(self) -> List[Path]:
        """Find all entry markdown files in the vault."""
        entries = []
        for entry_path in self.vault_path.rglob("*.md"):
            # Skip index files and files in MOC/
            if (entry_path.name == "_Index.md" or 
                "MOC/" in str(entry_path) or
                entry_path.name in ["README.md", "_Index.md", "RAG.md"]):
                continue
            entries.append(entry_path)
        return sorted(entries)
    
    def parse_frontmatter(self, content: str) -> Tuple[Optional[Dict], str]:
        """Parse YAML frontmatter from markdown content."""
        if content.startswith('---\n'):
            try:
                end_idx = content.find('\n---\n', 4)
                if end_idx == -1:
                    return None, content
                frontmatter_text = content[4:end_idx]
                body = content[end_idx + 5:]
                # Simple YAML parsing without yaml module
                frontmatter = {}
                for line in frontmatter_text.split('\n'):
                    line = line.strip()
                    if ':' in line and not line.startswith('#'):
                        key, value = line.split(':', 1)
                        key = key.strip()
                        value = value.strip()
                        # Handle basic types
                        if value.lower() in ['true', 'false']:
                            frontmatter[key] = value.lower() == 'true'
                        elif value.isdigit():
                            frontmatter[key] = int(value)
                        elif value.startswith('"') and value.endswith('"'):
                            frontmatter[key] = value[1:-1]
                        elif value.startswith('[') and value.endswith(']'):
                            # Simple list parsing
                            items = value[1:-1].split(',')
                            frontmatter[key] = [item.strip().strip('"') for item in items if item.strip()]
                        else:
                            frontmatter[key] = value
                return frontmatter, body
            except Exception as e:
                return None, content
        return {}, content
    
    def extract_code_blocks(self, content: str, section_name: str) -> List[str]:
        """Extract code blocks from a specific section."""
        # Use the correct em dash character
        sections = {
            'intro': r'## Example — Intro \(Entry-Level\)(.*?)(?=##|$)',
            'junior': r'## Example — Junior \(Intermediate\)(.*?)(?=##|$)',
            'senior': r'## Example — Senior \(Production\)(.*?)(?=##|$)'
        }
        
        if section_name not in sections:
            return []
        
        pattern = sections[section_name]
        match = re.search(pattern, content, re.DOTALL)
        if not match:
            return []
        
        section_content = match.group(1)
        # Extract python code blocks
        code_blocks = re.findall(r'```python\n(.*?)\n```', section_content, re.DOTALL)
        return code_blocks
    
    def analyze_code_intent(self, code: str) -> Dict[str, any]:
        """Analyze code to extract intent and key operations."""
        # Remove comments and whitespace for analysis
        clean_code = re.sub(r'#.*$', '', code, flags=re.MULTILINE)
        clean_code = re.sub(r'\s+', ' ', clean_code).strip()
        
        # Extract imports
        imports = re.findall(r'import\s+(\w+)', clean_code)
        imports.extend(re.findall(r'from\s+(\w+)', clean_code))
        
        # Extract function calls and assignments
        function_calls = re.findall(r'(\w+)\(', clean_code)
        assignments = re.findall(r'(\w+)\s*=', clean_code)
        
        # Look for key patterns
        has_dataframe = any('df' in call or 'DataFrame' in call for call in function_calls)
        has_array = any('np.' in call or 'array' in call for call in function_calls)
        has_print = 'print' in function_calls
        has_loop = any(keyword in clean_code for keyword in ['for ', 'while '])
        
        return {
            'imports': set(imports),
            'function_calls': set(function_calls),
            'assignments': set(assignments),
            'has_dataframe': has_dataframe,
            'has_array': has_array,
            'has_print': has_print,
            'has_loop': has_loop,
            'line_count': len([line for line in code.split('\n') if line.strip()])
        }
    
    def check_tier_consistency(self, entry_path: Path, intro_code: List[str], 
                              junior_code: List[str], senior_code: List[str]) -> List[str]:
        """Check if all tiers are solving the same problem."""
        issues = []
        
        if not intro_code or not junior_code or not senior_code:
            return issues
        
        # Get the first (main) code block from each tier
        intro_intent = self.analyze_code_intent(intro_code[0])
        junior_intent = self.analyze_code_intent(junior_code[0])
        senior_intent = self.analyze_code_intent(senior_code[0])
        
        # Check for consistency in core concepts
        # 1. Similar imports (allowing for growth in complexity)
        if intro_intent['imports'] and junior_intent['imports']:
            # Junior should have at least the same imports as intro
            missing_imports = intro_intent['imports'] - junior_intent['imports']
            if missing_imports:
                issues.append(f"Junior tier missing imports from intro: {missing_imports}")
        
        # 2. DataFrame/array consistency
        if intro_intent['has_dataframe'] != junior_intent['has_dataframe']:
            issues.append("DataFrame usage inconsistent between intro and junior")
        if junior_intent['has_dataframe'] != senior_intent['has_dataframe']:
            issues.append("DataFrame usage inconsistent between junior and senior")
        
        # 3. Core function calls should be related
        intro_functions = {f for f in intro_intent['function_calls'] if not f.startswith('_')}
        junior_functions = {f for f in junior_intent['function_calls'] if not f.startswith('_')}
        senior_functions = {f for f in senior_intent['function_calls'] if not f.startswith('_')}
        
        # Check if there's overlap in core functionality
        if intro_functions and junior_functions:
            common_intro_junior = intro_functions & junior_functions
            if not common_intro_junior:
                # Allow for some cases where junior is completely different approach
                if len(intro_functions) > 1 or len(junior_functions) > 1:
                    issues.append(f"No common function calls between intro and junior: intro={intro_functions}, junior={junior_functions}")
        
        # 4. Line count should generally increase with complexity (with some tolerance)
        if (intro_intent['line_count'] > junior_intent['line_count'] + 2 and 
            intro_intent['line_count'] > 5):
            issues.append("Junior tier appears simpler than intro tier")
        
        return issues
    
    def audit_entry(self, entry_path: Path) -> List[str]:
        """Audit a single entry file."""
        issues = []
        
        try:
            with open(entry_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            return [f"Failed to read file: {e}"]
        
        self.stats['total_entries'] += 1
        
        # Parse frontmatter
        frontmatter, body = self.parse_frontmatter(content)
        if frontmatter is None:
            self.stats['frontmatter_errors'] += 1
            issues.append("Invalid YAML frontmatter")
            return issues
        
        # Check required frontmatter fields
        required_fields = ['type', 'domain', 'file', 'section', 'id', 'title']
        for field in required_fields:
            if field not in frontmatter:
                issues.append(f"Missing frontmatter field: {field}")
        
        # Extract code blocks from each tier
        intro_code = self.extract_code_blocks(body, 'intro')
        junior_code = self.extract_code_blocks(body, 'junior')
        senior_code = self.extract_code_blocks(body, 'senior')
        
        # Check for missing tiers
        has_intro = bool(intro_code)
        has_junior = bool(junior_code)
        has_senior = bool(senior_code)
        
        if has_intro and has_junior and has_senior:
            self.stats['entries_with_tiers'] += 1
            # Check tier consistency
            consistency_issues = self.check_tier_consistency(entry_path, intro_code, junior_code, senior_code)
            if consistency_issues:
                self.stats['inconsistent_tiers'] += 1
                issues.extend([f"Tier consistency: {issue}" for issue in consistency_issues])
        else:
            if not has_intro:
                self.stats['missing_intro'] += 1
                issues.append("Missing intro tier")
            if not has_junior:
                self.stats['missing_junior'] += 1
                issues.append("Missing junior tier")
            if not has_senior:
                self.stats['missing_senior'] += 1
                issues.append("Missing senior tier")
        
        # Check for proper code block formatting
        all_code_blocks = re.findall(r'```python\n(.*?)\n```', body, re.DOTALL)
        for i, code_block in enumerate(all_code_blocks):
            if not code_block.strip():
                issues.append(f"Empty code block #{i+1}")
                self.stats['code_block_errors'] += 1
        
        # Check for required sections
        required_sections = ['Overview', 'Signature', 'Decision Rule', 'Anti-Pattern']
        for section in required_sections:
            if f"## {section}" not in body:
                issues.append(f"Missing required section: {section}")
        
        return issues
    
    def audit_all(self) -> Dict[str, any]:
        """Audit all entries in the vault."""
        entries = self.find_all_entries()
        
        print(f"Found {len(entries)} entries to audit...")
        
        for entry_path in entries:
            issues = self.audit_entry(entry_path)
            if issues:
                self.errors.append({
                    'file': str(entry_path.relative_to(self.vault_path)),
                    'issues': issues
                })
        
        return {
            'stats': self.stats,
            'errors': self.errors,
            'warnings': self.warnings
        }
    
    def print_report(self, results: Dict[str, any]):
        """Print a formatted audit report."""
        print("\n" + "="*80)
        print("PYTHON VAULT AUDIT REPORT (FIXED)")
        print("="*80)
        
        stats = results['stats']
        errors = results['errors']
        
        print(f"\nSUMMARY:")
        print(f"  Total entries: {stats['total_entries']}")
        print(f"  Entries with all tiers: {stats['entries_with_tiers']}")
        print(f"  Missing intro tier: {stats['missing_intro']}")
        print(f"  Missing junior tier: {stats['missing_junior']}")
        print(f"  Missing senior tier: {stats['missing_senior']}")
        print(f"  Frontmatter errors: {stats['frontmatter_errors']}")
        print(f"  Code block errors: {stats['code_block_errors']}")
        print(f"  Inconsistent tiers: {stats['inconsistent_tiers']}")
        
        if errors:
            print(f"\nERRORS FOUND ({len(errors)} files):")
            for error in errors[:20]:  # Show first 20 errors
                print(f"\n  📁 {error['file']}")
                for issue in error['issues']:
                    print(f"    ❌ {issue}")
            
            if len(errors) > 20:
                print(f"\n  ... and {len(errors) - 20} more files with issues")
        
        # Success rate
        success_rate = (stats['entries_with_tiers'] / stats['total_entries'] * 100) if stats['total_entries'] > 0 else 0
        print(f"\nOVERALL HEALTH: {success_rate:.1f}% entries have complete, consistent tiers")
        
        if success_rate >= 90:
            print("  ✅ EXCELLENT - Vault is in great shape!")
        elif success_rate >= 75:
            print("  ⚠️  GOOD - Some issues need attention")
        else:
            print("  ❌ NEEDS WORK - Significant issues found")

if __name__ == "__main__":
    vault_path = "/Users/senojekim/Documents/projects/codesheets/python-vault"
    
    if not os.path.exists(vault_path):
        print(f"Error: Vault path not found: {vault_path}")
        sys.exit(1)
    
    auditor = VaultAuditor(vault_path)
    results = auditor.audit_all()
    auditor.print_report(results)
