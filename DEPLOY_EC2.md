# Deploy the AQI signage app to AWS EC2 (Mumbai)

The CPCB feed (`airquality.cpcb.gov.in`) only accepts connections from **Indian IP
addresses**. Hosts outside India (Render, most Vercel/Netlify regions, etc.) time out
and the app silently falls back to the stale bundled `public/city_aqi.xml`.

**Fix: run the backend on an EC2 instance in the Mumbai region (`ap-south-1`).**

---

## Decommission Render (if you used it before)

The repo no longer supports Render. Delete the old service so the signage player
is not pointed at a stale URL:

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Open the **amisha-aqi** web service
3. **Settings → Delete Web Service**
4. Point your signage player at the EC2 URL instead (see below)

---

## 1. Launch the EC2 instance

1. AWS Console → **EC2** → set region (top right) to **Asia Pacific (Mumbai) ap-south-1**.
2. **Launch instance**:
   - **AMI:** Ubuntu Server 22.04 LTS (or 24.04)
   - **Type:** `t3.small` (fine for signage; `t3.micro` also works)
   - **Key pair:** create/download one (`aqi-key.pem`)
   - **Security group / inbound rules:**
     - SSH `22` — your IP
     - HTTP `80` — `0.0.0.0/0`
     - Custom TCP `3000` — `0.0.0.0/0` (only if you skip Nginx)
3. Launch and note the **public IPv4 address**.

## 2. Connect

```bash
chmod 400 aqi-key.pem
ssh -i aqi-key.pem ubuntu@<EC2_PUBLIC_IP>
```

## 3. Install Node.js 20 + git

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
node -v   # should print v20.x
```

## 4. Get the code and build

```bash
git clone https://github.com/AnshikaTrivedii/Amisha-AQI.git AQI
cd AQI
npm install
npm run build
```

## 5. Verify CPCB is reachable from this server (the whole point)

```bash
npm start &            # starts on port 3000
sleep 3
curl -s http://localhost:3000/api/health
```

You want `"lastServedSource":"live"` and `"liveDataReachable":true`.
Then confirm a fresh timestamp:

```bash
curl -s "http://localhost:3000/api/aqi?refresh=1" | grep -m1 "Kendriya Vidyalaya, Lucknow"
```

The `lastupdate=` should be today's date. If so, the geo-block problem is solved.
Stop the test server: `kill %1`.

## 6. Keep it running with PM2

```bash
sudo npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd     # run the command it prints
```

(Alternative: use the systemd unit in `deploy/aqi.service` instead of PM2.)

## 7. (Recommended) Put Nginx on port 80

```bash
sudo apt-get install -y nginx
sudo tee /etc/nginx/sites-available/aqi >/dev/null <<'EOF'
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF
sudo ln -sf /etc/nginx/sites-available/aqi /etc/nginx/sites-enabled/aqi
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
```

Now the app is at `http://<EC2_PUBLIC_IP>/`. Point the Android signage player at that URL.

## 8. Updating later

```bash
cd ~/AQI
git pull
npm install
npm run build
pm2 restart aqi
```

---

## Notes

- **Health check:** `GET /api/health` reports whether live CPCB data was fetched.
- **Static IP:** attach an **Elastic IP** so the signage URL never changes.
- **HTTPS:** if you have a domain, add Let's Encrypt via `certbot`. Not required for a
  LAN/kiosk signage player.
- "Last updated" reflects **CPCB's publish time**, so it only advances when CPCB
  publishes new data (roughly hourly).
