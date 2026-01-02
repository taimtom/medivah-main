# Blog Post Editor - Features & Usage

## 🎨 Rich Text Editor Features

The blog post editor now includes a **full-featured React Quill editor** with the following capabilities:

### Text Formatting
- **Headers**: H1, H2, H3, H4, H5, H6
- **Font Styles**: Different font families
- **Font Sizes**: Small, Normal, Large, Huge
- **Text Styles**: Bold, Italic, Underline, Strikethrough
- **Colors**: Text color and background color pickers
- **Script**: Subscript and Superscript

### Content Structure
- **Blockquotes**: For highlighting quotes
- **Code Blocks**: For displaying code snippets
- **Lists**: Ordered (numbered) and Unordered (bullet) lists
- **Indentation**: Increase/decrease indent
- **Alignment**: Left, Center, Right, Justify

### Media & Links
- **Links**: Insert and edit hyperlinks
- **Images**: Embed images via URL
- **Videos**: Embed video content

### Editor Tools
- **Clean**: Remove all formatting from selected text

---

## 📝 Form Features

### Two-Column Layout

#### Left Column (Main Content)
1. **Basic Information Card**
   - Title (required) - Auto-generates slug
   - Slug (required) - URL-friendly identifier
   - Excerpt - Brief summary for listings (optional but recommended)

2. **Content Editor Card**
   - **Edit Tab**: Full rich text editor with toolbar
   - **Preview Tab**: Real-time preview of formatted content

#### Right Column (Settings & Meta)
1. **Publish Settings Card**
   - Draft/Published toggle with visual feedback
   - Status indicator showing visibility
   - Alert message when publishing

2. **Category & Tags Card**
   - Category dropdown (HR Basics, Career Growth, Leadership, etc.)
   - Tags input (comma-separated)
   - Live tag preview with chips

3. **Featured Image Card**
   - Image URL input
   - Live image preview
   - Recommended size info (1200x630px)
   - Automatic error handling

---

## ✨ Key Features

### 1. **Edit & Preview Tabs**
- Switch between editing and previewing your content
- Preview shows exactly how the post will look on the website
- Styled preview with proper typography and spacing

### 2. **Auto Slug Generation**
- Slug is automatically generated from the title
- Converts to lowercase, removes special characters
- Replaces spaces with hyphens

### 3. **Live Tag Preview**
- Tags are displayed as chips as you type
- Visual feedback for comma-separated values

### 4. **Smart Publish Toggle**
- Clear visual distinction between Draft and Published
- Descriptive labels explaining visibility
- Success alert when publishing

### 5. **Image Preview**
- Instantly see your featured image
- Automatic error handling if URL is invalid
- Responsive image display

### 6. **Form Validation**
- Required fields marked with asterisk (*)
- Browser validation for required fields
- Helpful placeholder text and hints

---

## 🚀 How to Use

### Creating a New Blog Post

1. **Sign in** to the dashboard
2. Navigate to **Blog Posts** from the sidebar
3. Click **New Blog** button
4. Fill in the form:

   **Basic Information:**
   - Enter a compelling **Title**
   - The **Slug** will auto-generate (you can edit it)
   - Add an **Excerpt** (recommended for SEO)

   **Content:**
   - Use the rich text editor to write your content
   - Format text using the toolbar
   - Add images, links, and media
   - Switch to **Preview** tab to see how it looks

   **Settings:**
   - Choose a **Category**
   - Add relevant **Tags** (comma-separated)
   - Upload/paste your **Featured Image URL**
   - Toggle **Published** when ready to go live

5. Click **Save Draft** or **Publish Blog**

### Editing an Existing Post

1. Go to **Blog Posts** list
2. Click the **Edit** icon next to any post
3. Make your changes
4. Click **Update Blog** to save

---

## 💡 Tips & Best Practices

### Content Writing
- Use **headers** (H2, H3) to structure your content
- Add **images** to make posts more engaging
- Use **blockquotes** for highlighting important points
- Include **links** to external resources or related posts

### SEO Optimization
- Write descriptive **titles** (50-60 characters)
- Add compelling **excerpts** (150-160 characters)
- Use relevant **tags** (3-5 per post)
- Choose appropriate **categories**
- Add **alt text** in images (via URL parameters or editor)

### Images
- Use high-quality images (minimum 1200px wide)
- Optimize images before uploading (compress for web)
- Recommended aspect ratio: 16:9 for featured images
- Use HTTPS URLs for images

### Publishing Workflow
1. Start with **Draft** while writing
2. Use **Preview** tab to check formatting
3. Review all fields before publishing
4. Toggle **Published** when ready
5. Share your post!

---

## 🎯 Available Formatting Options

### Headers
```
# Heading 1
## Heading 2
### Heading 3
```

### Text Styles
- **Bold**: `Ctrl/Cmd + B`
- *Italic*: `Ctrl/Cmd + I`
- <u>Underline</u>: `Ctrl/Cmd + U`

### Lists
- Bullet points
- Numbered lists
- Indented lists

### Code
```javascript
function example() {
  return 'code block';
}
```

Inline `code` snippets

### Blockquotes
> Important quotes or callouts

### Links
[Link text](https://example.com)

### Images
![Alt text](https://example.com/image.jpg)

---

## 📊 Editor Toolbar Reference

| Icon/Button | Function | Keyboard Shortcut |
|-------------|----------|-------------------|
| H1-H6 | Headers | - |
| Font | Font family | - |
| Size | Font size | - |
| **B** | Bold | Ctrl/Cmd + B |
| *I* | Italic | Ctrl/Cmd + I |
| U | Underline | Ctrl/Cmd + U |
| S | Strikethrough | - |
| Color | Text color | - |
| Background | Highlight | - |
| Quote | Blockquote | - |
| Code | Code block | - |
| List | Ordered list | - |
| Bullets | Bullet list | - |
| Indent | Increase indent | Tab |
| Outdent | Decrease indent | Shift + Tab |
| Align | Text alignment | - |
| Link | Insert link | Ctrl/Cmd + K |
| Image | Insert image | - |
| Video | Embed video | - |
| Clean | Remove formatting | - |

---

## 🔧 Technical Details

### Editor Implementation
- **Library**: React Quill v2.0.0
- **Theme**: Snow (clean, minimal design)
- **Dynamic Loading**: SSR-safe with Next.js dynamic imports
- **Styling**: Material-UI theming integration

### Data Storage
- Content stored as **HTML** in Supabase
- Tags stored as **array** in database
- Published status as **boolean**
- Timestamps auto-updated on save

### Preview Rendering
- Uses `dangerouslySetInnerHTML` for HTML rendering
- Custom CSS for typography and spacing
- Responsive image handling
- Code syntax highlighting support

---

## 🎨 Customization

### Adding More Categories
Edit `src/sections/dashboard/blog/blog-form-view.jsx`:
```javascript
const CATEGORIES = [
  'HR Basics',
  'Career Growth',
  'Leadership',
  'Workplace Culture',
  'Employee Relations',
  // Add your categories here
];
```

### Editor Toolbar Customization
Edit `src/components/editor/editor.jsx` in the `modules` object to add/remove tools.

### Styling
The editor inherits Material-UI theme colors and can be customized via the `StyledEditor` component.

---

## ✅ Quality Checklist

Before publishing, check:
- [ ] Title is descriptive and engaging
- [ ] Slug is URL-friendly
- [ ] Excerpt is written
- [ ] Content is properly formatted
- [ ] Headers are used for structure
- [ ] Images are added and working
- [ ] Links are tested
- [ ] Category is selected
- [ ] Tags are added
- [ ] Featured image is set
- [ ] Preview looks good
- [ ] Spelling and grammar checked

---

## 🐛 Troubleshooting

### Editor not loading
- Refresh the page
- Check browser console for errors
- Ensure React Quill is installed: `npm install react-quill`

### Images not showing
- Verify the image URL is accessible
- Check if URL uses HTTPS
- Ensure image exists at the URL

### Formatting not saving
- Make sure you're in the Edit tab when making changes
- Content is auto-saved when you type
- Click Preview to verify changes

---

Happy blogging! 🎉


