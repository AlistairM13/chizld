# External Integrations

**Analysis Date:** 2026-03-08

## APIs & External Services

**Fitness/Health APIs:**
- None currently integrated (personal-use app, no external fitness platform sync)
- Future: No plans for sync with MyFitnessPal, Strava, Apple Health, or Google Fit

**Third-Party AI/ML Services:**
- None integrated (no Claude API, no nutrition AI, no form analysis)
- Manual entry only for all data modules

**Social Features:**
- None (personal-use app, no cloud sync, no sharing)

## Data Storage

**Databases:**
- SQLite (expo-sqlite 55.0.10)
  - Connection: Managed by Expo framework, device-local storage
  - Client: `expo-sqlite` native module
  - Location: Device app cache/documents directory (managed by OS)
  - Schema: 11 tables (exercises, workout_sessions, workout_sets, progress_photos, meals, diet_targets, sleep_logs, sunlight_sessions, zone_stats, xp_history, sleep_reminders)
  - Approach: Synchronous initialization on first app launch
  - Migration path: Version-based schema updates via SQL ALTER TABLE

**Key-Value Store:**
- MMKV (react-native-mmkv 4.2.0)
  - Purpose: Fast app preferences and transient user settings
  - Storage: Binary format, memory-mapped file on device
  - Keys: onboarding_complete, character_preset, current_photo_path, diet_targets, sleep_schedule, tempo_defaults, rest_timer_default

**File Storage:**
- Local filesystem (expo-file-system 55.0.10)
  - Purpose: Progress photos for zone history
  - Path: Device app documents directory (e.g., `/data/user/0/com.thealister.chizldapp/files/progress-photos/`)
  - Format: JPEG images captured via `expo-camera` or imported via `expo-image-picker`
  - Backup: Not synced (device-only)

**Image Storage:**
- In-memory via React Native Image component (expo-image 55.0.6)
- Cached by OS file system
- No cloud storage

**Caching:**
- React Native built-in memory cache for images
- MMKV for preferences cache
- SQLite query results cached in application memory during session

## Authentication & Identity

**Auth Provider:**
- None (personal-use, single-user app)
- No login, no accounts, no API authentication
- No OAuth, no third-party identity

**Permissions Required (Android):**
- `android.permission.CAMERA` - Photo capture for progress photos
- `android.permission.READ_EXTERNAL_STORAGE` - Image picker access
- `android.permission.INTERNET` - Expo dev client communication (dev-only)
- `android.permission.POST_NOTIFICATIONS` - Push notifications for rest timer and sleep reminders (requires Android 13+)
- `android.permission.VIBRATE` - Haptics feedback via expo-haptics
- Configured in `app.json` via Expo plugins

## Monitoring & Observability

**Error Tracking:**
- None (personal-use app, no remote error reporting)
- Console logging only during development

**Logs:**
- React Native console.log output to dev client during development
- No persistent logging to device storage
- No crash reporting service

**Analytics:**
- None (no user tracking, no telemetry)

## CI/CD & Deployment

**Hosting:**
- Expo Go (for rapid local development and testing)
- EAS Build (Expo Application Services) - optional for production APK builds
- Google Play Store - targeted distribution channel

**Build Process:**
- Expo development build via `expo run:android`
- Production build via EAS Build with custom client (`expo-dev-client`)
- APK generation for Android 12+ devices

**CI Pipeline:**
- Not currently configured (manual builds only)
- No GitHub Actions, GitLab CI, or Bitbucket Pipelines

## Environment Configuration

**Required env vars:**
- None currently in use (personal-use app)
- All configuration stored in code or MMKV at runtime

**Secrets location:**
- No secrets stored (no API keys, no credentials)
- .env files not needed
- .gitignore already excludes: *.jks, *.p8, *.p12, *.key, *.mobileprovision (signing files)

**Build Configuration:**
- Package name: `com.thealister.chizldapp` (hardcoded in app.json)
- Orientation: Landscape (locked via expo-screen-orientation on startup)
- Version: 1.0.0 (managed in app.json and package.json)

## Webhooks & Callbacks

**Incoming Webhooks:**
- None (personal-use app)

**Outgoing Webhooks:**
- None (no external services to notify)

**Local Notifications:**
- expo-notifications 55.0.11 configured for local push notifications
- Triggers:
  1. Rest timer completion during workouts
  2. Sleep reminders (wind-down, bedtime, caffeine cutoff, last meal)
  3. Level-up celebrations
  4. Streak milestones
- Not cloud-based; triggered locally on device

## Device Features & Sensors

**Camera:**
- expo-camera 55.0.9
- Purpose: Capture progress photos for zone history
- Permissions: CAMERA, READ_EXTERNAL_STORAGE
- Usage: WorkoutSessionScreen (post-session), CharacterScreen (optional)

**Audio/Microphone:**
- expo-speech 55.0.8
- Purpose: Text-to-speech voice countdown for tempo-based workouts
- No microphone input (TTS output only)
- Audio session: Configured for playback mode (expo-av)
- Usage: TempoScreen during active workout

**Vibration/Haptics:**
- expo-haptics 55.0.8
- Purpose: Feedback for set completion, rest timer end, level-up
- Patterns: Light, medium, heavy vibration options

**Image Picker:**
- expo-image-picker 55.0.11
- Purpose: Select progress photos from device gallery
- Permissions: READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE (if available)

**File System:**
- expo-file-system 55.0.10
- Purpose: Store and retrieve progress photos locally
- Methods: Async file read/write/delete operations

**Deep Linking:**
- expo-linking 55.0.7
- Purpose: Future URL scheme support (e.g., `chizldapp://workout/biceps`)
- Configured in app.json as `"scheme": "chizldapp"`

## Expo Services

**Managed Services:**
- Expo Router 55.0.4 - File-based routing (configured)
- expo-dev-client 55.0.11 - Custom development client for testing
- Splash Screen - Configured via expo-splash-screen plugin
- Font Loading - Managed by expo-font plugin

**Not Used:**
- Expo Updates (no over-the-air updates)
- Expo Push Notifications (cloud service) - Using local notifications only
- Expo EAS Submit (not integrating with Play Store yet)

## Third-Party Fonts (Google Fonts)

**Chakra Petch:**
- Provider: @expo-google-fonts/chakra-petch 0.4.1
- License: Open Font License
- Use: Titles, branding, zone names in stat cards
- Styles: Bold variant
- Sizes: 24-32px

**Barlow Condensed:**
- Provider: @expo-google-fonts/barlow-condensed 0.4.1
- License: Open Font License
- Use: Zone labels, stat labels, captions
- Styles: Medium, SemiBold variants
- Sizes: 11-24px

**JetBrains Mono:**
- Provider: @expo-google-fonts/jetbrains-mono 0.4.1
- License: OFL 1.1
- Use: Stat values, level numbers, system/flavor text
- Styles: Regular, Bold variants
- Sizes: 9-28px

## Data Synchronization

**Cloud Sync:**
- None (personal-use app)
- All data remains device-local

**Export:**
- No built-in export functionality (future feature)
- SQLite database accessible via file system on Android

**Backup:**
- Relies on Android device backup (if enabled by user)
- No automatic cloud backup

## Security Considerations

**Data Encryption:**
- SQLite database stored unencrypted on device
- MMKV key-value store unencrypted on device
- Progress photos stored as plain JPEG files

**Network Security:**
- App makes no HTTP/HTTPS calls (no external APIs)
- No TLS/SSL certificates needed
- Development client uses standard Expo secure connection

**Permissions Model:**
- Requests minimum necessary permissions for each feature
- Camera: Optional (photos are optional feature)
- Storage: Required for photo picker and file storage
- Notifications: Required for sleep/rest reminders

---

*Integration audit: 2026-03-08*
