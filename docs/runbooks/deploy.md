# Tradalyst — Production Deployment Runbook

> **Target:** Hetzner VPS · Ubuntu 22.04 · No Docker  
> **Author:** Mo  
> **Last updated:** 2026-04  
>
> Follow every section in order on a fresh VPS.  
> Commands marked `[VPS]` run on the server. Commands marked `[LOCAL]` run locally.

---

## Table of Contents

1. [Initial VPS Setup](#1-initial-vps-setup)
2. [Create Deploy User](#2-create-deploy-user)
3. [Clone the Repository](#3-clone-the-repository)
4. [Backend Setup — Django + Gunicorn](#4-backend-setup--django--gunicorn)
5. [Frontend Marketing Setup — Next.js on Port 3000](#5-frontend-marketing-setup--nextjs-on-port-3000)
6. [Frontend App Setup — Next.js on Port 3001](#6-frontend-app-setup--nextjs-on-port-3001)
7. [Nginx Configuration](#7-nginx-configuration)
8. [Gunicorn Systemd Service](#8-gunicorn-systemd-service)
9. [PM2 Startup (Survives Reboots)](#9-pm2-startup-survives-reboots)
10. [Cloudflare DNS Records](#10-cloudflare-dns-records)
11. [Final Verification Checklist](#11-final-verification-checklist)
12. [Re-deploy After Code Changes](#12-re-deploy-after-code-changes)

---

## 1. Initial VPS Setup

SSH into the server as root (Hetzner provides root access on fresh Ubuntu servers):

```bash
# [LOCAL] — from your Mac
ssh root@<YOUR_VPS_IP>
```

Update the system and install all required packages:

```bash
# [VPS] — update package lists and upgrade existing packages
apt update && apt upgrade -y

# Install essential system utilities
apt install -y git curl wget build-essential software-properties-common \
    ufw fail2ban
```

### 1a. Install Node.js 20

```bash
# [VPS]
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify
node --version   # should print v20.x.x
npm --version    # should print 10.x.x
```

### 1b. Install Python 3.12

Ubuntu 22.04 ships Python 3.10. Add the deadsnakes PPA for 3.12:

```bash
# [VPS]
add-apt-repository ppa:deadsnakes/ppa -y
apt update
apt install -y python3.12 python3.12-venv python3.12-dev

# Verify
python3.12 --version   # should print Python 3.12.x
```

### 1c. Install PostgreSQL 15

```bash
# [VPS] — add the official PostgreSQL APT repository
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
    > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    | tee /etc/apt/trusted.gpg.d/pgdg.asc > /dev/null
apt update
apt install -y postgresql-15

# Start PostgreSQL and enable it on boot
systemctl start postgresql
systemctl enable postgresql

# Verify
psql --version   # should print psql (PostgreSQL) 15.x
```

### 1d. Install Nginx

```bash
# [VPS]
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### 1e. Install PM2

```bash
# [VPS]
npm install -g pm2

# Verify
pm2 --version
```

### 1f. Configure UFW Firewall

Allow only the ports Nginx needs plus SSH:

```bash
# [VPS]
ufw allow OpenSSH
ufw allow 'Nginx HTTP'    # port 80 — Cloudflare connects here
ufw --force enable
ufw status
```

> **Note:** Ports 3000, 3001, and 8000 are intentionally NOT opened to the
> internet — only Nginx needs them, and Nginx is on the same machine.

---

## 2. Create Deploy User

Running services as root is a security risk. Create a dedicated user:

```bash
# [VPS] — as root
adduser deploy
# Enter a strong password when prompted; skip the optional fields

# Give deploy user sudo access
usermod -aG sudo deploy

# Switch to deploy user for all remaining steps
su - deploy
```

> All remaining commands in this guide run as the `deploy` user unless stated otherwise.

---

## 3. Clone the Repository

### 3a. Set Up SSH Key for GitHub

```bash
# [VPS] — as deploy
ssh-keygen -t ed25519 -C "deploy@tradalyst-vps" -f ~/.ssh/id_ed25519
# Press Enter twice to skip passphrase (or add one for extra security)

# Print the public key — copy this entire output
cat ~/.ssh/id_ed25519.pub
```

Go to **GitHub → Settings → SSH and GPG keys → New SSH key**, paste the public key, and save.

Test the connection:

```bash
# [VPS]
ssh -T git@github.com
# Expected: "Hi abdelbarmohammed! You've successfully authenticated..."
```

### 3b. Clone the Repo

```bash
# [VPS]
sudo mkdir -p /var/www/tradalyst
sudo chown deploy:deploy /var/www/tradalyst

cd /var/www/tradalyst
git clone git@github.com:abdelbarmohammed/tradalyst.git .

# Confirm the structure
ls
# Should show: backend/ frontend/ nginx/ docs/ ecosystem.config.js ...
```

---

## 4. Backend Setup — Django + Gunicorn

### 4a. Create the Database

```bash
# [VPS] — switch to postgres user temporarily
sudo -u postgres psql

-- Inside the PostgreSQL shell:
CREATE USER tradalyst WITH PASSWORD 'REPLACE_WITH_STRONG_PASSWORD';
CREATE DATABASE tradalyst OWNER tradalyst;
GRANT ALL PRIVILEGES ON DATABASE tradalyst TO tradalyst;
\q
```

> Replace `REPLACE_WITH_STRONG_PASSWORD` with a real password. Save it — you need it in the `.env` file below.

### 4b. Create the Python Virtual Environment

```bash
# [VPS] — back as deploy user
cd /var/www/tradalyst/backend

python3.12 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install all dependencies
pip install -r requirements.txt

# Verify Gunicorn was installed
gunicorn --version
```

### 4c. Create the Production `.env` File

```bash
# [VPS]
cd /var/www/tradalyst/backend
nano .env
```

Paste the following, replacing every `REPLACE_*` placeholder:

```bash
DJANGO_SETTINGS_MODULE=tradalyst.settings.production

# Generate: python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
SECRET_KEY=REPLACE_WITH_DJANGO_SECRET_KEY

# Use the password you set in Step 4a
DATABASE_URL=postgresql://tradalyst:REPLACE_WITH_STRONG_PASSWORD@localhost:5432/tradalyst

# From console.anthropic.com
CLAUDE_API_KEY=REPLACE_WITH_ANTHROPIC_KEY

# From finnhub.io → Dashboard → API key
FINNHUB_API_KEY=REPLACE_WITH_FINNHUB_KEY

# Generate: python3 -c "import secrets; print(secrets.token_hex(64))"
JWT_SIGNING_KEY=REPLACE_WITH_JWT_SIGNING_KEY

ALLOWED_HOSTS=api.tradalyst.com,localhost,127.0.0.1
```

Save and close (`Ctrl+O`, `Enter`, `Ctrl+X`).

Lock down permissions so only the deploy user can read it:

```bash
chmod 600 /var/www/tradalyst/backend/.env
```

### 4d. Generate the Secret Keys

Open a second terminal tab and run these to generate values for the `.env` file above:

```bash
# [VPS] — generate SECRET_KEY
cd /var/www/tradalyst/backend && source venv/bin/activate
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Generate JWT_SIGNING_KEY
python3 -c "import secrets; print(secrets.token_hex(64))"
```

Edit `.env` again to fill in the generated values:

```bash
nano /var/www/tradalyst/backend/.env
```

### 4e. Run Migrations and Collect Static Files

```bash
# [VPS]
cd /var/www/tradalyst/backend
source venv/bin/activate

# Run database migrations
python manage.py migrate

# Collect static files into backend/staticfiles/ (served by Nginx)
python manage.py collectstatic --noinput

# Create the Django admin superuser
python manage.py createsuperuser
# Enter your email and a strong password when prompted
```

### 4f. Verify Django Starts Correctly

Test that Gunicorn can serve the app before wiring up systemd:

```bash
# [VPS]
cd /var/www/tradalyst/backend
source venv/bin/activate

gunicorn --bind 0.0.0.0:8000 --workers 3 tradalyst.wsgi:application

# You should see:
# [INFO] Starting gunicorn 21.2.0
# [INFO] Listening at: http://0.0.0.0:8000
# Press Ctrl+C to stop
```

---

## 5. Frontend Marketing Setup — Next.js on Port 3000

### 5a. Install Dependencies

```bash
# [VPS]
cd /var/www/tradalyst/frontend/marketing
npm install
```

### 5b. Create the Production `.env.local`

```bash
# [VPS]
nano /var/www/tradalyst/frontend/marketing/.env.local
```

Paste:

```bash
NEXT_PUBLIC_APP_URL=https://app.tradalyst.com
```

Save and close.

### 5c. Build the Marketing Site

```bash
# [VPS]
cd /var/www/tradalyst/frontend/marketing
npm run build
```

The build should complete with "✓ Generating static pages" and zero errors.

### 5d. Start with PM2

```bash
# [VPS]
cd /var/www/tradalyst

# Start both Next.js apps from the ecosystem file (marketing + app)
pm2 start ecosystem.config.js --only tradalyst-marketing

# Check it started
pm2 list
pm2 logs tradalyst-marketing --lines 20
```

---

## 6. Frontend App Setup — Next.js on Port 3001

### 6a. Install Dependencies

```bash
# [VPS]
cd /var/www/tradalyst/frontend/app
npm install
```

### 6b. Create the Production `.env.local`

```bash
# [VPS]
nano /var/www/tradalyst/frontend/app/.env.local
```

Paste:

```bash
NEXT_PUBLIC_MARKETING_URL=https://tradalyst.com
NEXT_PUBLIC_API_URL=https://api.tradalyst.com
```

Save and close.

### 6c. Build the App

```bash
# [VPS]
cd /var/www/tradalyst/frontend/app
npm run build
```

Should complete with "✓ Generating static pages (16/16)" and zero errors.

### 6d. Start with PM2

```bash
# [VPS]
cd /var/www/tradalyst
pm2 start ecosystem.config.js --only tradalyst-app

pm2 list
pm2 logs tradalyst-app --lines 20
```

---

## 7. Nginx Configuration

### 7a. Copy the Config Files

The Nginx configs are already in the repo at `nginx/conf.d/`. Copy them to where Nginx reads them:

```bash
# [VPS]
sudo cp /var/www/tradalyst/nginx/conf.d/marketing.conf /etc/nginx/conf.d/
sudo cp /var/www/tradalyst/nginx/conf.d/app.conf       /etc/nginx/conf.d/
sudo cp /var/www/tradalyst/nginx/conf.d/api.conf       /etc/nginx/conf.d/
```

### 7b. Remove the Default Site

```bash
# [VPS]
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/conf.d/default.conf
```

### 7c. Test and Reload Nginx

```bash
# [VPS]
sudo nginx -t
# Expected: "nginx: configuration file /etc/nginx/nginx.conf test is successful"

sudo systemctl reload nginx
```

---

## 8. Gunicorn Systemd Service

Running Gunicorn via systemd ensures it starts automatically on VPS reboot.

### 8a. Create the Service File

```bash
# [VPS]
sudo nano /etc/systemd/system/tradalyst-api.service
```

Paste the following exactly (no changes needed if your deploy user is `deploy`):

```ini
[Unit]
Description=Gunicorn daemon — Tradalyst Django API
Documentation=https://github.com/abdelbarmohammed/tradalyst
After=network.target postgresql.service
Requires=postgresql.service

[Service]
User=deploy
Group=deploy
WorkingDirectory=/var/www/tradalyst/backend
Environment="PATH=/var/www/tradalyst/backend/venv/bin"
ExecStart=/var/www/tradalyst/backend/venv/bin/gunicorn \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    --access-logfile /var/log/gunicorn/access.log \
    --error-logfile /var/log/gunicorn/error.log \
    tradalyst.wsgi:application
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

Save and close.

### 8b. Create the Log Directory

```bash
# [VPS]
sudo mkdir -p /var/log/gunicorn
sudo chown deploy:deploy /var/log/gunicorn
```

### 8c. Enable and Start the Service

```bash
# [VPS]
sudo systemctl daemon-reload
sudo systemctl enable tradalyst-api
sudo systemctl start tradalyst-api

# Check it's running
sudo systemctl status tradalyst-api
# Should show: "Active: active (running)"

# Tail the logs
sudo tail -f /var/log/gunicorn/error.log
```

---

## 9. PM2 Startup (Survives Reboots)

```bash
# [VPS]
# Generate the systemd startup script for PM2.
# Copy and run the exact command that pm2 prints — it starts with "sudo env PATH=..."
pm2 startup

# After running the command that pm2 printed:
pm2 save

# Verify PM2 has saved the process list
pm2 list
```

After the next VPS reboot both Next.js processes will start automatically.

---

## 10. Cloudflare DNS Records

Log in to **Cloudflare → your domain → DNS → Records**.

Add the following three **A records** (replace `YOUR_VPS_IP` with the Hetzner VPS IP):

| Type | Name | IPv4 Address | Proxy status |
|------|------|--------------|--------------|
| A | `tradalyst.com` | `YOUR_VPS_IP` | Proxied (orange cloud) ✓ |
| A | `app` | `YOUR_VPS_IP` | Proxied (orange cloud) ✓ |
| A | `api` | `YOUR_VPS_IP` | Proxied (orange cloud) ✓ |

> **Orange cloud = Proxied** means Cloudflare terminates TLS and routes traffic.  
> This is required for SSL to work without certs on the server.

### Cloudflare SSL/TLS Mode

Go to **Cloudflare → SSL/TLS → Overview** and set the mode to **Flexible**.

> Flexible = Cloudflare uses HTTPS with the visitor, HTTP with your origin (Nginx).
> This matches the Nginx config (port 80 only) and the Django production settings.

### Optional: Always Use HTTPS

Go to **Cloudflare → SSL/TLS → Edge Certificates → Always Use HTTPS → On**.

This ensures HTTP visitors are redirected to HTTPS at the Cloudflare edge before
the request ever reaches your server.

---

## 11. Final Verification Checklist

Work through each check in order. A failing check tells you exactly which service or config to investigate.

### 11a. Services Running on the VPS

```bash
# [VPS]
# 1. Gunicorn (Django API)
sudo systemctl status tradalyst-api
# Expected: Active: active (running)

# 2. Nginx
sudo systemctl status nginx
# Expected: Active: active (running)

# 3. PM2 (both Next.js apps)
pm2 list
# Expected: tradalyst-marketing  online
#           tradalyst-app         online

# 4. PostgreSQL
sudo systemctl status postgresql
# Expected: Active: active (running)
```

### 11b. Ports Listening Correctly

```bash
# [VPS]
ss -tlnp | grep -E ':80|:3000|:3001|:8000'
# Expected output (four lines):
#   0.0.0.0:80    — nginx
#   127.0.0.1:3000 — node (marketing)
#   127.0.0.1:3001 — node (app)
#   127.0.0.1:8000 — gunicorn
```

> Note: 3000, 3001, 8000 must bind to 127.0.0.1 (loopback only), NOT 0.0.0.0.
> If Gunicorn is on 0.0.0.0:8000, update the systemd service to use `127.0.0.1:8000`.

### 11c. Test Each Service Directly from the VPS

```bash
# [VPS] — Django API health check
curl http://127.0.0.1:8000/api/auth/login/ -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"fake@test.com","password":"wrong"}' \
    -s | python3 -m json.tool
# Expected: {"detail": "..."} with HTTP 400 or 401 (not a 502/503)

# Marketing site
curl -s http://127.0.0.1:3000 | head -5
# Expected: HTML starting with <!DOCTYPE html>

# App
curl -s http://127.0.0.1:3001 | head -5
# Expected: HTML starting with <!DOCTYPE html>
```

### 11d. Test Through Nginx (Before DNS Propagates)

```bash
# [VPS] — force the Host header to simulate a real request
curl -s -H "Host: api.tradalyst.com" http://127.0.0.1/ | python3 -m json.tool
curl -s -H "Host: tradalyst.com" http://127.0.0.1/ | head -5
curl -s -H "Host: app.tradalyst.com" http://127.0.0.1/ | head -5
```

### 11e. Test the Live URLs (After DNS Propagates)

Wait 5–10 minutes after adding Cloudflare records for DNS to propagate, then:

```bash
# [LOCAL] — from your Mac
curl -s https://api.tradalyst.com/api/auth/login/ -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"fake@test.com","password":"wrong"}'
# Expected: JSON error response (HTTP 400/401)

curl -I https://tradalyst.com
# Expected: HTTP/2 200

curl -I https://app.tradalyst.com
# Expected: HTTP/2 200
```

### 11f. Test Login End-to-End

1. Open **https://tradalyst.com/login** in a browser
2. Log in with the test account: `trader@test.com` / `Test1234!`
   - Wait — you need to seed this account first (see below)
3. You should be redirected to **https://app.tradalyst.com/dashboard**

### 11g. Seed the Test Account

```bash
# [VPS]
cd /var/www/tradalyst/backend
source venv/bin/activate

python manage.py shell
```

```python
from apps.users.models import CustomUser
CustomUser.objects.create_user(
    email="trader@test.com",
    password="Test1234!",
    display_name="Test Trader",
    role="trader",
)
exit()
```

---

## 12. Re-deploy After Code Changes

Each time you push a new commit and want to deploy it to the VPS:

```bash
# [VPS]
cd /var/www/tradalyst

# 1. Pull latest code
git pull origin main

# 2. Backend — apply any new migrations, re-collect static files
cd backend
source venv/bin/activate
pip install -r requirements.txt     # in case dependencies changed
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart tradalyst-api

# 3. Marketing site — rebuild and restart
cd ../frontend/marketing
npm install
npm run build
pm2 restart tradalyst-marketing

# 4. App — rebuild and restart
cd ../frontend/app
npm install
npm run build
pm2 restart tradalyst-app

# 5. Reload Nginx if configs changed
sudo cp /var/www/tradalyst/nginx/conf.d/*.conf /etc/nginx/conf.d/
sudo nginx -t && sudo systemctl reload nginx

# 6. Confirm everything is still running
pm2 list
sudo systemctl status tradalyst-api
```

---

## Appendix: Service Locations Quick Reference

| Service | Binary / Command | Config file | Log files |
|---------|-----------------|-------------|-----------|
| Django API | `venv/bin/gunicorn` | `/etc/systemd/system/tradalyst-api.service` | `/var/log/gunicorn/` |
| Marketing (Next.js) | `next start -p 3000` | `ecosystem.config.js` | `pm2 logs tradalyst-marketing` |
| App (Next.js) | `next start -p 3001` | `ecosystem.config.js` | `pm2 logs tradalyst-app` |
| Nginx | `/usr/sbin/nginx` | `/etc/nginx/conf.d/` | `/var/log/nginx/` |
| PostgreSQL | `postgresql` | `/etc/postgresql/15/main/` | `/var/log/postgresql/` |

## Appendix: Useful Commands

```bash
# View live Gunicorn logs
sudo tail -f /var/log/gunicorn/error.log

# View live Nginx logs
sudo tail -f /var/log/nginx/api.error.log

# View PM2 logs for both apps
pm2 logs

# Restart everything
sudo systemctl restart tradalyst-api
pm2 restart all
sudo systemctl reload nginx

# Django management shell
cd /var/www/tradalyst/backend && source venv/bin/activate && python manage.py shell

# Check disk space
df -h

# Check memory
free -h
```
