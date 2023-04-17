# Character endpoints

# GET /characters

Retrieves a list of Characters.

#### Query Parameters

- `include_disabled` (optional, boolean): If set to `true`, disabled characters will also be returned.  
(Requires API Key)

## Response
### Success Response

- Status Code: `200`
- Content-Type: `application/json`

Returns an array of Character objects. Each object contains the following fields:

- `id` (integer): The ID of the character.
- `name` (string): The name of the character.
- `description` (string): A description of the character.
- `enabled` (boolean): A flag indicating whether the character is enabled.
- `createdAt` (string): The date and time when the character was created.
- `updatedAt` (string): The date and time when the character was last updated.
- `GroupId` (integer): The ID of the group that the character belongs to.

#### Error Response

- Status Code: `500`
- Content-Type: `application/json`

Returns an object containing an error message.
</details>
<details><summary>Example</summary>

Request:
```
GET /characters
```
Response:  
```json
[
    {
        "id": 1,
        "name": "GUMI",
        "groupId": 2,
        "imageIdentifier": "vocaloid/gumi.jpg",
        "description": "A Vocaloid created by INTERNET Co. based on the voice of Megumi Nakajima.",
        "enabled": true,
        "createdAt": "2022-09-07T13:27:17.000Z",
        "updatedAt": "2023-01-12T18:52:03.000Z",
        "GroupId": 2
    },
    {
        "id": 2,
        "name": "IA",
        "groupId": 2,
        "imageIdentifier": "vocaloid/ia.jpg",
        "description": "IA is a character and voice created by 1st Place for the Vocaloid 3 speech synthesizer software. She was released in January 2012, and made her video game in 2013's Demon Gaze, providing the vocals for the game's soundtrack as well being a recruitable party member via DLC.",
        "enabled": true,
        "createdAt": "2022-09-07T13:27:17.000Z",
        "updatedAt": "2023-01-12T18:52:03.000Z",
        "GroupId": 2
    }
]

```
</details>


# POST /characters

Creates a new character.

### Request Headers
The request headers should include an `Authorization` header with a valid API Key.

### Request Body
The request body should be a JSON object that contains the following fields:
- `name` (required, string): The name of the character.
- `groupId` (required, integer): The ID of the group that the character belongs to.
- `imageIdentifier` (required, string): The identifier of the character's image file.
- `description` (optional, string): A description of the character. 

## Response
### Success Response
- Status Code: `201`
- Content-Type: `application/json`

Returns an object containing the following fields:
- `message` (string): A success message.
- `character` (object): The created Character object.

### Error Response
- Status Code: `500`
- Content-Type: `application/json`

Returns an object containing the following fields:
- `message` (string): An error message.
- `error` (object): The error object.

<details><summary>Example</summary>

Request:
```json
POST /characters
Content-Type: application/json

{
    "name": "GUMI",
    "groupId": 2,
    "imageIdentifier": "vocaloid/gumi.jpg",
    "description": "A Vocaloid created by INTERNET Co. based on the voice of Megumi Nakajima."
}
```
Response:  
```json
{
  "message": "Character created successfully.",
  "character": {
    "id": 1,
    "name": "John Doe",
    "description": "A mysterious and enigmatic character.",
    "enabled": false,
    "createdAt": "2023-04-17T12:00:00.000Z",
    "updatedAt": "2023-04-17T12:00:00.000Z",
    "GroupId": null
  }
}
```
</details>

# GET /characters/:character_id

Returns a single character.

## Response
### Success Response

- Status Code: `200`
- Content-Type: `application/json`

Returns an object of a Character with the following fields:

- `id` (integer): The ID of the character.
- `name` (string): The name of the character.
- `description` (string): A description of the character.
- `enabled` (boolean): A flag indicating whether the character is enabled.
- `createdAt` (string): The date and time when the character was created.
- `updatedAt` (string): The date and time when the character was last updated.
- `GroupId` (integer): The ID of the group that the character belongs to.

#### Error Response

- Status Code: `500`
- Content-Type: `application/json`

Returns an object containing an error message.
</details>
<details><summary>Example</summary>

Request:
```
GET /characters/1
```
Response:  
```json
{
    "id": 1,
    "name": "GUMI",
    "groupId": 2,
    "imageIdentifier": "vocaloid/gumi.jpg",
    "description": "A Vocaloid created by INTERNET Co. based on the voice of Megumi Nakajima.",
    "enabled": true,
    "createdAt": "2022-09-07T13:27:17.000Z",
    "updatedAt": "2023-01-12T18:52:03.000Z",
    "GroupId": 2
}
```
</details>

# PUT /characters/:character_id

Updates an existing character.

### Endpoint
`/characters/:character_id`

- `:character_id` (integer): The ID of the character to update.

### Request Headers
The request headers should include an `Authorization` header with a valid API Key.

### Request Body
The request body should be a JSON object that contains the fields to be updated.

<details><summary>Example</summary>

Request:
```json
PUT /characters/1
Content-Type: application/json

{
    "imageIdentifier": "vocaloid/gumi_new.jpg",
    "description": "An updated description. Lorem ipsum dolor sit kebab"
}
```
Response:  
```json
{
    "message": "Character updated successfully."
}
```
</details>