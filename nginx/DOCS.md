# FastAPI Service API Documentation

This document describes the API endpoints for the FastAPI Service.

## 1. Speech to Text Endpoints

### 1.1 `/api/v2/s2t`

**POST**

*   **Summary:** Background Task 1 (Speech to Text).
*   **Operation ID:** `background_task_1_api_v1_s2t_post`
*   **Request Body:**
    *   Content-Type: `multipart/form-data`
    *   Parameters:
        *   `file` (file, optional): The audio file to transcribe.  Either `file` or `url` must be provided.
        *   `url` (string, optional):  The URL of an audio file to transcribe.  Either `file` or `url` must be provided.

*   **Responses:**
    *   `200 OK`: Successful Response (returns an empty JSON object).
    *   `422 Unprocessable Entity`: Validation Error.

### 1.2 `/api/v2/s2t/version2`

**POST**

*   **Summary:** Background Task 2 (Speech to Text - Version 2).
*   **Operation ID:** `background_task_2_api_v1_s2t_version2_post`
*    **Request Body:**
    *   Content-Type: `multipart/form-data`
    *   Parameters:
        *   `file` (file, optional): The audio file to transcribe.  Either `file` or `url` must be provided.
        *   `url` (string, optional):  The URL of an audio file to transcribe.  Either `file` or `url` must be provided.
*   **Responses:**
    *   `200 OK`: Successful Response (returns an empty JSON object).
    *   `422 Unprocessable Entity`: Validation Error.

### 1.3 `/api/v2/s2t/version3`

**POST**

* **Summary:** Background Task 2 (Speech to text - Version 3)
*   **Operation ID:** `background_task_2_api_v1_s2t_version3_post`
*    **Request Body:**
    *   Content-Type: `multipart/form-data`
    *   Parameters:
        *   `file` (file, optional): The audio file to transcribe.  Either `file` or `url` must be provided.
        *   `url` (string, optional):  The URL of an audio file to transcribe.  Either `file` or `url` must be provided.
*   **Responses:**
    *   `200 OK`: Successful Response (returns an empty JSON object).
    *   `422 Unprocessable Entity`: Validation Error.

## 2. Speech Separation Endpoint

### 2.1 `/api/v2/separate`

**POST**

*   **Summary:** Background Task (Speech Separation).  Separates different speakers in an audio file.
*   **Operation ID:** `background_task_api_v1_separate_post`
*   **Request Body:**
    *   Content-Type: `multipart/form-data`
    *   Parameters:
        *   `file` (file, optional): The audio file. Either `file` or `url` should be provided
        *   `url` (string, optional):  The URL of the audio file. Either `file` or `url` should be provided

*   **Responses:**
    *   `200 OK`: Successful Response (returns an empty JSON object).
    *   `422 Unprocessable Entity`: Validation Error.

## 3. Translate Endpoint

### 3.1 `/api/v2/translate/`

**POST**

*   **Summary:** Background Task (Translate).  Translates text.
*   **Operation ID:** `background_task_api_v1_translate__post`
*   **Request Body:**
    *   Content-Type: `application/x-www-form-urlencoded`
    *   Parameters:
        *   `text` (string, default: "xin chào"): The text to translate.

*   **Responses:**
    *   `200 OK`: Successful Response (returns an empty JSON object).
    *   `422 Unprocessable Entity`: Validation Error.

## 4. OCR Endpoint

### 4.1 `/api/v2/ocr`

**POST**

*   **Summary:** Background Task (OCR).  Extracts text from an image.
*   **Operation ID:** `background_task_api_v1_ocr_post`
*   **Request Body:**
    *   Content-Type: `multipart/form-data`
    *   Parameters:
        *   `file` (file, required): The image file.
        *   `language` (string, required): The language of the text in the image (e.g., "en", "vi").

*   **Responses:**
    *   `200 OK`: Successful Response (returns an empty JSON object).
    *   `422 Unprocessable Entity`: Validation Error.

## 5. Text to Speech Endpoints

### 5.1 `/api/v2/t2s/`

**POST**

*   **Summary:** Background Task 1 (Text to Speech).  Converts text to speech.
*   **Operation ID:** `background_task_1_api_v1_t2s__post`
*   **Request Body:**
    *   Content-Type: `application/x-www-form-urlencoded`
    *   Parameters:
        *   `text` (string, required): The text to convert to speech.
        *   `speaker` (string, required): The ID or name of the speaker voice to use.

*   **Responses:**
    *   `200 OK`: Successful Response (returns an empty JSON object).
    *   `422 Unprocessable Entity`: Validation Error.

### 5.2 `/api/v2/t2s/speakers`

**GET**

*   **Summary:** List Speakers.  Retrieves a list of available speaker voices.
*   **Operation ID:** `list_speakers_api_v1_t2s_speakers_get`
*   **Responses:**
    *   `200 OK`: Successful Response (returns a list of speaker objects.  The structure of the speaker objects is not defined in the OpenAPI spec).

## 6. Speaker Identification Endpoints

### 6.1 `/api/v2/identification/train`

**POST**

*   **Summary:** Background Task (Speaker Identification - Train).  Trains the speaker identification model.
*   **Operation ID:** `background_task_api_v1_identification_train_post`
*   **Request Body:**
    *   Content-Type: `application/json`
    *   Parameters:
        *   `files` (array of `FileData` objects, required):  An array of `FileData` objects, each representing an audio file used for training.  A `FileData` object has the following properties:
            *   `id` (string, required): A unique identifier for the file.
            *   `name` (string, required): The name of the file.
            *   `path` (string, required): The path to the file.

*   **Responses:**
    *   `200 OK`: Successful Response (returns an empty JSON object).
    *   `422 Unprocessable Entity`: Validation Error.

### 6.2 `/api/v2/identification`

**POST**

*   **Summary:** Background Task (Speaker Identification - Identify).  Identifies the speaker in an audio file.
*   **Operation ID:** `background_task_api_v1_identification_post`
*    **Request Body:**
    *   Content-Type: `multipart/form-data`
    *   Parameters:
        *    `file` (file, optional): The audio file for speaker identification.
        *   `userID` (string, optional, default: "fa152956-2121-449b-a6e5-39f14b89304a"): The ID of the user to identify.
*   **Responses:**
    *   `200 OK`: Successful Response (returns an empty JSON object).
    *   `422 Unprocessable Entity`: Validation Error.

## 7. Chatbot Endpoint

### 7.1 `/api/v2/chatbot/`

**POST**

*   **Summary:** Background Task (Chatbot).  Interacts with a chatbot.
*   **Operation ID:** `background_task_api_v1_chatbot__post`
*   **Request Body:**
    *    Content-Type: `application/json`
    *   Parameters:
        *   `text` (string, required): The user's input text.
        *   `history` (array of `Promt` objects, required): The conversation history.  A `Promt` object has the following properties:
            *   `role` (string, required): The role of the speaker ("user" or "assistant").
            *   `text` (string, required): The text spoken by the role.

*   **Responses:**
    *   `200 OK`: Successful Response (returns an empty JSON object).
    *   `422 Unprocessable Entity`: Validation Error.

# Chatbot API Documentation

**Endpoint:** `https://api.connectedbrain.com.vn`

## Stream Message Endpoint

**Path:** `/api/v1/chatbot/stream`

**Method:** `POST`

*   **Summary:**  Interacts with a chatbot and receives responses as a *streaming* text/plain output.  This endpoint is designed for real-time, interactive chat sessions.

*   **Request Body:**
    *   Content-Type:  `application/json`
    *    Parameters:
        *   `prompt` (string, required):  The user's input text (the question or statement to the chatbot).  This is now correctly placed *within* the JSON request body.
        * **Example:**
            ```json
            {
              "prompt": "What is the capital of France?",
            }
            ```
*   **Responses:**

    *   `200 OK`: Successful Response.
        *   Content-Type:  `text/plain; charset=utf-8` (This is *crucial* for streaming text.)
        *   Body:  A *stream* of text representing the chatbot's response.  The text will be sent in chunks as it is generated.  There is *no* overall JSON structure to the response body; it is *pure text*.  Clients should process the stream incrementally.  Each chunk *may or may not* be a complete sentence.

    *   `422 Unprocessable Entity`:  Returned for other validation errors (e.g., if the `prompt` exceeds a maximum length, etc. - *These are just examples; the specific validation rules are up to your implementation*).  The response body will be a JSON object following the standard FastAPI validation error format:

        ```json
        {
          "detail": [
            {
              "loc": [
                "body",
                "prompt"
              ],
              "msg": "Prompt is too long",
              "type": "value_error.too_long"
            }
          ]
        }
        ```
    * `500 Internal Server Error`: Returned if any unexpected error happened in server.

## File Upload Endpoint

**Path:** `/api/v1/chatbot/upload`

**Method:** `POST`

*   **Summary:** Uploads a file (or multiple files) for processing by the chatbot. This endpoint likely extracts text from the file(s) and makes it available for subsequent chatbot interactions (e.g., as context for the `/stream` endpoint).  It's *not* a streaming endpoint.
*   **Request Body:**
    *   Content-Type: `multipart/form-data`
    *   Parameters:
        *   `file`:  (file or file array, required):  The file(s) to upload.  Can be a single file or an array of files.  Use the *same* parameter name (`file`) for multiple files.
*   **Responses:**

    *   `200 OK`: Successful Response.
        *   Content-Type: `application/json`
        *   Body:
            ```json
            {
              "status": "completed",
              "full_content": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
            }
            ```
            *   `status` (string):  Indicates the status of the file processing (e.g., "completed", "processing", "failed").
            *   `full_content` (string): The extracted text content from the uploaded file(s).  If multiple files are uploaded, this field likely contains the concatenated text from all files.
    *   `422 Unprocessable Entity`: Returned for validation errors (e.g., file type not supported, file size exceeds limit, etc.). All endpoints may return a `422 Unprocessable Entity` error if the request body is invalid.  The error response will have the following structure:

        ```json
        {
        "detail": [
            {
            "loc": [  // Location of the error (e.g., ["body", "file"])
                "string",
                "integer"
            ],
            "msg": "string",  // Error message
            "type": "string"   // Type of error
            }
        ]
        }
        ```
    *  `500 Internal Server Error`: Returned if any unexpected error happened.

