# BodyForge AI — Current State

## What is Working

- Expo Router app builds successfully (web + routes working)
- TypeScript passes (no compile errors)
- Routing structure in place:
  - /dashboard
  - /workout
  - /exercise
- Dashboard → Workout → Exercise flow is wired
- Exercise screen receives exerciseId and resolves correct exercise name

## Avatar System (IMPORTANT)

- Using PNG layering system (NOT SVG)
- Base layer:
  - assets/avatar/base-body.png
- Overlay layer:
  - assets/avatar/chest.png
- Pattern:
  - Two Image components
  - position: 'absolute'
  - same size
  - stacked

## Screens Using Avatar

- app/(tabs)/index.tsx
  - Demo / hidden tab
  - Working correctly

- app/exercise.tsx
  - Uses same layering system
  - Displays exercise name dynamically
  - Fallback handled safely

## Data Layer

- constants/trainingData.ts
  - getExerciseById used
  - Navigation passes exerciseId correctly

## Known Limitations (EXPECTED)

- Only chest overlay exists
- No leg, arm, or back overlays yet
- Avatar is currently a proof-of-system, not final

## Do NOT Do (Critical Rules)

- Do NOT use SVG avatar system
- Do NOT introduce new asset filenames unless confirmed
- Do NOT refactor multiple files at once
- Do NOT break working avatar layering

## Next Logical Step

- Introduce a SECOND overlay (example: legs)
- Or build a mapping system:
  exercise → muscle group → overlay image