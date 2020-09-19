# WebRTC B4W Game

This project demonstrates a simple usage of the **WebRTC** technology and the **Blend4Web** framework by creating a first person shooter game for two players which is playable directly in a web browser. 
This project is based on an example from the Blend4Web framework (See "How it works" section). This repository contains only modified files of that example and they need to be copied in the Blend4Web framework (respecting the correct directory structure). For details see the video tutorial below.

## Video overview and tutorial

<div align="left">
      <a href="https://www.youtube.com/watch?v=LnNmS4x_SlI">
         <img src="https://img.youtube.com/vi/LnNmS4x_SlI/0.jpg" style="width:100%;">
      </a>
</div>

## Finished demo
If you don't feel like building the project yourself, it is currently [**hosted online**](https://www.fi.muni.cz/~xmarek8/firstperson/firstperson.html) or you can [**download the ready-to-deploy files**](http://www.mediafire.com/file/la1umlbudi3ehec/b4w_fps_game_resources.zip/file).

## Directory stucture
- [**blend4web_ce/blender/tutorials/firstperson**](https://github.com/10ondr/WebRTC-b4w-game/tree/master/blend4web_ce/blender/tutorials/firstperson) - Modified Blender files.
- [**blend4web_ce/apps_dev/tutorials/firstperson**](https://github.com/10ondr/WebRTC-b4w-game/tree/master/blend4web_ce/apps_dev/tutorials/firstperson) - HTML and Javascript implementing the webpage and logic of the game.

## How it works

### Rendering
All models and animations in the scene were created by using the free and opensource modelling software [**Blender**](https://www.blender.org/). Most of the content (except for the peer capsule and scoreboard) is part of a sample project "firstperson" in the Blend4Web framework.
The [**Blend4Web**](https://www.blend4web.com/en/) framework is a  convenient tool used to transorm the Blender project to WebGL solution so it can be rendered in a web browser. It also has many additional features and capabilities which allows for input handling, audio, etc. It provides the user with a simple API which can be used to access and modify objects in the scene during runtime.

### Networking
**WebRTC** is a way of connecting any two web browsers directly to each other (peer-to-peer) on the internet. There is ofcourse some initial setup and connection establishment which requires a public node (web server with a public IP). In order to bypass this requirement I decided to use the [**PubNub**](https://www.pubnub.com/) service which takes care of this initialization and connects the browsers to each other via its API.
Note: As the clients are communicating directly to each other with no server in the middle, there is no mechanic for "fair play" and the game state and logic is handled directly with the client side Javascript on both ends.

## Establishing a connection

- **First player** - Select "New Game" and enter a game name or leave a default one (auto-generated). Then click "Create Game". 
Note: The game name is needed in order for the second player to connect to the correct session with the first player.
- **Second player** - Select "Join existing game", enter the game name and click "Join Game".

## Game mechanics

Players can shoot at each other and when your opponent is hit, his capsule will turn a bit more red every time. After 5 hits, the capsule turns white again and 1 score point is earned (Can be observed on the ingame 3D scoreboard).

## Controls
- **WASD** - Player movement
- **Left mouse button** - Shoot
- **Right mouse button** - Aim
- **Space** - Jump
- **Shift** - Move slowly
