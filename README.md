# Md Nayon Reza — Portfolio (Netlify)

A fast static site with a private admin panel. Every section's text, the links, photos, videos
and the CV are edited from the admin panel — no code editing needed.
Visitors can only view and download. Editing is possible only after logging in at `/admin/`.

## Files

```
index.html          public page (all text lives here)
css/style.css       design; colours are at the top
js/script.js        page logic (nothing to edit)
content/*.json      all text, links, photos, videos — edited by the admin panel
admin/              admin panel (login + upload)
assets/             photos, CV; assets/uploads/ holds admin uploads
netlify.toml        Netlify settings (caching, security headers)
robots.txt, sitemap.xml   SEO files
```

## 1. Put the site on Netlify (about 10 minutes)

The admin panel saves uploads into a GitHub repository, so deploy **through GitHub**
(drag-and-drop deploys cannot use the admin panel).

1. Create a new repository on GitHub and upload everything in this folder
   (keep the folders; the default branch must be `main`).
2. On Netlify: **Add new project → Import an existing project → GitHub**, pick the repository.
   Leave the build command empty and deploy.
3. Rename the site under **Project configuration → Change project name** if you want a nicer address.

## 2. Turn on the admin login

1. **Project configuration → Identity → Enable Identity**.
2. Under **Registration preferences** choose **Invite only**.
   This is what stops strangers from creating an account.
3. Under **Services → Git Gateway** click **Enable Git Gateway**.
4. In the **Identity** tab click **Invite users** and enter your own email.
5. Open the invitation email, click the link and set your password.

From now on, go to `https://YOUR-SITE.netlify.app/admin/`, log in with your **email and password**,
open **Website sections**, pick a section (Home, About, Research, Education, Experience, Skills,
CV/photos/videos, Contact), change the text or upload files, then press **Publish**.
The public site shows the new version in about a minute (refresh the page).

- Photos: up to 10 MB each. Videos: keep under about 50 MB (MP4). For longer videos,
  upload to YouTube and paste the link in the "YouTube link" field.
- Uploaded videos get a **Download video** button on the public page.

## 3. Finish the SEO and analytics settings

1. Replace `YOUR-SITE.netlify.app` with your real address in `index.html` (4 places),
   `robots.txt`, `sitemap.xml` and `admin/config.yml`.
2. Visitor analytics: create a free Google Analytics 4 property and paste its Measurement ID
   (`G-XXXXXXXXXX`) in the admin panel under **Contact, links and analytics**.
   CV and video downloads are recorded as events.
3. Add your LinkedIn and ResearchGate links in the same admin section.
4. Submit `https://YOUR-SITE.netlify.app/sitemap.xml` in Google Search Console.

## Note on the CV

`assets/Nayon_Reza_CV.pdf` is public. Check that it has no passport number, date of birth or
home address, and that your referees agree to their phone numbers being online.
Replace it any time from the admin panel.

## Note on editing

The admin panel changes the files in `/content`. The page title and description that Google shows
(the `<title>` and `<meta name="description">` lines at the top of `index.html`) are not in the
admin panel; change them in `index.html` if your profile changes a lot.
