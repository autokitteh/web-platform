# GDPR Cookie Consent Management System

## Overview

AutoKitteh's web platform implements a comprehensive, GDPR-compliant cookie consent management system that ensures valid, granular, and revocable consent before any non-essential storage or tracking occurs.

## 🔑 Key Features

### Legal Compliance
- ✅ **GDPR Article 7** - Valid consent requirements
- ✅ **EU User Consent Policy** - Google compliance
- ✅ **ePrivacy Directive** - Cookie regulations
- ✅ **Regional Detection** - EEA/UK/CH explicit consent
- ✅ **Audit Trail** - Versioned consent records

### User Experience
- ✅ **Equal Prominence** - Accept/Reject buttons with same visual weight  
- ✅ **No Dark Patterns** - Clear, neutral language and design
- ✅ **Granular Control** - Per-purpose consent management
- ✅ **Always Available** - Revocable consent via settings link
- ✅ **WCAG 2.1 AA** - Full accessibility compliance

### Technical Integration
- ✅ **Google Consent Mode v2** - Analytics and advertising consent
- ✅ **Storage Redundancy** - Cookie + localStorage persistence
- ✅ **Event System** - Custom events for tag management
- ✅ **TypeScript** - Full type safety throughout
- ✅ **i18n Ready** - Multi-language support

## 🏗️ Architecture

### Core Components

```
src/
├── contexts/consent/
│   ├── consentProvider.tsx     # Main consent context and state
│   └── useConsent.ts          # Hook for consuming consent state
├── components/organisms/consent/
│   ├── cookieBanner.tsx       # First layer: Accept/Reject/Customize
│   ├── preferencesModal.tsx   # Second layer: Detailed settings
│   └── consentManager.tsx     # Orchestrates banner + modal
├── services/consent/
│   ├── consentStorage.service.ts      # Persistence layer
│   ├── googleConsentMode.service.ts   # Google Consent Mode integration
│   └── regionDetection.service.ts     # Geo-location detection
├── constants/consent.constants.ts     # Configuration and definitions
└── types/consent.type.ts             # TypeScript definitions
```

### Data Flow

1. **Initialization** → Region detection → Load existing consent → Show UI if needed
2. **User Action** → Update consent state → Persist record → Update integrations → Emit events
3. **Integration** → Listen for events → Update tracking/analytics accordingly

## 🚀 Quick Start

### 1. Integration is Already Complete

The consent system is already integrated into the main app via:

```typescript
// src/mainApp.tsx
<ConsentProvider>
  <AppProvider>
    <ConsentManager />
    {/* Your app components */}
  </AppProvider>
</ConsentProvider>
```

### 2. Add Cookie Settings Link

Add the settings link to your footer or settings page:

```typescript
import { ConsentSettingsLink } from "@components/atoms";

// In your footer/settings component
<ConsentSettingsLink variant="button" showIcon />
```

### 3. Listen for Consent Events

Listen for consent changes to gate your tracking:

```typescript
// Analytics integration example
useEffect(() => {
  const handleConsentUpdate = (event: CustomEvent) => {
    const { purposes } = event.detail;
    
    if (purposes.analytics === 'granted') {
      // Initialize analytics
      gtag('config', 'GA_MEASUREMENT_ID');
    } else {
      // Disable analytics
    }
  };

  window.addEventListener('consent_updated', handleConsentUpdate);
  window.addEventListener('consent_loaded', handleConsentUpdate);

  return () => {
    window.removeEventListener('consent_updated', handleConsentUpdate);
    window.removeEventListener('consent_loaded', handleConsentUpdate);
  };
}, []);
```

## 🎛️ Configuration

### Purpose Definitions

Edit `src/constants/consent.constants.ts` to customize consent purposes:

```typescript
export const CONSENT_PURPOSE_DEFINITIONS: ConsentPurposeDefinition[] = [
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Help us understand how visitors interact with our website.',
    required: false,
    retention: 'Up to 26 months',
    examples: [
      'Website usage statistics',
      'User journey analysis',
      'Performance metrics'
    ],
    cookies: [
      {
        name: '_ga, _ga_*',
        purpose: 'Google Analytics tracking',
        provider: 'Google',
        duration: '2 years',
        type: 'third-party'
      }
    ]
  }
  // Add your custom purposes here
];
```

### Regional Profiles

Customize consent requirements by region:

```typescript
export const CUSTOM_REGION_PROFILE: RegionalProfile = {
  countries: ['US', 'CA'],
  requiresExplicitConsent: false, // Opt-out model
  defaultConsentStates: {
    'strictly-necessary': 'granted',
    'functional': 'granted',
    'analytics': 'granted',
    'marketing': 'denied'
  }
};
```

## 🔌 API Reference

### useConsent Hook

```typescript
const {
  // State
  isLoaded,           // boolean - System initialized
  hasConsent,         // boolean - User has provided consent
  consentRecord,      // ConsentRecord | null - Full consent record
  purposes,           // ConsentStates - Current consent states
  showBanner,         // boolean - Banner visibility
  showPreferences,    // boolean - Modal visibility
  
  // Actions
  acceptAll,          // () => void - Grant all purposes
  rejectAll,          // () => void - Deny non-essential purposes
  updatePurposes,     // (purposes: Partial<ConsentStates>) => void
  openPreferences,    // () => void - Show preferences modal
  closePreferences,   // () => void - Hide preferences modal
  resetConsent        // () => void - Clear all consent (dev only)
} = useConsent();
```

### Consent Events

The system emits custom events for integration:

```typescript
// Event types
type ConsentEvent = 'consent_loaded' | 'consent_updated';

// Event detail structure
interface ConsentEventDetail {
  version: string;
  timestamp: number;
  language: string;
  region?: string;
  purposes: ConsentStates;
  bannerVersion: string;
}

// Usage
window.addEventListener('consent_updated', (event: CustomEvent<ConsentEventDetail>) => {
  console.log('Consent updated:', event.detail);
});
```

## 🧪 Testing

### Unit Tests

```bash
npm run test -- consent
```

### E2E Tests

```bash
npm run test:e2e -- e2e/consent/
```

### Storybook

```bash
npm run storybook
# Navigate to Organisms/Consent
```

## 🌍 Localization

### Adding New Languages

1. Create new locale file:
```
src/locales/[lang]/consent.json
```

2. Follow the same structure as `src/locales/en/consent.json`

3. Update the locale index:
```typescript
// src/locales/[lang]/index.ts
import consent from "./consent.json";

export default {
  // ... other translations
  consent
};
```

### Translation Keys

| Key | Purpose | Example |
|-----|---------|---------|
| `banner.title` | Main banner heading | "We value your privacy" |
| `banner.acceptAll` | Accept button text | "Accept All" |
| `preferences.title` | Modal heading | "Cookie Preferences" |
| `settings.cookieSettings` | Settings link text | "Cookie Settings" |

## 🔧 Advanced Configuration

### Google Consent Mode Mapping

The system automatically maps consent purposes to Google Consent Mode parameters:

```typescript
const GOOGLE_CONSENT_MODE_MAPPING = {
  'analytics': 'analytics_storage',
  'marketing': 'ad_storage', 
  'functional': 'functionality_storage',
  'strictly-necessary': 'security_storage'
};
```

### Custom Storage Backend

Replace the default storage service:

```typescript
import { ConsentStorageService } from '@services/consent';

class CustomConsentStorage extends ConsentStorageService {
  static save(record: ConsentRecord): void {
    // Your custom persistence logic
    super.save(record);
  }
}
```

### Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_CONSENT_DEBUG` | Enable debug logging | `false` |
| `VITE_CONSENT_FORCE_BANNER` | Always show banner | `false` |
| `VITE_CONSENT_DURATION_MONTHS` | Consent validity period | `12` |

## 📋 Compliance Checklist

### GDPR Requirements
- [x] Consent is freely given (no forced consent)
- [x] Consent is specific (granular purposes)
- [x] Consent is informed (clear descriptions)
- [x] Consent is unambiguous (explicit action required)
- [x] Consent is revocable (always-available settings)
- [x] Consent records are maintained (audit trail)

### Google EU User Consent Policy
- [x] Obtain consent for cookies where legally required
- [x] Obtain consent for ads personalization
- [x] Retain consent records
- [x] Provide clear revocation instructions

### Accessibility (WCAG 2.1 AA)
- [x] Keyboard navigation support
- [x] Screen reader compatibility
- [x] Focus management and trapping
- [x] Adequate color contrast
- [x] Semantic HTML and ARIA labels

## 🐛 Troubleshooting

### Common Issues

**Banner doesn't appear:**
- Check that `ConsentProvider` wraps your app
- Verify regional detection is working
- Check browser console for errors

**Consent not persisting:**
- Ensure cookies are enabled
- Check localStorage availability
- Verify domain configuration

**Google Consent Mode not updating:**
- Confirm gtag is loaded before consent system
- Check console for consent mode events
- Verify mapping configuration

### Debug Mode

Enable debug logging:

```typescript
// In your console or initialization code
localStorage.setItem('consent_debug', 'true');
```

This will log:
- Regional detection results
- Consent state changes
- Storage operations
- Google Consent Mode updates

## 🔄 Migration Guide

### From Other Consent Solutions

If migrating from another consent management system:

1. **Preserve Existing Consent**: The system can import existing consent records if formatted correctly
2. **Update Event Listeners**: Replace existing consent event handlers with the new event system
3. **Remap Purposes**: Map your existing consent categories to our purpose definitions
4. **Test Integration**: Verify all tracking and analytics integrations work correctly

### Version Updates

When updating the consent system:

1. **Check Breaking Changes**: Review changelog for breaking changes
2. **Update Purpose Definitions**: Add new purposes or modify existing ones
3. **Migrate Consent Records**: Old consent will expire and require re-consent
4. **Test Thoroughly**: Run full E2E test suite

## 📞 Support

For issues or questions:

1. **Documentation**: Check this guide first
2. **Storybook**: View component examples and states
3. **Tests**: Run E2E tests for expected behavior
4. **Issues**: Create GitHub issue with reproduction steps

## 📚 References

- [GDPR Article 7 - Conditions for consent](https://gdpr-info.eu/art-7-gdpr/)
- [Google Consent Mode v2](https://developers.google.com/tag-platform/security/guides/consent)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ePrivacy Directive](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32002L0058)