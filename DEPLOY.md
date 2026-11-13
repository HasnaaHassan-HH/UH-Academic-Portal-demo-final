# Deployment guide

Goal: the app running on a real server, reachable at your own domain over
HTTPS. About 45 to 60 minutes the first time. Replace `example.com` with your
domain and `SERVER_IP` with your server's IP address throughout.

You need two things. Skip whichever you already have.

## A. Get a server (DigitalOcean droplet)

1. Create an account at digitalocean.com, then **Create > Droplets**.
2. Choose **Ubuntu 24.04 LTS**, the cheapest **Basic** plan, and the region
   nearest to you.
3. Authentication: choose **Password** (simplest) and set a strong root password.
4. Create the droplet and copy its **IPv4 address** (this is `SERVER_IP`).

## B. Get a domain (Namecheap)

1. Search for a domain at namecheap.com and buy it (a `.xyz` or `.site`
   name is usually the cheapest).
2. In **Domain List > Manage > Advanced DNS**, delete the default records
   and add two **A Records**:

   | Type     | Host  | Value       | TTL       |
   |----------|-------|-------------|-----------|
   | A Record | `@`   | `SERVER_IP` | Automatic |
   | A Record | `www` | `SERVER_IP` | Automatic |

3. DNS can take from a few minutes to a few hours to spread. Check with
   `nslookup example.com` : it should answer with `SERVER_IP`.

## C. Put the app on the server

On your own computer (Windows PowerShell), from the folder that contains the
project zip:

```
scp exam-office-records.zip root@SERVER_IP:/root/
ssh root@SERVER_IP
```

Now on the server:

```
# 1. Install Node.js 22, Nginx and helper tools
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs nginx unzip

# 2. Unpack the app and install its packages
mkdir -p /var/www/exam-office
unzip /root/exam-office-records.zip -d /var/www/
cp -r /var/www/exam-office-records/. /var/www/exam-office/
cd /var/www/exam-office
npm install --omit=dev
chown -R www-data:www-data /var/www/exam-office

# 3. Run it as a service (starts on boot, restarts after a crash)
cp deploy/exam-office.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now exam-office
systemctl status exam-office        # should say "active (running)"
curl -I http://127.0.0.1:3000       # should say "200 OK"
```

## D. Connect the domain with Nginx

```
cp deploy/nginx.conf /etc/nginx/sites-available/exam-office
nano /etc/nginx/sites-available/exam-office     # change example.com to your domain
ln -s /etc/nginx/sites-available/exam-office /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

Open `http://example.com` : you should see the sign-in page.

## E. Add HTTPS (free certificate) and a firewall

```
apt install -y certbot python3-certbot-nginx
certbot --nginx -d example.com -d www.example.com    # choose "redirect" if asked
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable
```

Open `https://example.com`. The certificate renews automatically.

## F. Final checks before you submit

- [ ] `https://example.com` and `https://www.example.com` both load.
- [ ] Sign in, add a mark, refresh the page: the mark is still there.
- [ ] `reboot` the server, wait a minute: the site comes back by itself.
- [ ] Browser DevTools console shows no errors.
- [ ] Put the live URL in `README.md` and in your report.

## Handy commands

```
journalctl -u exam-office -n 50      # app logs
systemctl restart exam-office        # restart after changing files
rm /var/www/exam-office/data/exam-office.db* && systemctl restart exam-office   # reset demo data
```
