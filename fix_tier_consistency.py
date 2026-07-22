#!/usr/bin/env python3
"""
Script to fix tier consistency issues in Python vault entries.
Focuses on high-priority fixes first.
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Tuple, Optional

class TierConsistencyFixer:
    def __init__(self, vault_path: str):
        self.vault_path = Path(vault_path)
        self.fixes_applied = []
        
    def find_inconsistent_entries(self) -> List[Path]:
        """Find entries with tier consistency issues from our previous audit."""
        # These are the entries flagged in our audit
        problematic_entries = [
            "Sections/advanced/advanced-patterns-py/dataclass-advanced.md",
            "Sections/advanced/advanced-patterns-py/singleton-pattern.md",
            "Sections/advanced/context-managers/context-manager-patterns.md",
            "Sections/advanced/decorators/class-decorators.md",
            "Sections/advanced/metaprogramming/abstract-base-classes.md",
            "Sections/advanced/metaprogramming/slots-advanced.md",
            "Sections/advanced/metaprogramming/slots.md",
            "Sections/advanced/typing-dataclasses/dataclasses-advanced.md",
            "Sections/astropy-scientific/patterns/scientific-stack-decision.md",
            "Sections/audio-dsp/formats/audio-file-formats.md",
            "Sections/audio-dsp/patterns/audio-librosa-vs-torchaudio.md",
            "Sections/bioinformatics/patterns/bio-stack-decision.md",
            "Sections/bioinformatics/scanpy/scanpy-pca-umap-cluster.md",
            "Sections/caching/http-cdn/cdn-edge-caching.md",
            "Sections/cli/cli-utilities/rich-output.md",
            "Sections/cli/cli-utilities/sys-argv.md",
            "Sections/concurrency/concurrent-futures/futures-patterns.md",
            "Sections/concurrency/multiprocessing-deep/mp-lock.md",
            "Sections/concurrency/multiprocessing-deep/mp-queue-pipe.md",
            "Sections/concurrency/threading-patterns/threading-lock.md"
        ]
        
        entries = []
        for entry_path in problematic_entries:
            full_path = self.vault_path / entry_path
            if full_path.exists():
                entries.append(full_path)
        
        return entries
    
    def extract_core_problem(self, content: str) -> str:
        """Extract the core problem statement from the overview."""
        # Look for explicit task/problem statements
        task_match = re.search(r'## Task\s*\n\s*All tiers below solve the SAME concrete task', content, re.IGNORECASE)
        if task_match:
            # Extract the task description
            task_section = re.search(r'## Task\s*\n(.*?)(?=##|$)', content, re.DOTALL)
            if task_section:
                return task_section.group(1).strip()
        
        # Look for problem statements in overview
        overview_match = re.search(r'## Overview\s*\n(.*?)(?=##|$)', content, re.DOTALL)
        if overview_match:
            overview = overview_match.group(1)
            # Look for sentences that describe what the entry solves
            sentences = overview.split('.')
            for sentence in sentences:
                if any(keyword in sentence.lower() for keyword in ['solve', 'create', 'build', 'implement', 'use', 'handle']):
                    return sentence.strip()
        
        return ""
    
    def analyze_tier_problem(self, tier_code: str) -> Dict[str, any]:
        """Analyze what problem a tier solves."""
        if not tier_code:
            return {}
        
        # Extract the main goal from comments
        goal_match = re.search(r'# (GOAL|TASK|APPROACH).*?-(.+)', tier_code, re.IGNORECASE)
        if goal_match:
            goal = goal_match.group(2).strip()
        else:
            # Look for the main operation in the code
            lines = tier_code.split('\n')
            goal = ""
            for line in lines:
                line = line.strip()
                if line and not line.startswith('#') and not line.startswith('import'):
                    # This is likely the main operation
                    goal = line
                    break
        
        # Extract key operations
        operations = re.findall(r'(\w+)\(', tier_code)
        imports = re.findall(r'import\s+(\w+)', tier_code)
        from_imports = re.findall(r'from\s+(\w+)', tier_code)
        
        return {
            'goal': goal,
            'operations': set(operations),
            'imports': set(imports) | set(from_imports),
            'main_object': self._extract_main_object(tier_code)
        }
    
    def _extract_main_object(self, code: str) -> str:
        """Extract the main object being worked on."""
        # Look for variable assignments that might be the main object
        assignments = re.findall(r'(\w+)\s*=\s*\w+', code)
        if assignments:
            return assignments[0]
        
        # Look for class definitions
        class_match = re.search(r'class\s+(\w+)', code)
        if class_match:
            return class_match.group(1)
        
        return ""
    
    def suggest_fix_strategy(self, entry_path: Path, content: str) -> str:
        """Suggest a fix strategy for inconsistent tiers."""
        intro_code = self._extract_tier_code(content, 'intro')
        junior_code = self._extract_tier_code(content, 'junior')
        senior_code = self._extract_tier_code(content, 'senior')
        
        intro_analysis = self.analyze_tier_problem(intro_code)
        junior_analysis = self.analyze_tier_problem(junior_code)
        senior_analysis = self.analyze_tier_problem(senior_code)
        
        # Check if they're solving different problems
        problems = [intro_analysis.get('goal', ''), junior_analysis.get('goal', ''), senior_analysis.get('goal', '')]
        unique_problems = set(filter(None, problems))
        
        if len(unique_problems) > 1:
            return f"MULTIPLE_PROBLEMS: Found {len(unique_problems)} different problems: {list(unique_problems)}"
        
        # Check for import inconsistencies
        all_imports = [intro_analysis.get('imports', set()), junior_analysis.get('imports', set()), senior_analysis.get('imports', set())]
        if not all_imports[0].issubset(all_imports[1]):
            missing_imports = all_imports[0] - all_imports[1]
            return f"MISSING_IMPORTS: Junior missing imports from intro: {missing_imports}"
        
        # Check for different main objects
        objects = [intro_analysis.get('main_object', ''), junior_analysis.get('main_object', ''), senior_analysis.get('main_object', '')]
        unique_objects = set(filter(None, objects))
        if len(unique_objects) > 1:
            return f"DIFFERENT_OBJECTS: Different main objects: {list(unique_objects)}"
        
        return "CONSISTENT"
    
    def _extract_tier_code(self, content: str, tier: str) -> str:
        """Extract the first code block from a tier."""
        sections = {
            'intro': r'## Example — Intro \(Entry-Level\)(.*?)(?=##|$)',
            'junior': r'## Example — Junior \(Intermediate\)(.*?)(?=##|$)',
            'senior': r'## Example — Senior \(Production\)(.*?)(?=##|$)'
        }
        
        if tier not in sections:
            return ""
        
        pattern = sections[tier]
        match = re.search(pattern, content, re.DOTALL)
        if not match:
            return ""
        
        section_content = match.group(1)
        # Extract the first python code block
        code_blocks = re.findall(r'```python\n(.*?)\n```', section_content, re.DOTALL)
        return code_blocks[0] if code_blocks else ""
    
    def fix_missing_tiers(self, entry_path: Path) -> bool:
        """Add missing tiers to an entry."""
        with open(entry_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check which tiers are missing
        has_intro = bool(re.search(r'## Example — Intro \(Entry-Level\)', content))
        has_junior = bool(re.search(r'## Example — Junior \(Intermediate\)', content))
        has_senior = bool(re.search(r'## Example — Senior \(Production\)', content))
        
        modified = False
        
        if not has_intro:
            content = self._add_intro_tier(content)
            modified = True
        
        if not has_junior:
            content = self._add_junior_tier(content)
            modified = True
        
        if not has_senior:
            content = self._add_senior_tier(content)
            modified = True
        
        if modified:
            with open(entry_path, 'w', encoding='utf-8') as f:
                f.write(content)
            self.fixes_applied.append(f"Added missing tiers to {entry_path.name}")
        
        return modified
    
    def _add_intro_tier(self, content: str) -> str:
        """Add a basic intro tier to an entry."""
        # Find where to insert (after Signature section)
        signature_match = re.search(r'(## Signature.*?```.*?```\n\n)', content, re.DOTALL)
        if signature_match:
            insert_point = signature_match.end()
            
            # Extract title for context
            title_match = re.search(r'title:\s*"([^"]+)"', content)
            title = title_match.group(1) if title_match else "Function"
            
            intro_section = f"""## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Basic usage of {title}
# STRENGTHS - Simple, straightforward implementation
# WEAKNESSES- Limited features, no error handling
#
# TODO: Add specific example code for this entry
```

"""
            return content[:insert_point] + intro_section + content[insert_point:]
        
        return content
    
    def _add_junior_tier(self, content: str) -> str:
        """Add a junior tier to an entry."""
        # Find intro section end
        intro_match = re.search(r'## Example — Intro \(Entry-Level\).*?```\n\n', content, re.DOTALL)
        if intro_match:
            insert_point = intro_match.end()
            
            junior_section = """## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Intermediate usage with more features
# STRENGTHS - Better error handling, more options
# WEAKNESSES- More complex, still basic for production
#
# TODO: Add specific junior-level example code
```

"""
            return content[:insert_point] + junior_section + content[insert_point:]
        
        return content
    
    def _add_senior_tier(self, content: str) -> str:
        """Add a senior tier to an entry."""
        # Find junior section end
        junior_match = re.search(r'## Example — Junior \(Intermediate\).*?```\n\n', content, re.DOTALL)
        if junior_match:
            insert_point = junior_match.end()
            
            senior_section = """## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Production-ready implementation
# STRENGTHS - Robust error handling, optimized performance
# WEAKNESSES- More complex, requires deeper understanding
#
# TODO: Add specific senior-level example code
```

"""
            return content[:insert_point] + senior_section + content[insert_point:]
        
        return content
    
    def analyze_entry(self, entry_path: Path) -> Dict[str, any]:
        """Analyze a single entry for consistency issues."""
        with open(entry_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return {
            'file': entry_path.name,
            'strategy': self.suggest_fix_strategy(entry_path, content),
            'core_problem': self.extract_core_problem(content),
            'has_intro': bool(re.search(r'## Example — Intro \(Entry-Level\)', content)),
            'has_junior': bool(re.search(r'## Example — Junior \(Intermediate\)', content)),
            'has_senior': bool(re.search(r'## Example — Senior \(Production\)', content))
        }
    
    def run_analysis(self):
        """Run analysis on inconsistent entries."""
        entries = self.find_inconsistent_entries()
        
        print(f"Analyzing {len(entries)} high-priority inconsistent entries...")
        print("\n" + "="*80)
        print("TIER CONSISTENCY ANALYSIS")
        print("="*80)
        
        for entry_path in entries:
            analysis = self.analyze_entry(entry_path)
            
            print(f"\n📁 {analysis['file']}")
            print(f"   Strategy: {analysis['strategy']}")
            print(f"   Tiers: Intro={analysis['has_intro']} Junior={analysis['has_junior']} Senior={analysis['has_senior']}")
            
            if analysis['core_problem']:
                print(f"   Core Problem: {analysis['core_problem'][:100]}...")
        
        print(f"\n{'='*80}")
        print(f"Analysis complete. Ready to proceed with fixes.")
        print(f"{'='*80}")

if __name__ == "__main__":
    vault_path = "/Users/senojekim/Documents/projects/codesheets/python-vault"
    fixer = TierConsistencyFixer(vault_path)
    fixer.run_analysis()
