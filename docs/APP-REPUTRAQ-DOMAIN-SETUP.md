# Step-by-step: Make app.reputraq.com work

Follow these steps in order. Your Vercel **web** project shows "Verification Needed" for `app.reputraq.com` because the domain is still linked to another Vercel account. You fix it by adding one TXT record and ensuring one CNAME record in Hostinger.

---

## Step 1: Get the exact values from Vercel

1. Go to **Vercel** → [reputraqs-projects/web/settings/domains](https://vercel.com/reputraqs-projects/web/settings/domains).
2. Find **app.reputraq.com** (the one with "Verification Needed").
3. In the orange box, note the **TXT** record Vercel shows:
   - **Name:** `_vercel`
   - **Value:** something like `vc-domain-verify=app.reputraq.com,acf9d6ceed3a2501f127`  
     *(Copy the full value from your Vercel page; the hash at the end is project-specific.)*
4. In the same section, note the **CNAME** record Vercel shows for `app.reputraq.com` (e.g. **Name:** `app`, **Value:** `80d0ffc7c0921e1c.vercel-dns-017.com`). Use that exact target in Step 3. Vercel recommends using this project-specific target over the older `cname.vercel-dns.com`.

---

## Step 2: Add the TXT record in Hostinger (verification)

1. Log in to **Hostinger** and open the domain **reputraq.com**.
2. Go to **Domains** → **reputraq.com** → **DNS / Nameservers**.
3. Click **Add record** (or **Manage DNS** then add).
4. Create a **TXT** record:
   - **Type:** `TXT`
   - **Name / Host:** `_vercel`  
     *(If Hostinger asks for a full name, use `_vercel.reputraq.com` or just `_vercel` so the record is for `_vercel.reputraq.com`.)*
   - **Value / Content / Target:** paste the **full value** from Vercel (Step 1), e.g.  
     `vc-domain-verify=app.reputraq.com,acf9d6ceed3a2501f127`  
     *(No extra quotes unless your panel adds them automatically.)*
   - **TTL:** 3600 (or leave default).
5. Save the record.

---

## Step 3: Ensure the CNAME for `app` points to Vercel (traffic)

So that `app.reputraq.com` actually loads your **web** app:

1. In the same **DNS / Nameservers** page in Hostinger, look for a **CNAME** record with **Name** = `app`.
2. **If it exists:**  
   - Set its **Value / Target** to: `80d0ffc7c0921e1c.vercel-dns-017.com`  
     *(or the exact CNAME value shown in Vercel for the **web** project — no trailing dot.)*  
   - Save.
3. **If it does not exist:**  
   - **Add** a new record:  
     - **Type:** `CNAME`  
     - **Name:** `app`  
     - **Value:** `80d0ffc7c0921e1c.vercel-dns-017.com`  
     - **TTL:** 3600 or default  
   - Save.

You can have multiple TXT records with name `_vercel` (e.g. for www and app); that’s fine. Don’t remove the TXT you added in Step 2 until verification is done.

---

## Step 4: Wait for DNS and refresh in Vercel

1. Wait **5–15 minutes** (sometimes up to an hour) for DNS to update.
2. In **Vercel** → **web** → **Settings** → **Domains**, find **app.reputraq.com**.
3. Click **Refresh** next to it.
4. When the status changes to **Valid Configuration** (green), verification is done and the domain is correctly linked to this project.

---

## Step 5: Confirm the app works

1. Open **https://app.reputraq.com** in a browser (use a private/incognito window or clear cache if it was open before).
2. You should see your **web** app (e.g. sign-in or dashboard).
3. If you get a **network error on login**, the domain is fine; the app needs env vars in Vercel:
   - **Vercel** → **web** project → **Settings** → **Environment Variables**
   - Add **DATABASE_URL** (same value as in `reputraq/apps/web/.env.local`) for **Production**.
   - Add any other variables your app needs (see `.env.local`).
   - **Redeploy** the **web** project after saving env vars.

---

## Quick reference (copy into Hostinger)

Use these exact values from your **web** project in Vercel:

| Purpose       | Type  | Name     | Value |
|---------------|-------|----------|--------|
| Verification  | TXT   | `_vercel` | `vc-domain-verify=app.reputraq.com,acf9d6ceed3a2501f127` |
| Traffic       | CNAME | `app`    | `80d0ffc7c0921e1c.vercel-dns-017.com` |

*(In Hostinger, enter the CNAME value **without** a trailing dot. If Vercel later shows a different CNAME target for this project, use that instead.)*

---

## Troubleshooting

- **Still "Verification Needed" after 30 min:**  
  Double-check the TXT **Value** is exactly as in Vercel (no spaces, same comma and hash). Click **Refresh** in Vercel again.

- **Site doesn’t load or wrong site:**  
  Check the **app** CNAME points to `cname.vercel-dns.com` or the target from Vercel for the **web** project. Remove any duplicate or old CNAME for `app`.

- **Login "network error" on app.reputraq.com:**  
  Domain and DNS are OK; add **DATABASE_URL** (and other env vars) in Vercel for the **web** project and redeploy.
