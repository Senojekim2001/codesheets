/**
 * dailyReview.js
 * Daily review and spaced repetition templates for the Obsidian vault.
 * Uses Obsidian's Dataview-compatible frontmatter for smart querying.
 */

/**
 * Generate the Daily Review template note.
 * This is meant to be copied daily or used with Obsidian Templater.
 */
export function dailyReviewTemplate() {
  return `---
type: daily-review
date: "{{date:YYYY-MM-DD}}"
---

# Daily Code Review — {{date:YYYY-MM-DD}}

## Morning Warm-Up (10 min)

### Quick Recall
Pick 3 random entries from domains you're studying. For each one:
- [ ] Write the syntax from memory
- [ ] Explain when you'd use it
- [ ] Name one common mistake

> **Tip:** Use Obsidian's Random Note plugin or pick from your recent reviews below.

### Yesterday's Entries
![[Daily Review — {{yesterday}}#New Entries Learned]]

---

## Study Session

### New Entries Learned
<!-- Add wikilinks to entries you studied today -->
1.
2.
3.

### Key Insights
<!-- What clicked today? Any "aha" moments? -->


### Connections Found
<!-- Did you notice links between domains? -->


---

## Evening Review (5 min)

### Confidence Check
Rate today's entries (1-5):

| Entry | Confidence | Next Review |
|-------|-----------|-------------|
|       |           |             |
|       |           |             |
|       |           |             |

### Tomorrow's Focus
<!-- What will you study tomorrow? -->


---

## Spaced Repetition Queue
<!-- Move entries here based on confidence scores -->

### Review Tomorrow (Score 1-2)


### Review in 3 Days (Score 3)


### Review Next Week (Score 4-5)


---
*Part of the CodeSheets Premium Vault — [[Study System]]*
`
}

/**
 * Generate the Study System overview note.
 */
export function studySystemNote(domainList) {
  const domainLinks = domainList
    .map(d => `- [[${d.label} — Index|${d.icon} ${d.label}]] (${d.entryCount} entries)`)
    .join('\n')

  return `---
type: system
---

# CodeSheets Study System

## How to Use This Vault

### Structure
This vault contains **{{totalEntries}} entries** across **{{domainCount}} domains**,
organized for maximum learning efficiency.

**Folders:**
- \`Domains/\` — Entry notes organized by domain
- \`MOC/\` — Maps of Content linking concepts across domains
- \`Learning Paths/\` — Guided sequences from beginner to advanced
- \`Prompts/\` — AI prompt templates for deeper learning
- \`Templates/\` — Daily review and study templates

### Domains
${domainLinks}

### Recommended Workflow

#### 1. Choose a Learning Path
Start with a [[Learning Paths Index|Learning Path]] for your domain.
These are curated sequences that build knowledge in the right order.

#### 2. Study Entry Notes
Each entry contains:
- **Syntax** and **signature** for quick reference
- **Code examples** you can copy and run
- **Pro tips** from experienced developers
- **Common mistakes** to avoid
- **Cross-domain links** showing the same concept in other languages

#### 3. Daily Review
Use the [[Daily Review Template]] each day to:
- Recall yesterday's entries
- Study 3-5 new entries
- Rate your confidence
- Build your spaced repetition queue

#### 4. Explore Connections
The [[Maps of Content Index|Maps of Content]] reveal powerful connections:
- "Filtering" works differently in SQL, Python, JS, R, and Go
- The same patterns appear everywhere once you see them
- Understanding one domain accelerates learning another

#### 5. Practice with Prompts
Use the [[Prompt Templates Index|Prompt Templates]] with ChatGPT, Claude, or Copilot
to generate practice exercises, get code reviews, and explore topics deeper.

### Tips for Power Users
- **Use backlinks**: Click on any \`Linked Mentions\` to discover hidden connections
- **Tag entries**: Add your own tags like \`#needs-practice\` or \`#mastered\`
- **Dataview queries**: Filter entries by domain, difficulty, or your tags
- **Graph view**: Open the graph to visualize concept clusters

---
*CodeSheets Premium Vault — codesheets.dev*
`
}

/**
 * Generate the weekly review template.
 */
export function weeklyReviewTemplate() {
  return `---
type: weekly-review
week: "{{date:YYYY-[W]ww}}"
---

# Weekly Review — {{date:YYYY-[W]ww}}

## This Week's Progress

### Entries Studied
<!-- List all entries from this week's daily reviews -->


### Domains Touched
- [ ] Python
- [ ] JavaScript
- [ ] SQL
- [ ] Go
- [ ] TypeScript
- [ ] React
- [ ] Next.js
- [ ] Node.js
- [ ] R
- [ ] Stats
- [ ] Excel

### Concepts Mastered
<!-- Entries you can confidently write from memory -->


### Concepts to Revisit
<!-- Entries that still feel shaky -->


---

## Cross-Domain Connections
<!-- What patterns did you notice this week? -->


## Next Week's Plan

### Focus Domain(s):

### Target Entries (aim for 15-25/week):

### Learning Path Progress:
- Path:
- Current step:
- Target step:

---
*Part of the CodeSheets Premium Vault — [[Study System]]*
`
}
