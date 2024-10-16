---
layout: post
title: Fixing Blank Window When Adding Online Accounts in Fedora Linux
date: 2024-10-16 12:01
description: A simple solution to the blank window issue in Fedora's GNOME Online Accounts
tags: Fedora Linux GNOME Troubleshooting
categories: Tech
thumbnail: assets/img/date/Oct_16_2024/fedora_gnome_accounts.png
---
### Problem Overview

Many Fedora Linux users have encountered a frustrating issue when trying to add online accounts through the GNOME Settings. Upon clicking to add an account, they're met with a blank window, preventing them from proceeding further.

### The Solution

Fortunately, there's a simple workaround for this problem. The solution, found on Reddit, involves running the GNOME Control Center with a specific environment variable:

```bash
WEBKIT_DISABLE_COMPOSITING_MODE=1 gnome-control-center
```

This command disables the WebKit compositing mode, which appears to be the root cause of the blank window issue.

### Before and After

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/date/Oct_16_2024/before.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/date/Oct_16_2024/after.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>
<div class="caption">
    Left: Blank window issue. Right: Properly functioning online accounts window.
</div>

### How to Apply the Fix

1. Open a terminal in Fedora.
2. Copy and paste the following command:
   ```bash
   WEBKIT_DISABLE_COMPOSITING_MODE=1 gnome-control-center
   ```
3. Press Enter to run the command.
4. The GNOME Control Center will open, and you should now be able to add online accounts without encountering the blank window issue.

### Why This Works

The `WEBKIT_DISABLE_COMPOSITING_MODE=1` environment variable tells WebKit to disable its compositing mode. This mode is typically used for hardware acceleration and smooth animations, but in this case, it seems to be causing conflicts with the GNOME Online Accounts interface.

### Conclusion

While this is a temporary workaround, it effectively solves the blank window problem for adding online accounts in Fedora Linux. It's a simple solution that doesn't require any system modifications or additional software installations.


### References

- [Reddit thread discussing the solution](https://www.reddit.com/r/Fedora/comments/9uopvp/blank_screen_while_adding_account_on_gnome_online/)
