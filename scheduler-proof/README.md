# Scheduled Execution Proof

Task 4.2 proof is produced by the workflow at:

- `.github/workflows/scheduled-playwright.yml`

For each scheduled or manual run (`workflow_dispatch`), the workflow uploads:

1. `playwright-report` artifact (full execution report)
2. `scheduler-proof` artifact containing `scheduler-proof.json` with:
   - UTC timestamp
   - workflow/event type
   - run ID and run number
   - commit SHA

## How to verify proof

1. Open GitHub Actions for this repository.
2. Open a run of **Scheduled Playwright Suite**.
3. Download `scheduler-proof` artifact.
4. Confirm fields in `scheduler-proof.json` match run metadata.
