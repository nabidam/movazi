# Movazi project
A simple nextjs project that serves some pages that stored in `sqlite` and uses `pm2` to run the daemon.

## Instructions
install the dependencies by running:
```bash
npm isntall # or yarn
```
copy the `data.db` file (initialized locally) to path `database/data.db`.
update file `ecosystem.config.js`:
- value of `cwd` should be the path of the project (run `pwd` in the root)
- value of `interpreter` should be the path of the nodejs binary (run `whereis node`)

build the app:
```bash
npm run build # or yarn build
```

start the app by running:
```bash
pm2 start ecosystem.config.js
pm2 startup # handles startup script
pm2 save # saves the status for next reboots
```

now the app runs on port `3000` and you can use `nginx` for reverse proxy and serve it with ssl.

copy `nginx.conf` in path `/etc/sites-available/sitename`.

change `host` value in the config file.

use `certbot` to get the certifications.

create a link of config in the enabled configs of nginx:
```bash
ln -s /etc/sites-available/sitename /etc/sites-enabled/sitename
```

now restart the nginx, and check the domain :)