# QA & UX Report – Scorer App v2.0

## ✅ Functional QA Summary
| Area | Findings | Severity |
|------|----------|----------|
| **Navigation** | All screens reachable via Tab navigator; back‑stack works correctly. | ✅ |
| **Data Loading** | API calls succeed but lack graceful fallback when backend is unreachable – spinner persists. | ⚠️ |
| **Scoring Dashboard** | • Ball‑dot tracker reflects deliveries accurately.<br>• Over‑complete banner forces bowler change.<br>• `undoLastDelivery` works; ensure it uses real `inningsId` (fixed in recent commit). | ✅ |
| **Modals** | Wicket and Bowler‑change modals open correctly and return data. Minor UI jitter on iOS due to bottom‑sheet animation timing. | ⚠️ |
| **Forms (Create Tournament/Team/Match)** | Validation works; error messages are generic. Missing inline field‑level hints. | ⚠️ |
| **Innings Break & Match Summary** | Displays full scorecards; navigation auto‑triggers correctly. Winner calculation works for runs‑based matches but not for limited‑overs tie‑breakers. | ⚠️ |
| **Performance** | Initial load < 2 s on dev machine. No memory leaks observed. | ✅ |
| **Accessibility** | Basic contrast OK, but missing `accessibilityLabel` on touchable elements and no screen‑reader testing. | ❌ |

## 🎨 UX Review
- **Design Consistency**: Uses a cohesive blue‑gray palette, but some screens (Create Team) still show default white backgrounds that clash with the dark header.
- **Micro‑animations**: Buttons have subtle scaling, but modal slide‑up animation is abrupt; consider adding easing.
- **Feedback**: Success toasts appear after creating entities, but error toasts are missing for network failures.
- **Touch Targets**: FABs are 56 px (good), but list items have only 44 px height – may be hard for larger fingers.
- **Typography**: Uses system default fonts; adopting Google Font *Inter* would improve visual premium feel.
- **Dark Mode**: Not yet supported – all screens assume light background.

## 🚀 Suggested Future Implementations
1. **Robust Error Handling**
   - Centralised API interceptor that shows a toast on network errors.
   - Fallback UI (e.g., "Retry" button) when data fails to load.
2. **Accessibility Enhancements**
   - Add `accessibilityLabel` and `accessibilityRole` to all touchables.
   - Ensure color contrast ≥ 4.5:1 (use WCAG checker).
   - Provide screen‑reader announcements for modal openings.
3. **Dark‑Mode Support**
   - Introduce a theme context with light/dark palettes.
   - Switch automatically based on device setting.
4. **Improved Form UX**
   - Inline validation messages (e.g., "Name is required").
   - Date picker component with clear format.
   - Disable submit button until form is valid.
5. **Tie‑Breaker Logic**
   - Implement Super Over or Duckworth‑Lewis method for tied limited‑overs matches.
6. **Analytics & Logging**
   - Capture screen view events and key actions (create tournament, wicket) for product insights.
7. **Performance Optimisation**
   - Lazy‑load screens with `React.lazy`/`Suspense`.
   - Cache static assets (team logos) using `expo‑asset`.
8. **UI Polish**
   - Adopt Google Font *Inter* across the app.
   - Add subtle hover/press animations using `react-native-reanimated`.
   - Refine modal slide‑up animation with easing (`Easing.out(Easing.cubic)`).
9. **Testing Suite**
   - Add Jest + React Native Testing Library unit tests for context and screens.
   - End‑to‑end tests with Detox covering full match flow.
10. **Internationalisation (i18n)**
    - Prepare string resources for multiple languages using `i18next`.

---

*Prepared by QA & UX lead on 2026‑03‑11.*