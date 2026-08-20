# Neon Arcade - 23 Games

Ek single-page web app jisme 23 mini-games hain (Snake, 2048, Tetris,
Wordle, Car Race, Bus Parking, aur bahut kuch). PWA-ready hai — mobile
ya desktop par "Add to Home Screen" / "Install" karke app jaisa use
kar sakte ho.

## Files
- `index.html` — poora app (sab games isi ek file mein hain)
- `manifest.json` — PWA settings (app name, icon, theme color)
- `sw.js` — service worker (offline support)
- `icon.svg` — app icon

## Ise LIVE kaise karein (FREE options)

### Option 1: Netlify Drop (sabse aasan, 1 minute)
1. https://app.netlify.com/drop kholo
2. Is poore folder ko browser mein drag-and-drop karo
3. Turant ek live URL mil jayega (jaise https://xyz.netlify.app)

### Option 2: GitHub Pages
1. GitHub par naya repository banao
2. Is folder ki saari files upload karo
3. Repo Settings > Pages > Source: "main branch" select karo
4. Kuch minute mein live URL milega: https://<username>.github.io/<repo>

### Option 3: Vercel
1. https://vercel.com par account banao
2. "Add New Project" > folder upload / drag-drop
3. Deploy dabao, live URL turant milega

### Option 4: Apna hosting/server
Bas is folder ki saari files apne web server ke root mein daal do
(Apache, Nginx, ya kisi bhi static host par). Koi backend/database
nahi chahiye — pure static files hain.

## Custom domain
Har upar wali service (Netlify/Vercel/GitHub Pages) free mein custom
domain bhi jodne deti hai — settings mein "Add custom domain" dhundo.
