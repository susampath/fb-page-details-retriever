# Facebook Page Data Retrieval

This Node.js script retrieves data from a Facebook Page using the Facebook Graph API and formats it into a structured format.

## Prerequisites

Before running the script, make sure you have the following:

- Node.js installed on your machine
- Access to the Facebook Graph API
- Facebook Page ID and User Access Token with the 'pages_show_list' permission

## Setup

1. Clone this repository to your local machine.
2. Install dependencies by running `npm install`.
3. Replace the placeholders `pageId` and `accessToken` in the code with your actual values.
4. Ensure that your Facebook Access Token has the necessary permissions.
5. Run the script using `node index.js`.

## Usage

The script provides three usage scenarios:

1. **Skip & Limit Scenario**: Retrieves a specified number of posts starting from a given offset.
   ```javascript
   console.log(await getFBPageData(pageId, accessToken, 0, 10));
   ```
2. **Date Range Scenario**: Retrieves posts within a specified date range.
   ```javascript
   console.log(await getFBPageData(pageId, accessToken, null, null, '2024-01-01', '2024-05-01'));
   ```
3. **All Details Scenario**: Retrieves all posts without any filtering.
   ```javascript
   console.log(await getFBPageData(pageId, accessToken));
   ```   



