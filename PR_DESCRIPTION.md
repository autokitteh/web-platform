# PR Description

## Description

Refactored iframe communication service to fix postMessage origin handling and improve reliability of communication between the web platform and the embedded chatbot iframe. This update centralizes origin determination logic, simplifies validation, and reduces unnecessary error logging for expected conditions.

## Achievements

- Centralized origin determination with new `getTargetOrigin()` method
- Fixed postMessage target origin across all communication points
- Simplified origin validation with explicit allowlist for cloud and local origins
- Enhanced origin parsing with HTTPS protocol support
- Improved connection state validation in message handling
- Removed dead code and unused message queue processing
- Changed 10 error logs to debug level for non-critical conditions
- Fixed typo in debug message ("ered message" → "Filtered message")
- Added new translation keys for error handling

## Very Short Summary

Fixed chatbot iframe postMessage origin handling by centralizing target origin logic, simplifying validation, and improving code quality with reduced error noise.

---

## Technical Details

### Files Changed
- `src/services/iframeComm.service.ts` (129 lines: +57, -78)
- `src/locales/en/services/translation.json` (6 lines: +2)

### Key Changes

#### Origin Handling
- New `getTargetOrigin()` method extracts origin from iframe src URL with fallback
- All `postMessage` calls now use consistent origin targeting
- Enhanced origin parsing with HTTPS protocol check

#### Code Quality
- Removed unused message queue processing from `setIframeRef()`
- Removed redundant iframe readiness checks
- Converted error logs to debug level for expected conditions

#### Translations
- Added `debug.iframeComm.errorParsingIframeOrigin`
- Added `errors.iframeComm.errorNavigatingToBilling`
