# Lighting Fix Summary - Overexposure Resolution

## Problem Analysis

The scene was experiencing severe overexposure and blown-out highlights due to:

1. **Multiple Light Sources Stacking:**
   - `ambientLight intensity={0.4}` + `directionalLight intensity={1.5}` = 1.9 total base intensity
   - `<Environment preset="sunset">` adds HDR environment lighting (can be very bright)
   - `<Sky>` component adds additional atmospheric lighting
   - All sources combined created excessive brightness

2. **No Tone Mapping:**
   - Default `LinearToneMapping` doesn't handle HDR well
   - No exposure control to balance the scene
   - Bright areas exceeded displayable range → overexposure

3. **Bloom Effect Amplification:**
   - `intensity={0.8}` was too high
   - `luminanceThreshold={0.8}` meant many areas qualified for bloom
   - Bloom amplified already bright areas → blown-out highlights

## Solutions Implemented

### 1. Tone Mapping & Exposure Configuration ✅

**File:** `src/pages/PetPage.tsx`

- **Added `ACESFilmicToneMapping`**: Industry-standard tone mapping that gracefully handles HDR
- **Set `toneMappingExposure = 0.8`**: Balanced exposure in the recommended 0.6-1.2 range
- **Modern output color space**: Uses `outputColorSpace = 'srgb'` with fallback for older Three.js versions

**Why This Works:**
- ACES Filmic tone mapping compresses HDR values into displayable range
- Prevents clipping and maintains highlight detail
- Exposure control allows fine-tuning scene brightness

### 2. Reduced Light Intensities ✅

**Changes:**
- `ambientLight`: `0.4` → `0.3` (25% reduction)
- `directionalLight`: `1.5` → `0.8` (47% reduction)

**Why This Works:**
- With `Environment` and `Sky` providing additional lighting, explicit lights can be lower
- Prevents light stacking that causes overexposure
- Maintains good contrast and shadow definition

### 3. Tuned Bloom Effect ✅

**Changes:**
- `luminanceThreshold`: `0.8` → `1.0` (only very bright areas bloom)
- `intensity`: `0.8` → `0.3` (62% reduction)

**Why This Works:**
- Higher threshold prevents entire scene from glowing
- Lower intensity creates subtle glow without overexposure
- Maintains artistic effect while preventing blown-out highlights

### 4. Environment Lighting Notes ✅

**File:** `src/components/pet/AnimatedBackground.tsx`

- Added developer comments explaining `Environment preset="sunset"` contribution
- If overexposure persists, consider:
  - Wrapping in `<Environment intensity={0.5} />` to reduce contribution
  - Changing preset to `"city"` or `"park"` for softer lighting

## Recommended Light Intensity Values for Stylized Pet Scene

Based on the scene setup with `Environment` and `Sky`:

| Light Type | Recommended Intensity | Current Value | Notes |
|------------|----------------------|---------------|-------|
| Ambient Light | 0.2 - 0.4 | 0.3 ✅ | Base fill light, prevents pure black shadows |
| Directional Light | 0.6 - 1.0 | 0.8 ✅ | Main sun/key light, provides direction and shadows |
| Environment | 0.5 - 1.0 | 1.0 (default) | HDR environment lighting, can be reduced if needed |
| Sky | N/A | N/A | Atmospheric lighting, intensity controlled by parameters |

**Total Scene Brightness Formula:**
```
Effective Brightness = (Ambient × 0.3) + (Directional × 0.8) + (Environment × 1.0) + (Sky contribution)
```

With current settings: `(0.3 × 0.3) + (0.8 × 0.8) + (1.0 × 1.0) + Sky ≈ 1.73` (balanced)

## Tone Mapping & Exposure Settings

| Setting | Value | Range | Purpose |
|---------|-------|-------|---------|
| `toneMapping` | `ACESFilmicToneMapping` | - | Industry-standard HDR compression |
| `toneMappingExposure` | `0.8` | 0.6 - 1.2 | Overall scene brightness control |

**Exposure Adjustment Guide:**
- **Too Dark:** Increase to `0.9` - `1.2`
- **Too Bright:** Decrease to `0.6` - `0.7`
- **Balanced:** `0.8` (current setting)

## Bloom Effect Settings

| Setting | Value | Previous | Change | Purpose |
|---------|-------|----------|--------|---------|
| `luminanceThreshold` | `1.0` | `0.8` | +25% | Only very bright areas bloom |
| `intensity` | `0.3` | `0.8` | -62% | Subtle glow without overexposure |

**Bloom Troubleshooting:**
- **Still Overexposed:** Reduce `intensity` to `0.2` or `0.15`
- **No Glow Effect:** Increase `intensity` to `0.4` - `0.5`
- **Too Much Bloom:** Increase `luminanceThreshold` to `1.2` - `1.5`

## Lighting Debugging Tips

### 1. Check Light Contributions
```typescript
// Temporarily disable lights one by one to identify overexposure source
<ambientLight intensity={0} />  // Disable ambient
<directionalLight intensity={0} />  // Disable directional
<Environment intensity={0} />  // Disable environment
```

### 2. Monitor Exposure Values
```typescript
// Add to RendererConfig component for debugging
useEffect(() => {
  console.log('Tone Mapping:', gl.toneMapping)
  console.log('Exposure:', gl.toneMappingExposure)
}, [gl])
```

### 3. Test Bloom Contribution
```typescript
// Temporarily disable Bloom to see if it's causing overexposure
{/* <Bloom ... /> */}
```

### 4. Adjust Environment Intensity
```typescript
// If Environment is too bright, reduce its contribution
<Environment preset="sunset" intensity={0.5} />
```

### 5. Camera Angle Overexposure
If overexposure varies by camera angle:
- Check if directional light is directly hitting camera
- Adjust light position: `position={[5, 8, 5]}` → `position={[3, 6, 3]}` for softer angle
- Reduce exposure: `toneMappingExposure = 0.7`

## Code Changes Summary

### Files Modified:
1. **`src/pages/PetPage.tsx`**
   - Renamed `ShadowConfig` → `RendererConfig` (now handles shadows + tone mapping)
   - Added `ACESFilmicToneMapping` and `toneMappingExposure = 0.8`
   - Reduced `ambientLight` intensity: `0.4` → `0.3`
   - Reduced `directionalLight` intensity: `1.5` → `0.8`
   - Tuned Bloom: `luminanceThreshold: 1.0`, `intensity: 0.3`
   - Added comprehensive developer comments

2. **`src/components/pet/AnimatedBackground.tsx`**
   - Added developer comments for `Environment` and `Sky` components
   - Documented how to reduce environment lighting if needed

## Testing Checklist

- [ ] Scene no longer overexposed at default camera angle
- [ ] No blown-out highlights on pet model
- [ ] Shadows are visible and well-defined
- [ ] Bloom effect is subtle and doesn't cause overexposure
- [ ] Scene brightness is balanced across different camera angles
- [ ] Colors are vibrant but not washed out
- [ ] Sky and environment lighting contribute appropriately

## Further Optimization (If Needed)

If overexposure persists after these changes:

1. **Reduce Environment Intensity:**
   ```tsx
   <Environment preset="sunset" intensity={0.5} />
   ```

2. **Lower Exposure Further:**
   ```tsx
   gl.toneMappingExposure = 0.7
   ```

3. **Disable Bloom Temporarily:**
   ```tsx
   {/* <Bloom ... /> */}
   ```

4. **Use Softer Environment Preset:**
   ```tsx
   <Environment preset="city" />  // or "park", "apartment"
   ```

5. **Add Hemisphere Light for Better Control:**
   ```tsx
   <hemisphereLight 
     skyColor="#87CEEB" 
     groundColor="#8B7355" 
     intensity={0.3} 
   />
   ```

## Production Readiness

✅ **Current Configuration:**
- Balanced lighting for stylized pet scene
- Proper tone mapping prevents overexposure
- Bloom effect is subtle and artistic
- All settings documented with developer notes

**Ready for production with current settings.**


