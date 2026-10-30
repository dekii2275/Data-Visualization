# Code Organization & Engineering Guidelines

This repository follows clean architecture, separation of concerns, and modular design principles inspired by Cohere Toolkit and enterprise production standards.

## 1. Directory Structure Conventions
- **`scripts/`**: Place all data preprocessing, generation, and automation scripts here. Each script must have a clear CLI interface or entry point (`if __name__ == '__main__':`) and informative logging/comments.
- **`demo/`**: Web application files (HTML, CSS, JS) must remain modular:
  - `index.html`: Clean semantic markup only.
  - `style.css`: Structured CSS with CSS variables (design tokens), no inline styling.
  - `app.js`: Isolated logic, event listeners, and API/data fetchers.
- **`data/`**: Datasets should be categorized into `raw/` and `processed/` when scaling up.

## 2. Code Quality & Modularity Rules
- **Explicit Schemas & Types**: In Python, use type hints (`typing`, `pydantic`). In JavaScript/TypeScript, use strict typing or explicit JSDoc.
- **Single Responsibility Principle**: Separate data transformation, business logic, and presentation logic into distinct functions/modules.
- **No Hardcoded Configurations**: Keep constants, file paths, and environment settings in dedicated config blocks or files.
- **Documentation**: All non-trivial functions must have docstrings explaining parameters, return values, and business rationale.
