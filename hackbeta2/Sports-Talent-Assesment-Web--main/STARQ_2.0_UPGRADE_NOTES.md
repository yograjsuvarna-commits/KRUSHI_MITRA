# STARQ 2.0 Upgrade Notes

This version keeps the existing STARQ feature set and backend architecture intact.

## Improvements made

- Added smooth page transitions with Framer Motion.
- Added automatic page titles for every major screen.
- Added automatic scroll-to-top when navigating between screens.
- Added a responsive mobile navigation drawer instead of hiding the entire navigation on small screens.
- Added keyboard-focus states and accessible navigation semantics.
- Added reduced-motion support for accessibility.
- Added a more polished global sports-tech background treatment.
- Preserved the existing demo switcher, assessment wizard, CV lab, statistics, physical metrics, report, scout hub, comparison, profile, login, and registration flows.
- Fixed Scout Hub -> Athlete Report navigation so the selected athlete ID is actually passed into the report.
- Activated the existing Report comparison callback by adding a Compare action beside Print/Save PDF.
- Kept the existing API, database, CV service, and feature components unchanged unless required for the navigation/report fixes.

## Validation

A dependency installation/build was attempted. The environment could not complete dependency installation cleanly; the available partial dependency tree then reported missing `vite/client` and `node` type definitions. Those errors are dependency-environment errors rather than TypeScript errors identified in the modified files.

Run the normal project setup from the README before judging:
1. `cd client && npm install && npm run build`
2. Start the server and CV service as described in the original README.
