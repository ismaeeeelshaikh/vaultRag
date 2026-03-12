# 🚀 Landing Page Animation Specification (Pinterest Inspired)

ही फाईल Pinterest वरील मॉडर्न अ‍ॅनिमेशन लूक रिप्लिकेट करण्यासाठी बनवली आहे.

---

## 🎨 1. Color Palette & Theme
या थीममध्ये डार्क मोड आणि निऑन ग्रेडियंटचा वापर केला आहे:

- **Background:** `#050505` (Deep Charcoal Black)
- **Primary Accent:** `#8B5CF6` (Vibrant Violet/Purple)
- **Secondary Accent:** `#06B6D4` (Neon Cyan/Blue)
- **Text (Primary):** `#FFFFFF` (Pure White)
- **Text (Secondary/Muted):** `#94A3B8` (Slate Gray - उप-माहितीसाठी)
- **Main Gradient:** `linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)`

---

## 🖋️ 2. Typography & Styling
- **Font Family:** 'Inter' किंवा 'Plus Jakarta Sans' (Modern Sans-serif).
- **Main Headline (H1):** - Size: 72px (Desktop), 40px (Mobile).
  - Weight: Extra Bold (800).
  - Letter Spacing: -0.04em (अक्षरे थोडी जवळ असावीत).
- **Sub-heading:** - Size: 18px.
  - Color: Slate Gray (#94A3B8).
  - Line Height: 1.6 (वाचण्यासाठी सुटसुटीत).

---

## ✨ 3. Animation Sequence (The "Full" Flow)

### A. Entrance (The Reveal)
- **Effect:** मजकूर खालून वर सरकताना (Slide up) अंधारातून बाहेर आल्यासारखा (Fade-in) दिसावा.
- **Duration:** 0.8s
- **Ease:** `[0.16, 1, 0.3, 1]` (Cubic Bezier - प्रीमियम स्मूथ इफेक्टसाठी).
- **Delay:** Headline (0ms) -> Sub-text (200ms) -> CTA Button (400ms).

### B. Background Elements (Floating Blobs)
- **Visual:** बॅकग्राउंडमध्ये दोन मोठे 'Blurred Circles' (एक जांभळा आणि एक निळा).
- **Animation:** हे दोन्ही आकार खूप हळूवारपणे (Slow motion) कोपऱ्यांमध्ये तरंगत असावेत (Floating animation).
- **CSS Tip:** `filter: blur(80px); opacity: 0.4;`

### C. Button Styling & Interaction
- **Shape:** Full Rounded (`border-radius: 9999px`).
- **Background:** Gradient सह एक हलका 'Outer Glow'.
- **Hover Effect:** माऊस नेल्यावर `scale(1.05)` व्हावे आणि ग्लोचा प्रभाव वाढावा.
- **Active Effect:** क्लिक करताना `scale(0.98)` व्हावे.

### D. Text Shine Effect
- **Logic:** जो मजकूर ग्रेडियंटमध्ये आहे, त्यावरून दर ३ सेकंदाला एक 'White Light Sweep' (चकाकी) डावीकडून उजवीकडे जावी.

---

## 🛠️ 4. Technical Stack Recommendation
हे हुबेहूब बनवण्यासाठी खालील गोष्टी वापराव्यात:
- **Framework:** Next.js / React
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion (हा सगळ्यात महत्त्वाचा पार्ट आहे)
- **Icons:** Lucide-React किंवा Phosphor Icons

---
*Created for IDE Implementation based on Pinterest UI Reference.*