# Cookie Consent Testing Guide

## 🧪 Manual Testing Checklist

### First Visit Experience
- [ ] Banner appears at bottom of page
- [ ] All three buttons are visible with equal prominence
- [ ] "Accept All" and "Reject All" have same visual weight
- [ ] Banner text is clear and neutral (no dark patterns)
- [ ] Close button is accessible but not prominent

### Banner Interactions
- [ ] "Accept All" grants all purposes and hides banner
- [ ] "Reject All" denies non-essential purposes and hides banner
- [ ] "Customize" opens preferences modal
- [ ] Close button hides banner without saving consent
- [ ] Banner doesn't appear again after consent is given

### Preferences Modal
- [ ] Modal opens with all four purpose categories
- [ ] "Strictly Necessary" is always on and disabled
- [ ] Other toggles are interactive
- [ ] Purpose descriptions are informative
- [ ] Cookie details are expandable
- [ ] "Save Preferences" persists choices and closes modal
- [ ] "Cancel" closes without saving changes

### Consent Persistence
- [ ] Consent persists after page reload
- [ ] Consent persists in new tabs (same domain)
- [ ] Consent record includes timestamp and version
- [ ] Both cookie and localStorage are set

### Accessibility Testing
- [ ] Tab navigation works through all elements
- [ ] Focus is trapped within modal
- [ ] Screen reader announces all content correctly
- [ ] Escape key closes modal
- [ ] Color contrast meets WCAG AA standards
- [ ] All interactive elements have focus indicators

### Regional Compliance
- [ ] EEA/UK/CH regions show banner by default
- [ ] Non-EEA regions may default to granted (configurable)
- [ ] Regional detection works via timezone/language

### Google Consent Mode
- [ ] Console shows consent mode initialization
- [ ] Consent changes trigger gtag events
- [ ] Analytics scripts respect consent state

### Settings Link
- [ ] Cookie settings link is always available
- [ ] Link opens preferences modal
- [ ] Settings can be changed after initial consent
- [ ] Changes are persisted immediately

## 🔧 Testing Tools

### Debug Panel
The debug panel (development only) provides:
- Real-time consent state monitoring
- Quick action buttons for testing
- Purpose-level control toggles
- Storage inspection tools
- Region simulation

Access via the purple bug icon in the bottom-right corner.

### Browser DevTools

#### Console Commands
```javascript
// Check current consent state
console.log(JSON.parse(localStorage.getItem('ak-consent')));

// Listen for consent events
window.addEventListener('consent_updated', console.log);

// Check Google Consent Mode
console.log(window.dataLayer);
```

#### Application Tab
- Check cookies for `ak-consent`
- Check localStorage for `ak-consent`
- Clear storage to simulate first visit

### Network Tab
- Verify analytics requests only fire with consent
- Check for consent-related API calls
- Monitor third-party script loading

## 🌐 Cross-Browser Testing

Test in all major browsers:
- [ ] Chrome (desktop & mobile)
- [ ] Firefox (desktop & mobile)  
- [ ] Safari (desktop & mobile)
- [ ] Edge (desktop)

Pay special attention to:
- Cookie persistence differences
- LocalStorage availability
- Focus management variations
- Rendering differences

## 📱 Mobile Testing

Mobile-specific checks:
- [ ] Banner is properly sized on small screens
- [ ] Modal is scrollable and accessible
- [ ] Touch targets are appropriately sized (44px minimum)
- [ ] Text remains readable at default zoom levels

## 🔒 Security Testing

- [ ] No XSS vulnerabilities in user data
- [ ] Consent data is properly escaped
- [ ] Third-party scripts only load with consent
- [ ] Storage writes don't exceed quotas

## ⚡ Performance Testing

- [ ] Consent system loads without blocking page render
- [ ] Modal opens quickly (<100ms perceived)
- [ ] No memory leaks from event listeners
- [ ] Minimal impact on Lighthouse scores

## 🧩 Integration Testing

### Analytics Integration
```javascript
// Test that analytics respects consent
ga4.gtag('config', 'G-XXXXXXXXXX');
// Should only fire if analytics consent granted
```

### Custom Event Handling
```javascript
// Test custom consent event handling
window.addEventListener('consent_updated', (e) => {
  if (e.detail.purposes.marketing === 'granted') {
    // Should initialize marketing tools
  }
});
```

## 🚨 Error Scenarios

Test error handling for:
- [ ] Disabled cookies/localStorage
- [ ] Network failures during consent save
- [ ] Corrupted consent data
- [ ] Unsupported browser features
- [ ] Very long consent descriptions (UI overflow)

## 📊 Compliance Testing

### GDPR Compliance
- [ ] Consent is freely given (no forced acceptance)
- [ ] Consent is specific (granular purposes)  
- [ ] Consent is informed (clear descriptions)
- [ ] Consent is unambiguous (explicit action required)
- [ ] Consent is revocable (settings always available)

### Google EU User Consent Policy
- [ ] Consent obtained before personalized ads
- [ ] Consent records maintained with required fields
- [ ] Clear instructions for withdrawing consent

## 🔄 Automated Testing

Run the full test suite:

```bash
# Unit tests
npm run test -- --testPathPattern=consent

# E2E tests  
npm run test:e2e -- e2e/consent/

# Accessibility tests
npm run test:a11y

# Visual regression tests (if available)
npm run test:visual -- consent
```

## 📋 Test Data

### Test Consent Records

Valid consent record format:
```json
{
  "version": "1.0.0",
  "bannerVersion": "1.0.0", 
  "timestamp": 1640995200000,
  "language": "en",
  "region": "DE",
  "purposes": {
    "strictly-necessary": "granted",
    "functional": "granted", 
    "analytics": "denied",
    "marketing": "denied"
  }
}
```

### Test Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| First visit from Germany | Show banner, default all to denied except strictly necessary |
| First visit from US | May default to granted based on configuration |
| Return visit with valid consent | No banner, respect saved preferences |
| Return visit with expired consent | Show banner, clear old consent |
| Return visit with corrupted data | Show banner, treat as first visit |

## 🎯 Acceptance Criteria

The consent system is ready for production when:

- [ ] All manual testing items pass
- [ ] E2E tests pass in all target browsers  
- [ ] Accessibility audit shows no violations
- [ ] Performance impact is minimal
- [ ] Integration with existing analytics works
- [ ] Legal review confirms GDPR compliance
- [ ] Documentation is complete and accurate

## 🔍 Troubleshooting

Common issues and solutions:

**Banner not showing:**
- Check ConsentProvider is wrapping the app
- Verify regional detection logic  
- Clear localStorage and cookies

**Consent not persisting:**
- Check browser settings allow cookies
- Verify domain/path configuration
- Check for JavaScript errors

**Modal accessibility issues:**
- Test with screen reader
- Verify focus trap implementation
- Check ARIA attributes

**Integration problems:**
- Verify event listeners are attached
- Check Google Consent Mode setup
- Review purpose mapping configuration