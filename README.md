This repository is aim to easy to crate proxy server for VRChat WebSocket<br>
mainly using [vrc-ts](https://github.com/lolmaxz/vrc-ts) to connect with

## Login to Server

send <code>**POST /auth**</code> with username and password in res

## Authorize VRC API

Authorizing by <code>**GET** /vrc/auth</code><br>
If using 2FA, now only supports EmailOTP. <code>**POST** /vrc/auth/eotp</code>

## Use websocket

still WIP. change customURL props to make as proxy server<br>
<code>**GET** /api/ws</code>
