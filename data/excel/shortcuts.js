export const meta = {
  "id": "shortcuts",
  "label": "Keyboard Shortcuts",
  "icon": "⌨️",
  "description": "Essential Excel keyboard shortcuts for power users — navigation, selection, formatting, formulas, and data management on both Windows and Mac."
}

export const sections = [

  // ── Section 1: Navigation & Selection ─────────────────────────────────────────
  {
    id: "navigation-selection",
    title: "Navigation & Selection",
    entries: [
      {
        id: "cell-navigation",
        fn: "Cell Navigation — Moving Around Worksheets Fast",
        desc: "Jump to edges, move between sheets, go to specific cells, and navigate large datasets without touching the mouse.",
        category: "Navigation",
        subtitle: "Ctrl+Arrow, Ctrl+Home/End, Ctrl+G, Page Up/Down, Tab, Enter",
        signature: "Win: Ctrl+Arrow  |  Mac: ⌘+Arrow  |  Jump to edge of data region",
        descLong: "Efficient navigation is the foundation of Excel power use. Ctrl+Arrow (⌘+Arrow on Mac) jumps to the edge of the current data region — the last filled cell before a blank. Ctrl+Home goes to A1; Ctrl+End goes to the last used cell. Ctrl+G (or F5) opens Go To for jumping to named ranges or specific cells. Ctrl+Page Up/Down switches between worksheet tabs. These shortcuts chain: Ctrl+Shift+End selects from current cell to the last used cell.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Cell Navigation — Moving Around Worksheets Fast — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nNavigation Shortcuts\n─────────────────────────────────────────────────────────\nAction                          Windows              Mac\n─────────────────────────────────────────────────────────\nMove one cell                   Arrow keys           Arrow keys\nJump to edge of data region     Ctrl+Arrow           ⌘+Arrow\nJump to cell A1                 Ctrl+Home            ⌘+Fn+←  (or Ctrl+Home)\nJump to last used cell          Ctrl+End             ⌘+Fn+→  (or Ctrl+End)\nGo To dialog (jump to cell)     Ctrl+G  or  F5       ⌘+G  or  Ctrl+G\nNext worksheet tab              Ctrl+Page Down       ⌥+→  (or Ctrl+Page Down)\nPrevious worksheet tab          Ctrl+Page Up         ⌥+←  (or Ctrl+Page Up)\nMove to next cell (right)       Tab                  Tab\nMove to previous cell (left)    Shift+Tab            Shift+Tab\nMove down in selection          Enter                Enter (or Return)\nMove up in selection            Shift+Enter          Shift+Return\nToggle between open workbooks   Ctrl+Tab             ⌘+`  (backtick)\nScroll without moving cursor    Scroll Lock+Arrow    Fn+Arrow (varies)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Cell Navigation — Moving Around Worksheets Fast — common patterns you'll see in production.\n// APPROACH  - Combine Cell Navigation — Moving Around Worksheets Fast with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n─── Pro Combos ────────────────────────────────────────\nJump to A1 from anywhere:       Ctrl+Home"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Cell Navigation — Moving Around Worksheets Fast — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nJump to named range:            Ctrl+G → type name → Enter\nMove to start of row:           Home                 Fn+←\nMove to next blank in column:   Ctrl+↓ (repeats to skip regions)"
                  }
        ],
        tips: [
                  "Ctrl+Arrow jumps to the EDGE of the current data block — if in a blank cell, it jumps to the next filled cell. Chain presses to hop between data islands.",
                  "Ctrl+G (Go To) accepts cell references (B500), named ranges (SalesData), and even formulas — it is the fastest way to jump anywhere.",
                  "Ctrl+End goes to the last used cell — if this seems too far, it means you have formatting or data in distant cells. Delete unused rows/columns to fix.",
                  "Name Box (left of formula bar) — click it, type a cell reference or range name, press Enter to jump there instantly."
        ],
        mistake: "Scrolling with the mouse to find data in large sheets — use Ctrl+End to find the extent of data, Ctrl+Arrow to jump through columns, or Ctrl+G to go directly to a cell. Mouse scrolling in 100K+ row sheets wastes minutes.",
        shorthand: {
          verbose: "// Manual / verbose approach\nClick scroll bar repeatedly to navigate\n// Takes forever in 100K+ row sheets\n// More explicit but longer",
          concise: "Ctrl+End for data extent; Ctrl+Arrow to edge; Ctrl+G or Name Box for direct jump",
        },
      },
      {
        id: "selecting-ranges",
        fn: "Selecting Ranges — Highlight Data Precisely",
        desc: "Select cells, rows, columns, regions, and non-contiguous ranges with keyboard shortcuts for both platforms.",
        category: "Selection",
        subtitle: "Shift+Arrow, Ctrl+Shift+End, Ctrl+Space, Shift+Space, Ctrl+A",
        signature: "Win: Ctrl+Shift+End  |  Mac: ⌘+Shift+End  |  Select to last used cell",
        descLong: "Selection shortcuts build on navigation: hold Shift while navigating to select. Ctrl+Shift+Arrow selects to the edge of the data region. Ctrl+Shift+End selects from current cell to the last used cell. Ctrl+Space selects the entire column; Shift+Space selects the entire row. Ctrl+A selects the current region (press again for entire sheet). For non-contiguous selection, hold Ctrl (⌘ on Mac) and click/drag additional ranges.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Selecting Ranges — Highlight Data Precisely — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nSelection Shortcuts\n─────────────────────────────────────────────────────────\nAction                          Windows              Mac\n─────────────────────────────────────────────────────────\nExtend selection one cell        Shift+Arrow          Shift+Arrow\nSelect to edge of data region    Ctrl+Shift+Arrow     ⌘+Shift+Arrow\nSelect to cell A1                Ctrl+Shift+Home      ⌘+Shift+Fn+←\nSelect to last used cell         Ctrl+Shift+End       ⌘+Shift+Fn+→\nSelect entire column             Ctrl+Space           Ctrl+Space\nSelect entire row                Shift+Space          Shift+Space\nSelect entire worksheet          Ctrl+A (×2)          ⌘+A (×2)\nSelect current region            Ctrl+Shift+*         ⌘+Shift+*\nAdd to selection (non-contiguous) Ctrl+Click          ⌘+Click\nSelect visible cells only        Alt+;                ⌘+Shift+Z\nSelect cells with formulas       Ctrl+G → Special     ⌘+G → Special\nExtend selection to match        Shift+Click          Shift+Click"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Selecting Ranges — Highlight Data Precisely — common patterns you'll see in production.\n// APPROACH  - Combine Selecting Ranges — Highlight Data Precisely with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n─── Power Selection Patterns ──────────────────────────\nSelect entire data table:        Ctrl+Shift+*  (from any cell in table)\nSelect column of data:           Ctrl+Space → Ctrl+Shift+↓"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Selecting Ranges — Highlight Data Precisely — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nSelect all formulas:             Ctrl+G → Special → Formulas\nSelect blanks (to fill):         Ctrl+G → Special → Blanks\nSelect differences in row:       Ctrl+\\               ⌘+\\"
                  }
        ],
        tips: [
                  "Ctrl+Shift+* selects the current data region (contiguous block) — the fastest way to select an entire table without manually dragging.",
                  "Alt+; (Select Visible Cells Only) is critical after filtering — without it, paste/delete affects hidden rows too.",
                  "Go To Special (Ctrl+G → Special) can select blanks, formulas, constants, or cells with errors — then apply formatting or fill to all at once.",
                  "Shift+Click extends the selection from the active cell to the clicked cell — no dragging needed for large ranges."
        ],
        mistake: "Dragging to select large ranges (A1 to Z10000) — use Ctrl+Shift+End or type the range in the Name Box (e.g., A1:Z10000 then Enter). Dragging is slow and imprecise for anything over a screenful.",
        shorthand: {
          verbose: "// Manual / verbose approach\nClick A1, drag to Z10000\n// Imprecise, slow\n// More explicit but longer",
          concise: "Name Box: type range → Enter; Ctrl+Shift+End; Ctrl+Shift+Arrow to data edge",
        },
      },
    ],
  },

  // ── Section 2: Editing & Formatting ─────────────────────────────────────────
  {
    id: "editing-formatting",
    title: "Editing & Formatting",
    entries: [
      {
        id: "cell-editing",
        fn: "Cell Editing — Input, Copy, Paste & Undo",
        desc: "Edit cells, copy/paste special, fill series, undo/redo, find & replace, and insert/delete rows and columns.",
        category: "Editing",
        subtitle: "F2, Ctrl+C/V, Ctrl+D, Ctrl+Z, Ctrl+H, Ctrl+Shift+Plus",
        signature: "Win: Ctrl+D (fill down)  |  Mac: ⌘+D  |  Copy cell above into selection",
        descLong: "F2 enters edit mode in the active cell. Ctrl+C/V copies and pastes; Ctrl+Shift+V (or Ctrl+Alt+V) opens Paste Special for pasting values, formats, or formulas only. Ctrl+D fills down (copies the cell above into selected cells below); Ctrl+R fills right. Ctrl+Z undoes; Ctrl+Y redoes. Ctrl+H opens Find & Replace. Ctrl+Shift++ inserts rows/columns; Ctrl+- deletes them. These are the most-used shortcuts in daily Excel work.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Cell Editing — Input, Copy, Paste & Undo — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nEditing Shortcuts\n─────────────────────────────────────────────────────────\nAction                          Windows              Mac\n─────────────────────────────────────────────────────────\nEdit active cell                 F2                   F2  (or Ctrl+U)\nConfirm entry (move down)        Enter                Return\nConfirm entry (stay in cell)     Ctrl+Enter           Ctrl+Return\nCancel entry                     Esc                  Esc\nDelete cell contents             Delete               Delete (or Fn+⌫)\nCut                              Ctrl+X               ⌘+X\nCopy                             Ctrl+C               ⌘+C\nPaste                            Ctrl+V               ⌘+V\nPaste Special dialog             Ctrl+Alt+V           ⌘+Ctrl+V\nPaste Values only                Ctrl+Alt+V → V → Enter   ⌘+Ctrl+V → V → Return\nFill Down (copy from above)      Ctrl+D               ⌘+D\nFill Right (copy from left)      Ctrl+R               ⌘+R\nUndo                             Ctrl+Z               ⌘+Z\nRedo                             Ctrl+Y               ⌘+Y\nFind                             Ctrl+F               ⌘+F\nFind & Replace                   Ctrl+H               ⌘+H  (or Ctrl+H)\nInsert cells/rows/columns        Ctrl+Shift++         ⌘+Shift++  (or Ctrl+I)\nDelete cells/rows/columns        Ctrl+-               ⌘+-\nEnter same data in all selected  Type → Ctrl+Enter    Type → Ctrl+Return\nInsert current date              Ctrl+;               ⌘+;  (or Ctrl+;)\nInsert current time              Ctrl+Shift+;         ⌘+Shift+;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Cell Editing — Input, Copy, Paste & Undo — common patterns you'll see in production.\n// APPROACH  - Combine Cell Editing — Input, Copy, Paste & Undo with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n─── Paste Special Quick Keys (in dialog) ──────────────\nV = Values only       F = Formulas only\nT = Formats only      W = Column widths\nE = Paste transpose   (check Transpose box)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Cell Editing — Input, Copy, Paste & Undo — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n─── Multi-Cell Entry ──────────────────────────────────,Select range → type value → Ctrl+Enter,  → fills ALL selected cells with the typed value,  → works with formulas too"
                  }
        ],
        tips: [
                  "Ctrl+Enter confirms input AND stays in the same cell — perfect when entering data you need to verify before moving on.",
                  "Select a range, type a value, then Ctrl+Enter fills every selected cell with that value at once — huge time saver for initializing columns.",
                  "Paste Special → Values (Ctrl+Alt+V, V, Enter) removes formulas and keeps only the calculated results — essential before deleting source data.",
                  "Ctrl+; inserts today's date as a static value (does not recalculate). Use =TODAY() if you need a dynamic date."
        ],
        mistake: "Using Ctrl+V to paste when you only need values — this pastes formulas, formatting, and validation rules too, often breaking your target range. Build the muscle memory for Paste Values: Ctrl+Alt+V → V → Enter.",
        shorthand: {
          verbose: "// Manual / verbose approach\nCtrl+V → pastes formulas + formatting\n// Often breaks things\n// More explicit but longer",
          concise: "Ctrl+Alt+V (Paste Special) → V → Enter for values only; Ctrl+Alt+V → T for transpose",
        },
      },
      {
        id: "formatting-shortcuts",
        fn: "Formatting — Bold, Borders, Number Formats & Styles",
        desc: "Apply formatting with keyboard: bold/italic, number formats, borders, cell alignment, column width, and conditional formatting.",
        category: "Formatting",
        subtitle: "Ctrl+B/I/U, Ctrl+1, Ctrl+Shift+$, Alt+H shortcuts",
        signature: "Win: Ctrl+1 (Format Cells)  |  Mac: ⌘+1  |  Open the full formatting dialog",
        descLong: "Ctrl+1 (⌘+1) opens the Format Cells dialog — the most powerful formatting shortcut. Number format shortcuts: Ctrl+Shift+$ for currency, Ctrl+Shift+% for percentage, Ctrl+Shift+# for date. Ctrl+B/I/U toggle bold/italic/underline. Alt+H opens the Home tab ribbon for all formatting options. For borders, use Ctrl+Shift+& (outline border) and Ctrl+Shift+_ (remove borders). Column auto-fit: select columns → Alt+H+O+I.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Formatting — Bold, Borders, Number Formats & Styles — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nFormatting Shortcuts\n─────────────────────────────────────────────────────────\nAction                          Windows              Mac\n─────────────────────────────────────────────────────────\nFormat Cells dialog              Ctrl+1               ⌘+1\nBold                             Ctrl+B               ⌘+B\nItalic                           Ctrl+I               ⌘+I\nUnderline                        Ctrl+U               ⌘+U\nStrikethrough                    Ctrl+5               ⌘+Shift+X\nCurrency format ($)              Ctrl+Shift+$         Ctrl+Shift+$\nPercentage format (%)            Ctrl+Shift+%         Ctrl+Shift+%\nDate format (d-mmm-yy)          Ctrl+Shift+#         Ctrl+Shift+#\nTime format (h:mm AM/PM)        Ctrl+Shift+@         Ctrl+Shift+@\nNumber format (2 decimals)       Ctrl+Shift+!         Ctrl+Shift+!\nGeneral format (clear format)    Ctrl+Shift+~         Ctrl+Shift+~\nOutline border                   Ctrl+Shift+&         ⌘+⌥+0\nRemove all borders               Ctrl+Shift+_         ⌘+⌥+-\nIncrease font size               Alt+H+FG             ⌘+Shift+>\nDecrease font size               Alt+H+FK             ⌘+Shift+<\nAlign left                       Ctrl+L               ⌘+L\nAlign center                     Ctrl+E               ⌘+E\nAlign right                      Ctrl+R               ⌘+R  (conflicts w/ Fill Right)\nIndent                           Alt+H+6              Ctrl+⌥+Tab\nToggle wrap text                 Alt+H+W              (use Format Cells)\nAuto-fit column width            Alt+H+O+I            (double-click column border)\nAuto-fit row height              Alt+H+O+A            (double-click row border)\nHide rows                        Ctrl+9               ⌘+9  (or Ctrl+9)\nUnhide rows                      Ctrl+Shift+9         ⌘+Shift+9\nHide columns                     Ctrl+0               ⌘+0  (or Ctrl+0)\nUnhide columns                   Ctrl+Shift+0         ⌘+Shift+0"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Formatting — Bold, Borders, Number Formats & Styles — common patterns you'll see in production.\n// APPROACH  - Combine Formatting — Bold, Borders, Number Formats & Styles with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n─── Number Format Quick Reference ─────────────────────\nCtrl+Shift+~  → General (123456.789)\nCtrl+Shift+!  → Number (123,456.79)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Formatting — Bold, Borders, Number Formats & Styles — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nCtrl+Shift+$  → Currency ($123,456.79)\nCtrl+Shift+%  → Percentage (12%)\nCtrl+Shift+#  → Date (15-Mar-2024)\nCtrl+Shift+@  → Time (3:45 PM)"
                  }
        ],
        tips: [
                  "Ctrl+1 (Format Cells) is the single most useful formatting shortcut — it gives access to every number format, alignment, font, border, and protection option.",
                  "Number format shortcuts are sticky — Ctrl+Shift+$ on a column header formats the entire column as currency, including future entries.",
                  "Alt+H+O+I auto-fits column width to content — faster than double-clicking column borders when you have many columns to resize.",
                  "Ctrl+5 for strikethrough is great for marking completed tasks in tracked lists without deleting the data."
        ],
        mistake: "Manually formatting individual cells instead of using styles — Home > Cell Styles applies consistent formatting across the workbook. Format one cell, save it as a style, and apply it everywhere with two clicks.",
        shorthand: {
          verbose: "// Manual / verbose approach\nRight-click → Format Cells on each cell\n// Repeats formatting 100x\n// More explicit but longer",
          concise: "Home → Cell Styles; New Cell Style to save; Ctrl+Shift+P to duplicate; apply everywhere with one click",
        },
      },
    ],
  },

  // ── Section 3: Formulas & Data Management ─────────────────────────────────────────
  {
    id: "formulas-data",
    title: "Formulas & Data Management",
    entries: [
      {
        id: "formula-shortcuts",
        fn: "Formula Shortcuts — AutoSum, Auditing & References",
        desc: "Enter formulas fast: AutoSum, absolute/relative references, formula auditing, array formulas, and named ranges.",
        category: "Formulas",
        subtitle: "Alt+=, F4, Ctrl+`, Ctrl+Shift+Enter, F3, Ctrl+Shift+A",
        signature: "Win: Alt+= (AutoSum)  |  Mac: ⌘+Shift+T  |  Insert SUM for adjacent range",
        descLong: "Alt+= (⌘+Shift+T on Mac) inserts AutoSum for the adjacent range — works for SUM, AVERAGE, COUNT, MIN, MAX. F4 cycles absolute/relative references ($A$1 → A$1 → $A1 → A1). Ctrl+` toggles formula view to see all formulas in the sheet. Ctrl+[ traces precedents (which cells feed into this formula); Ctrl+] traces dependents. F3 pastes named ranges into formulas. F9 inside the formula bar evaluates the selected portion — invaluable for debugging complex formulas.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Formula Shortcuts — AutoSum, Auditing & References — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nFormula Shortcuts\n─────────────────────────────────────────────────────────\nAction                          Windows              Mac\n─────────────────────────────────────────────────────────\nAutoSum                          Alt+=                ⌘+Shift+T\nCycle reference type ($)         F4                   ⌘+T  (or F4)\nToggle formula view              Ctrl+`               Ctrl+`\nShow formula in cell (edit)      F2                   F2\nAccept formula suggestion        Tab                  Tab\nInsert function dialog           Shift+F3             Shift+Fn+F3\nPaste named range                F3                   Fn+F3\nEnter array formula (legacy)     Ctrl+Shift+Enter     ⌘+Shift+Return\nCalculate all workbooks          F9                   Fn+F9  (or F9)\nCalculate active sheet only      Shift+F9             Shift+Fn+F9\nEvaluate part of formula         F9 (in formula bar)  Fn+F9 (in formula bar)\nTrace precedents                 Ctrl+[               ⌘+[  (or Ctrl+[)\nTrace dependents                 Ctrl+]               ⌘+]  (or Ctrl+])\nRemove arrows                    Alt+M+A+A            (Formulas tab)\nDefine name for selection        Ctrl+Shift+F3        ⌘+Shift+Fn+F3\nToggle AutoComplete              Alt+↓                ⌥+↓\nAccept AutoComplete              Enter                Return\nShow function arguments          Ctrl+Shift+A         Ctrl+Shift+A"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Formula Shortcuts — AutoSum, Auditing & References — common patterns you'll see in production.\n// APPROACH  - Combine Formula Shortcuts — AutoSum, Auditing & References with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n─── F4 Reference Cycling ──────────────────────────────\nPress F4 while cursor is on a reference in the formula bar:\n  1st press: $A$1  (absolute row & column)\n  2nd press: A$1   (absolute row only)\n  3rd press: $A1   (absolute column only)\n  4th press: A1    (relative — back to start)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Formula Shortcuts — AutoSum, Auditing & References — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n─── F9 Formula Debugging ──────────────────────────────,In the formula bar, select a portion of the formula,and press F9 to see its evaluated result:,  =VLOOKUP(A2, [select this → Sheet2!A:C ← press F9], 3, FALSE),  Shows the actual array that VLOOKUP is searching,  Press Esc to undo (do NOT press Enter — it replaces with the value)"
                  }
        ],
        tips: [
                  "F4 for reference cycling is the #1 formula shortcut — it toggles $A$1 / A$1 / $A1 / A1 without manual typing of dollar signs.",
                  "F9 in the formula bar evaluates the selected expression — select an argument in a nested formula and press F9 to see its result. Always press Esc after (Enter would hardcode the value).",
                  "Alt+= is smart — it detects whether to SUM the column above or the row to the left based on context. Select a range of empty cells at the bottom of columns to AutoSum all at once.",
                  "Ctrl+` (formula view) shows every formula in the sheet at once — the fastest way to audit a spreadsheet for hardcoded values vs formulas."
        ],
        mistake: "Not using F4 to lock references when copying formulas — copying =A1*B1 down a column shifts both references. If B1 is a fixed rate, press F4 on B1 to make it =$B$1 before copying. This is the #1 source of formula errors.",
        shorthand: {
          verbose: "// Manual / verbose approach\n=A1*B1 → copy down\n// B1 becomes B2, B3... wrong!\n// More explicit but longer",
          concise: "Click B1 in formula → press F4 cycles: B1 → $B$1 → B$1 → $B1; F2 to edit, F4 to lock",
        },
      },
      {
        id: "data-management",
        fn: "Data Management — Sort, Filter, Tables & Pivot",
        desc: "Data shortcuts: sort, filter, tables, freeze panes, grouping, pivot tables, and workbook management.",
        category: "Data",
        subtitle: "Ctrl+T, Ctrl+Shift+L, Alt+D+S, Alt+N+V, Ctrl+S, F12",
        signature: "Win: Ctrl+T (Create Table)  |  Mac: ⌘+T  |  Convert range to structured table",
        descLong: "Ctrl+T converts a range to an Excel Table with structured references and auto-expanding formulas. Ctrl+Shift+L toggles AutoFilter on/off. Alt+D+S opens Sort dialog; Alt+A+T toggles filter. Freeze Panes (Alt+W+F+F) keeps headers visible while scrolling. Ctrl+Shift+L adds dropdown filters. Alt+N+V creates a Pivot Table. For workbook management: Ctrl+S saves, F12 Save As, Ctrl+N new workbook, Ctrl+W close workbook.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Data Management — Sort, Filter, Tables & Pivot — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal clauses; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no optimization or complex scenarios.\nData & Workbook Shortcuts\n─────────────────────────────────────────────────────────\nAction                          Windows              Mac\n─────────────────────────────────────────────────────────\nCreate Table                     Ctrl+T               ⌘+T\nToggle AutoFilter                Ctrl+Shift+L         ⌘+Shift+F\nOpen filter dropdown             Alt+↓ (on header)    ⌥+↓ (on header)\nSort Ascending (A-Z)             Alt+D+S+S+A          (Data > Sort)\nSort Descending (Z-A)            Alt+D+S+S+D          (Data > Sort)\nClear all filters                Alt+D+F+S            (Data > Clear)\nInsert Pivot Table               Alt+N+V              (Insert > Pivot)\nRefresh Pivot Table              Alt+F5               ⌥+Fn+F5\nGroup rows/columns               Alt+Shift+→          ⌘+Shift+K\nUngroup rows/columns             Alt+Shift+←          ⌘+Shift+J\nToggle group expand/collapse     Alt+A+H / Alt+A+J    (click +/- buttons)\nFreeze Panes                     Alt+W+F+F            (View > Freeze)\nSplit window                     Alt+W+S              (View > Split)\nNew worksheet                    Shift+F11            Shift+Fn+F11\nRename worksheet                 Alt+H+O+R            Double-click tab\nMove/Copy sheet                  Alt+H+O+M            (right-click tab)\nZoom in                          Ctrl+Scroll Up       ⌘+Scroll Up  (or ⌘++)\nZoom out                         Ctrl+Scroll Down     ⌘+Scroll Down  (or ⌘+-)\nZoom to 100%                     Ctrl+1 (on numpad)   (View > Zoom)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Data Management — Sort, Filter, Tables & Pivot — common patterns you'll see in production.\n// APPROACH  - Combine Data Management — Sort, Filter, Tables & Pivot with related clauses; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex joins.\n─── Workbook Management ───────────────────────────────\nSave                             Ctrl+S               ⌘+S\nSave As                          F12                  ⌘+Shift+S  (or F12)\nNew workbook                     Ctrl+N               ⌘+N\nOpen workbook                    Ctrl+O               ⌘+O\nClose workbook                   Ctrl+W               ⌘+W\nPrint                            Ctrl+P               ⌘+P\nPrint Preview                    Ctrl+F2              ⌘+P  (preview in dialog)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Data Management — Sort, Filter, Tables & Pivot — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n─── Ribbon Access (Windows Alt Keys) ─────────────────,Alt       → Show ribbon key tips,Alt+H     → Home tab,Alt+N     → Insert tab,Alt+P     → Page Layout tab,Alt+M     → Formulas tab,Alt+A     → Data tab,Alt+R     → Review tab,Alt+W     → View tab"
                  }
        ],
        tips: [
                  "Ctrl+T (Create Table) is the single most impactful shortcut for data work — tables auto-expand, have structured references, and auto-apply formatting.",
                  "Alt key sequences (Alt+H+O+I for auto-fit) are Windows-only but extremely powerful — press Alt to see key tips overlay on the ribbon.",
                  "Ctrl+Shift+L toggles filters on/off instantly — much faster than going to the Data tab. Works on tables and plain ranges.",
                  "Shift+F11 inserts a new blank worksheet — faster than right-clicking the tab bar. Name it immediately by typing (the tab name is already selected)."
        ],
        mistake: "Not converting data to a Table (Ctrl+T) before working with it — raw ranges do not auto-expand formulas, do not have structured references, and lose filter states when you edit. Tables solve all of these for free.",
        shorthand: {
          verbose: "// Manual / verbose approach\nRaw range A1:D100\nNo auto-expand, no structured refs\n// More explicit but longer",
          concise: "Select data → Ctrl+T to create Table; formulas auto-expand; charts auto-scale; structured refs [ColumnName]",
        },
      },
    ],
  },
]

export default { meta, sections }
