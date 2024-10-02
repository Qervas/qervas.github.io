---
layout: page
title: projects
permalink: /projects/
description: A growing collection of my projects.
nav: true
nav_order: 2
display_categories: [graphics, AI, game, robot]
---

<div class="projects-container">
  {%- for category in page.display_categories %}
    <section class="project-category">
      <h2 class="category-title">{{ category }}</h2>
      <div class="project-scroll">
        {%- assign categorized_projects = site.projects | where: "category", category -%}
        {%- for project in categorized_projects %}
          <div class="project-card">
            <img src="{{ project.img | relative_url }}" alt="{{ project.title }}" class="project-image">
            <div class="project-info">
              <h3>{{ project.title }}</h3>
              <p>{{ project.description }}</p>
              <a href="{{ project.url | relative_url }}" class="project-link">Learn More</a>
            </div>
          </div>
        {%- endfor %}
      </div>
    </section>
  {%- endfor %}
</div>

<style>
  .projects-container {
    width: 100%;
    overflow-x: hidden;
  }
  .project-category {
    margin-bottom: 40px;
  }
  .category-title {
    display: inline-block;
    padding: 10px 20px;
    font-size: 24px;
    font-weight: bold;
    color: #fff;
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    border-radius: 30px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 20px;
  }
  .project-scroll {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    padding: 20px 0;
  }
  .project-card {
    flex: 0 0 auto;
    width: 300px;
    margin-right: 20px;
    scroll-snap-align: start;
    background: white;
    border-radius: 15px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .project-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.2);
  }
  .project-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  .project-info {
    padding: 20px;
  }
  .project-info h3 {
    margin-top: 0;
    font-size: 20px;
    color: #333;
  }
  .project-link {
    display: inline-block;
    margin-top: 15px;
    padding: 8px 15px;
    background: linear-gradient(45deg, #4ecdc4, #45b7af);
    color: white;
    text-decoration: none;
    border-radius: 25px;
    font-weight: bold;
    transition: background 0.3s ease;
  }
  .project-link:hover {
    background: linear-gradient(45deg, #45b7af, #4ecdc4);
  }
  .project-scroll::-webkit-scrollbar {
    height: 8px;
  }
  .project-scroll::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  .project-scroll::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }
  .project-scroll::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
</style>

<script>
  document.addEventListener('DOMContentLoaded', () => {
    const scrollContainers = document.querySelectorAll('.project-scroll');
    
    scrollContainers.forEach(container => {
      let isDown = false;
      let startX;
      let scrollLeft;

      container.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
      });

      container.addEventListener('mouseleave', () => {
        isDown = false;
      });

      container.addEventListener('mouseup', () => {
        isDown = false;
      });

      container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2;
        container.scrollLeft = scrollLeft - walk;
      });
    });
  });
</script>