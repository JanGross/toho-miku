# API Documentation

## Introduction

This API provides CRU (Create, Read, Update) operations for various models.

The API requires an API key for some operations. 

The endpoints provided by this API are:

## Generic:
- / - List all routes (JSON Response)
- /ping - Returns pong
- /stats - Simple stats about the bot (Record counts and uptime)
- /most-recent-drop - Returns the most recent drop (Requires API Key)

## For characters:
- [`/characters`](api/characters.md#get-characters)
- [`/characters/:character_id`](api/characters.md#get-characterscharacter_id)

## For groups:
_TODO_

## For Badges:
_TODO_