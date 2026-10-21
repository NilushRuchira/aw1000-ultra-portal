# Workspace Rules & Engineering Standards

## 1. Git Branching & Commit Constraints

### ⚠️ STRICT RULE: Never Commit Changes Directly to the `main` Branch
- **Under NO circumstances should any commits be made directly to the `main` branch.**
- **Workflow Requirement**:
  1. Always verify the current branch with `git branch --show-current` before staging or committing files.
  2. If on `main`, switch to or create an appropriate feature or fix branch before committing:
     ```bash
     git checkout -b feature/<feature-name>   # or fix/<issue-name>
     ```
  3. All code modifications, tests, documentation, and configuration updates must be committed to that feature/fix branch.
  4. Changes reach `main` exclusively through Pull Requests or explicit, user-approved merge workflows after verification.

---

## 2. Code Quality & Pre-Merge Checks
Before committing or merging changes:
- Frontend validation: Ensure `npm run lint` and `npm run build` pass with 0 errors and 0 warnings.
- Backend validation: Ensure `cargo check --manifest-path src-tauri/Cargo.toml` finishes cleanly with 0 errors.
