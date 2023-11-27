---
layout: page
permalink: /OhaoTech/
title: Join Ohao Tech
description: Join the special interest group in computer graphics, AI, game development.
nav: true
nav_order: 5
---
# Ohao Tech Organization


{% if site.data.ohao_repositories.github_users %}

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% for user in site.data.ohao_repositories.github_users %}
    {% include repository/repo_user.html username=user %}
  {% endfor %}
</div>


🌟 **Who We Are:** Ohao Tech is a dynamic special interest group composed of young, enthusiastic individuals deeply fascinated by the rapidly evolving realms of computer graphics, artificial intelligence, and game industry development. Based at the intersection of innovation and creativity, our group thrives on exploring the limitless possibilities these fields offer.

🚀 **Our Mission:** Our journey is fueled by a singular mission - to push the boundaries of technology and imagination. We are committed to developing cutting-edge software and tools that not only advance the state of the art in computer graphics and AI but also contribute meaningfully to the gaming industry. We believe in the power of technology to transform ideas into reality, and we are dedicated to realizing this potential through our projects.

🖥️ **Our Projects:** At Ohao Tech, we take pride in our hands-on approach. Our portfolio boasts a variety of projects, ranging from experimental AI algorithms to innovative computer graphics applications, all designed to challenge the status quo. Each project is a testament to our group's skill, creativity, and dedication to excellence.

🤝 **Collaborate and Grow:** Collaboration is the heart of innovation. We actively seek members who are passionate, skilled, and ready to contribute their unique perspectives. Whether you're a seasoned expert or a budding enthusiast in our fields of interest, Ohao Tech offers a platform to collaborate, learn, and grow.

💡 **Join Us:** If you're excited about making a mark in the worlds of AI, computer graphics, and gaming, we welcome you to join Ohao Tech. Together, we can explore new horizons, develop groundbreaking software, and be part of a community that’s shaping the future of technology.

🔗 **Get Involved:** Start by visiting our [GitHub repository](https://github.com/OhaoTech/) . Here, you’ll find our ongoing projects, resources, and forums for discussion. We encourage you to contribute, whether it’s through code, ideas, or feedback. Your involvement is the key to our collective success.

📣 **Stay Connected:** Follow us on [Discord](https://discord.gg/qgMw386zC8) to stay updated on our latest developments, meetups, and events. We believe in the power of community, and our social platforms are a great way to connect with fellow tech enthusiasts and stay engaged with the group's activities.

🌐 **Explore, Create, Innovate:** With Ohao Tech, the possibilities are endless. We are more than just a group - we are a movement, driven by the passion to create and innovate. Join us in this exciting journey, and let’s make a difference together!

## Repositories


{% if site.data.ohao_repositories.github_repos %}

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% for repo in site.data.ohao_repositories.github_repos %}
    {% include repository/repo.html repository=repo %}
  {% endfor %}
</div>
{% endif %}
