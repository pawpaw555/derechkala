# Claude Working Rules — Derechkala Project

## Planning and approval

- No code changes before an approved plan is shared and confirmed
- If scope is unclear, stop and ask before doing anything
- Always stop and ask if a change touches something not explicitly approved

## Git and deployment

- No push, no Netlify deploy, no GitHub trigger unless explicitly approved
- Keep changes small and separated by topic — SEO, UX, map, image, data, and schema changes go in separate commits
- Use `git add -p` when a file has both approved and unapproved hunks
- Always show `git status` and `git diff --cached` before committing
- Do not commit unless the staged diff has been explicitly approved
- Batch multiple approved local changes before a single push to save Netlify build credits

## Content and data rules

- Do not use Moovit-derived walking distances or times as publishable data
- Do not copy or paraphrase text from external websites
- Do not work on station photos until explicitly approved

## Tools and architecture

- Python may be used only as a temporary local analysis tool (CSV, HTML, XML parsing in the terminal)
- Do not add Python to the production app, build pipeline, or any deployed files
- The site must remain React/Next.js based unless a change is explicitly approved
- Do not change project architecture without approval

## Communication

- If a task takes more than a few minutes, give a short progress update
- Always stop and ask if scope is unclear or a change touches something not explicitly approved
