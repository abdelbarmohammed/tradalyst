---
name: SSH deployment user
description: Always use mohammed@49.13.237.4 for SSH, never root and never the domain name
type: feedback
---

Use `mohammed@49.13.237.4` for all SSH/deployment commands — root SSH is disabled on the Hetzner VPS.

**Why:** Root SSH is disabled on the server.
**How to apply:** Every SSH/SCP/rsync command in this project must use `mohammed@49.13.237.4`. Never use `root@tradalyst.com` or `root@49.13.237.4`. The socket path convention is `/tmp/tdN.sock` with incrementing N.
