## Endpoint: https://api.connectedbrain.com.vn

### `/api/v2/s2t/version2`

**POST**

*   **Summary:** Background Task 2 (Speech to Text - Version 2).
*   **Request Body:**
    *   Content-Type: `multipart/form-data`
    *   Parameters:
        *   `file` (file, optional): The audio file to transcribe.  Either `file` or `url` must be provided.
        *   `url` (string, optional):  The URL of an audio file to transcribe.  Either `file` or `url` must be provided.
*   **Responses:**
    *   `200 OK`: Successful Response (returns an empty JSON object).
    *   `422 Unprocessable Entity`: Validation Error.
