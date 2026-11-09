---
title: One wildcard certificate instead of eleven
date: 2026-08-20
summary: DNS-01 with Cloudflare in Caddy, and the IPv6 detail that broke the API token.
tags: [pki, caddy]
draft: true
---

Draft. Outline:

- Why per-host certificates got annoying.
- Building Caddy with the Cloudflare DNS plugin.
- The token permissions it really needs.
- The VPS preferred IPv6, so the IP-restricted token failed. Fixed in `/etc/gai.conf`.
