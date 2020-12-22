FROM fedora
RUN dnf install -y 'dnf-command(copr)' && dnf copr enable -y @caddy/caddy && dnf install -y caddy sqlite
COPY output/bfon-server /usr/bin/bfon-server
COPY output/webroot /srv
COPY deploy/Caddyfile /etc/caddy/Caddyfile

