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

