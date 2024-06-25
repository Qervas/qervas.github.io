---
layout: post
title:  NexusPlay Project Proposal
date: 2024-04-01 15:23
description: An Interactive Game Hub
tags: Web
categories: Tech
thumbnail: assets/img/proj/1_nexus/nexus.png
---
## Project Overview

**This proposal outlines the development of an online game hub featuring a multiplayer shooter game. The platform will incorporate a chat room, user authentication, friend system, and game lobbies. This document specifies the technical approach, focusing on creating a robust, interactive web application using modern web technologies.**

## Technical Specifications

### Core Features

* **User Authentication**: Secure login functionality using Google and Apple accounts.
* **Chat Room**: Real-time communication features with different channels (World, Friends, Lobby) for users to interact.
* **Friend System**: Ability for users to add friends and manage their friend list.
* **Game Lobbies**: Users can create temporary lobbies for playing games or for matchmaking purposes.
* **Online Multiplayer Game**: A shooter game where players can join lobbies to play. The game will support reconnection in case of dropout.

### Tech Stack

#### Frontend

* **Framework**: React with Next.js - This combination provides a powerful, efficient framework for building user interfaces with server-side rendering capabilities for improved performance and SEO.
* **Language**: TypeScript - Offers type safety, enhancing code quality and maintainability.
* **Real-Time Communication**: Socket.IO - For implementing real-time chat functionality and live updates within the game.
* **Game Development**: Three.js - For rendering 3D graphics in the web browser, to be used in the development of the multiplayer shooter game.

#### Backend

* **Server Framework**: Express.js - A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
* **Database**: MongoDB - A NoSQL database ideal for handling dynamic data and real-time updates, which will be used to store user profiles, chat messages, and game data.

#### Authentication

* **OAuth 2.0**: Integration of Google and Apple Sign-In for secure authentication, leveraging libraries such as Passport.js to streamline the authentication process on the backend.

### Development Phases

#### Phase 1: User Authentication and Chat Room

1. **User Authentication**: Implement OAuth 2.0 authentication with Google and Apple, ensuring secure and convenient user login.
2. **Chat Room Setup**: Develop the real-time chat functionality using Socket.IO, allowing users to communicate in different channels: World, Friends, Lobby.
3. **Database Integration**: Set up MongoDB to store user data, friend lists, and chat messages.

#### Phase 2: Friend System and Game Lobbies

1. **Friend System**: Enable users to send and accept friend requests, view their friend list, and manage friendships.
2. **Lobby Creation**: Allow users to create and join temporary lobbies for social interaction or for preparing to play games together.

#### Phase 3: Online Multiplayer Game

1. **Game Development**: Utilize Three.js for developing the 3D multiplayer shooter game, focusing on gameplay mechanics, character controls, and graphics rendering.
2. **Matchmaking and Gameplay**: Implement game lobbies and matchmaking logic, ensuring players can join games and play with or against friends.
3. **Reconnection Logic**: Develop a robust system to handle user reconnections, preserving game state and ensuring a seamless experience for users who experience temporary network issues.

By leveraging modern web technologies such as React, Next.js, TypeScript, Express.js, MongoDB, Socket.IO, and Three.js, the project aims to deliver a high-quality, interactive web application that meets the course's rigorous requirements and provides a unique platform for gamers to connect and play.
