---
layout: about
title: about
permalink: /
---

<div class="dynamic-header">
  <h1 class="glitch" data-text="Shaoxuan Yin">Shaoxuan Yin</h1>
  <p class="subtitle">Master's Student in Computer Science | Graphics & AI Enthusiast</p>
</div>

<div class="profile-container">
  <div class="profile-image">
    <img src="{{ '/assets/img/me_snap.png' | relative_url }}" alt="Shaoxuan Yin" class="avatar">
  </div>
  <div class="profile-info">
    <p class="location"><i class="fas fa-map-marker-alt"></i> Linköpings universitet, Campus Norrköping, Sweden</p>
    <div class="social-links">
      <a href="https://github.com/Qervas" target="_blank"><i class="fab fa-github"></i></a>
      <a href="https://www.linkedin.com/in/shaoxuan-yin-021548170/" target="_blank"><i class="fab fa-linkedin"></i></a>
      <a href="https://www.youtube.com/channel/UCpQsuzZtivtAUV1Xvcpt02w" target="_blank"><i class="fab fa-youtube"></i></a>
      <a href="https://twitter.com/FrankYin17" target="_blank"><i class="fab fa-twitter"></i></a>
    </div>
  </div>
</div>

<section class="about-me">
  <h2 class="section-title">About Me</h2>
  <p>Passionate computer science student with a focus on graphics and AI. Exploring the intersection of technology and creativity to build innovative solutions.</p>
</section>

<section class="education">
  <h2 class="section-title">Education</h2>
  <div class="timeline">
    <div class="timeline-item">
      <div class="timeline-content">
        <h3>Linköping University, Sweden</h3>
        <p>Master of Science in Computer Science</p>
        <p class="date">Sep 2023 - Present</p>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-content">
        <h3>Beijing Information Science & Technology University, China</h3>
        <p>Bachelor of Engineering in Computer Science and Technology</p>
        <p class="date">Sep 2019 - June 2023</p>
      </div>
    </div>
  </div>
</section>

<section class="skills">
  <h2 class="section-title">Skills</h2>
  <div class="skill-categories">
    <div class="skill-category">
      <h3>Programming Languages</h3>
      <div class="skill-tags">
        <span class="skill-tag highlight">C++</span>
        <span class="skill-tag">Python</span>
        <span class="skill-tag">C</span>
        <span class="skill-tag">Java</span>
        <span class="skill-tag">JavaScript</span>
        <span class="skill-tag">Shell</span>
      </div>
    </div>
    <div class="skill-category">
      <h3>Frameworks & Tools</h3>
      <div class="skill-tags">
        <a href="https://github.com/Qervas/Playground/blob/main/Computer_Graphics/OpenGL" class="skill-tag" target="_blank">OpenGL</a>
        <a href="https://github.com/Qervas/Android" class="skill-tag" target="_blank">Android</a>
        <span class="skill-tag">Qt</span>
        <span class="skill-tag">CUDA</span>
        <span class="skill-tag">Three.js</span>
        <span class="skill-tag">Unreal Engine</span>
        <span class="skill-tag">Unity</span>
        <span class="skill-tag">CMake</span>
        <span class="skill-tag">Docker</span>
        <span class="skill-tag">Nginx</span>
      </div>
    </div>
    <div class="skill-category">
      <h3>Languages</h3>
      <div class="skill-tags">
        <span class="skill-tag">Chinese (Native)</span>
        <span class="skill-tag">English (Fluent)</span>
      </div>
    </div>
  </div>
</section>

<section class="projects">
  <h2 class="section-title">Featured Projects</h2>
  <div class="project-grid">
    <div class="project-item">
      <img src="{{ '/projects/image/6_project/robot.png' | relative_url }}" alt="Fighting Robot">
      <div class="project-info">
        <h3>Martial Arts Arena Fighting Robot</h3>
        <p>Award-winning autonomous combat robot. Third prize in the 2019 China Robotics Cup.</p>
        <a href="{{ '/projects/6_project/' | relative_url }}" class="project-link">Learn More</a>
      </div>
    </div>
    <div class="project-item">
      <img src="{{ '/projects/image/5_project/skiing.png' | relative_url }}" alt="Skiing Analysis">
      <div class="project-info">
        <h3>Analysis of Skiing Action</h3>
        <p>Real-time skiing movement classifier using AI, achieving 80% accuracy.</p>
        <a href="{{ '/projects/5_project/' | relative_url }}" class="project-link">Learn More</a>
      </div>
    </div>
    <div class="project-item">
      <img src="{{ '/projects/image/3_project/water.png' | relative_url }}" alt="Water Simulation">
      <div class="project-info">
        <h3>Water Simulation Based on OpenGL</h3>
        <p>Real-time water particle simulation using SPH algorithm and OpenGL.</p>
        <a href="{{ '/projects/3_project/' | relative_url }}" class="project-link">Learn More</a>
      </div>
    </div>
    <div class="project-item">
      <img src="{{ '/projects/image/4_project/retro_vault.png' | relative_url }}" alt="Retro Vault">
      <div class="project-info">
        <h3>Retro Vault</h3>
        <p>2D platform puzzle game built with Unity, featuring character logic and level design.</p>
        <a href="{{ '/projects/4_project/' | relative_url }}" class="project-link">Learn More</a>
      </div>
    </div>
    <div class="project-item">
      <img src="{{ '/assets/img/proj/2_paintbrush/paintbrush.png' | relative_url }}" alt="Paintbrush Magic">
      <div class="project-info">
        <h3>Paintbrush Magic</h3>
        <p>AI-powered art product customization platform using OpenAI API and 3D rendering.</p>
        <a href="{{ '/projects/2_project/' | relative_url }}" class="project-link">Learn More</a>
      </div>
    </div>
    <div class="project-item">
      <img src="{{ '/projects/image/1_project/raytracer.png' | relative_url }}" alt="Monte-Carlo Ray Tracer">
      <div class="project-info">
        <h3>Monte-Carlo Ray Tracer</h3>
        <p>Advanced global illumination renderer with photon mapping and physically-based rendering.</p>
        <a href="{{ '/projects/1_project/' | relative_url }}" class="project-link">Learn More</a>
      </div>
    </div>
  </div>
</section>

<style>
:root {
  --bg-color: #f4f4f4;
  --text-color: #333;
  --header-bg: linear-gradient(45deg, #6a11cb 0%, #2575fc 100%);
  --card-bg: #ffffff;
  --highlight-color: #2575fc;
}

[data-theme="dark"] {
  --bg-color: #121212;
  --text-color: #e0e0e0;
  --header-bg: linear-gradient(45deg, #4a0c8f 0%, #1a5dce 100%);
  --card-bg: #1e1e1e;
  --highlight-color: #bb86fc;
}

body {
  font-family: 'Roboto', sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.dynamic-header {
  text-align: center;
  padding: 2rem 0;
  background: var(--header-bg);
  color: white;
}

.glitch {
  font-size: 3rem;
  font-weight: bold;
  text-transform: uppercase;
  position: relative;
  display: inline-block;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch::before {
  left: 2px;
  text-shadow: -2px 0 #ff00c1;
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-anim 5s infinite linear alternate-reverse;
}

.glitch::after {
  left: -2px;
  text-shadow: -2px 0 #00fff9, 2px 2px #ff00c1;
  animation: glitch-anim2 1s infinite linear alternate-reverse;
}

@keyframes glitch-anim {
  0% {
    clip: rect(31px, 9999px, 94px, 0);
  }
  4.166666667% {
    clip: rect(91px, 9999px, 43px, 0);
  }
  8.333333333% {
    clip: rect(65px, 9999px, 59px, 0);
  }
  12.5% {
    clip: rect(30px, 9999px, 67px, 0);
  }
  16.66666667% {
    clip: rect(75px, 9999px, 67px, 0);
  }
  20.83333333% {
    clip: rect(82px, 9999px, 54px, 0);
  }
  25% {
    clip: rect(93px, 9999px, 91px, 0);
  }
  29.16666667% {
    clip: rect(2px, 9999px, 24px, 0);
  }
  33.33333333% {
    clip: rect(16px, 9999px, 69px, 0);
  }
  37.5% {
    clip: rect(70px, 9999px, 5px, 0);
  }
  41.66666667% {
    clip: rect(75px, 9999px, 9px, 0);
  }
  45.83333333% {
    clip: rect(89px, 9999px, 75px, 0);
  }
  50% {
    clip: rect(90px, 9999px, 76px, 0);
  }
  54.16666667% {
    clip: rect(2px, 9999px, 54px, 0);
  }
  58.33333333% {
    clip: rect(89px, 9999px, 44px, 0);
  }
  62.5% {
    clip: rect(65px, 9999px, 70px, 0);
  }
  66.66666667% {
    clip: rect(25px, 9999px, 5px, 0);
  }
  70.83333333% {
    clip: rect(39px, 9999px, 31px, 0);
  }
  75% {
    clip: rect(56px, 9999px, 72px, 0);
  }
  79.16666667% {
    clip: rect(72px, 9999px, 95px, 0);
  }
  83.33333333% {
    clip: rect(66px, 9999px, 64px, 0);
  }
  87.5% {
    clip: rect(43px, 9999px, 94px, 0);
  }
  91.66666667% {
    clip: rect(46px, 9999px, 6px, 0);
  }
  95.83333333% {
    clip: rect(72px, 9999px, 57px, 0);
  }
  100% {
    clip: rect(60px, 9999px, 35px, 0);
  }
}

@keyframes glitch-anim2 {
  0% {
    clip: rect(65px, 9999px, 91px, 0);
  }
  4.166666667% {
    clip: rect(79px, 9999px, 44px, 0);
  }
  8.333333333% {
    clip: rect(95px, 9999px, 39px, 0);
  }
  12.5% {
    clip: rect(28px, 9999px, 46px, 0);
  }
  16.66666667% {
    clip: rect(23px, 9999px, 94px, 0);
  }
  20.83333333% {
    clip: rect(63px, 9999px, 44px, 0);
  }
  25% {
    clip: rect(57px, 9999px, 67px, 0);
  }
  29.16666667% {
    clip: rect(53px, 9999px, 36px, 0);
  }
  33.33333333% {
    clip: rect(63px, 9999px, 96px, 0);
  }
  37.5% {
    clip: rect(85px, 9999px, 85px, 0);
  }
  41.66666667% {
    clip: rect(82px, 9999px, 4px, 0);
  }
  45.83333333% {
    clip: rect(92px, 9999px, 67px, 0);
  }
  50% {
    clip: rect(14px, 9999px, 30px, 0);
  }
  54.16666667% {
    clip: rect(66px, 9999px, 68px, 0);
  }
  58.33333333% {
    clip: rect(72px, 9999px, 10px, 0);
  }
  62.5% {
    clip: rect(13px, 9999px, 23px, 0);
  }
  66.66666667% {
    clip: rect(30px, 9999px, 56px, 0);
  }
  70.83333333% {
    clip: rect(61px, 9999px, 98px, 0);
  }
  75% {
    clip: rect(13px, 9999px, 34px, 0);
  }
  79.16666667% {
    clip: rect(38px, 9999px, 22px, 0);
  }
  83.33333333% {
    clip: rect(2px, 9999px, 98px, 0);
  }
  87.5% {
    clip: rect(61px, 9999px, 96px, 0);
  }
  91.66666667% {
    clip: rect(78px, 9999px, 52px, 0);
  }
  95.83333333% {
    clip: rect(88px, 9999px, 21px, 0);
  }
  100% {
    clip: rect(28px, 9999px, 99px, 0);
  }
}

.subtitle {
  font-size: 1.2rem;
  margin-top: 1rem;
}

.profile-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
}

.profile-image img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--highlight-color);
}

.profile-info {
  margin-left: 2rem;
}

.social-links a {
  color: var(--highlight-color);
  font-size: 1.5rem;
  margin-right: 1rem;
  transition: color 0.3s ease;
}

.social-links a:hover {
  color: var(--primary-color);
}

.section-title {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 50px;
  height: 3px;
  background-color: var(--highlight-color);
}

.timeline {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

.timeline::after {
  content: '';
  position: absolute;
  width: 6px;
  background-color: var(--highlight-color);
  top: 0;
  bottom: 0;
  left: 50%;
  margin-left: -3px;
}

.timeline-item {
  padding: 10px 40px;
  position: relative;
  background-color: inherit;
  width: 50%;
}

.timeline-item::after {
  content: '';
  position: absolute;
  width: 25px;
  height: 25px;
  right: -17px;
  background-color: var(--bg-color);
  border: 4px solid var(--highlight-color);
  top: 15px;
  border-radius: 50%;
  z-index: 1;
}

.timeline-item:nth-child(odd) {
  left: 0;
}

.timeline-item:nth-child(even) {
  left: 50%;
}

.timeline-item:nth-child(even)::after {
  left: -16px;
}

.timeline-content {
  padding: 20px 30px;
  background-color: var(--card-bg);
  position: relative;
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.skills {
  margin-bottom: 2rem;
}

.skill-categories {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skill-category h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: var(--global-theme-color);
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  background-color: var(--global-bg-color);
  color: var(--global-text-color);
  padding: 0.3rem 0.6rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  border: 1px solid var(--global-theme-color);
  transition: all 0.3s ease;
}

.skill-tag.highlight {
  background-color: var(--global-theme-color);
  color: var(--global-bg-color);
}

a.skill-tag {
  text-decoration: none;
}

a.skill-tag:hover, .skill-tag:hover {
  background-color: var(--global-theme-color);
  color: var(--global-bg-color);
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 2rem;
}

.project-item {
  background-color: var(--card-bg);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.project-item:hover {
  transform: translateY(-5px);
}

.project-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.project-info {
  padding: 1rem;
}

.project-info h3 {
  margin-top: 0;
  color: var(--primary-color);
}

.project-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--highlight-color);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.project-link:hover {
  background-color: var(--primary-color);
}
</style>

<script>
document.addEventListener('DOMContentLoaded', (event) => {
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const body = document.body;

  darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
  });

  if (localStorage.getItem('darkMode') === 'true') {
    body.classList.add('dark-mode');
  }
});
</script>