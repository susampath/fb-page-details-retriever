import axios from 'axios';

const pageId = ''; // Replace with your Facebook Page ID
const accessToken = ''; // Replace with your User Access Token with the 'pages_show_list' permission

/**
 * * Retrieves Facebook Page data based on provided parameters.
 * @async
 * @param {string} pageId - The ID of the Facebook Page.
 * @param {string} accessToken - User Access Token with 'pages_show_list' permission.
 * @param {number|null} [skip=null] - Number of posts to skip.
 * @param {number|null} [limit=null] - Maximum number of posts to retrieve.
 * @param {string|null} [startDate=null] - Start date in 'YYYY-MM-DD' format for filtering posts.
 * @param {string|null} [endDate=null] - End date in 'YYYY-MM-DD' format for filtering posts.
 * @returns {Promise<Array<Object>>} The formatted data of Facebook Page posts.
 */
async function getFBPageData(pageId, accessToken, skip = null, limit = null, startDate = null, endDate = null) {
    try {
        let url = `https://graph.facebook.com/${pageId}/posts?fields=message,attachments`;

        if (skip !== null && limit !== null) {
            url += `&limit=${limit}&offset=${skip}&access_token=${accessToken}`;
        } else if (startDate !== null && endDate !== null) {
            url += `&since=${startDate}&until=${endDate}&access_token=${accessToken}`;
        } else {
            url += `&access_token=${accessToken}`;
        }

        const response = await axios.get(url);
        return formatData(response.data.data);

    } catch (error) {
        console.log(error);
        return [];
    }
}

/**
 * * Formats the data received from Facebook API into a structured format.
 * @param {Array<Object>} data - The data received from Facebook API.
 * @returns {Array<Object>} An array of formatted objects representing Facebook posts.
 */
function formatData(data) {
    try {
        return data.map(dataObj => {
            const responseObj = {
                id: dataObj.id,
                message: dataObj.message || '',
                type: 'Post'
            };

            if (dataObj.attachments && dataObj.attachments.data && dataObj.attachments.data.length > 0) {
                const attachment = dataObj.attachments.data[0];
                const attachmentsObject = {
                    source: attachment.media ? attachment.media.source : '',
                    faceBookLink: attachment.target ? attachment.target.url : ''
                };

                if (attachment.type === 'video_inline') {
                    responseObj.type = 'Video';
                    attachmentsObject.thumbnailHeight = attachment.media ? attachment.media.image.height : '';
                    attachmentsObject.thumbnailWidth = attachment.media ? attachment.media.image.width : '';
                    attachmentsObject.thumbnailImage = attachment.media ? attachment.media.image.src : '';
                } else if (attachment.type === 'photo') {
                    responseObj.type = 'Photo';
                    attachmentsObject.imageHeight = attachment.media ? attachment.media.image.height : '';
                    attachmentsObject.imageWidth = attachment.media ? attachment.media.image.width : '';
                    attachmentsObject.image = attachment.media ? attachment.media.image.src : '';
                } else if (attachment.type === 'profile_media') {
                    responseObj.type = 'Profile Media';
                    responseObj.title = attachment.title || '';
                    attachmentsObject.imageHeight = attachment.media ? attachment.media.image.height : '';
                    attachmentsObject.imageWidth = attachment.media ? attachment.media.image.width : '';
                    attachmentsObject.image = attachment.media ? attachment.media.image.src : '';
                }

                responseObj.attachments = attachmentsObject;
            }

            return responseObj;
        });
    } catch (error) {
        console.log(error);
        return [];
    }
}

(async () => {
    // Skip & Limit Scenario
   console.log(await getFBPageData(pageId, accessToken, 0, 10));
    //Date Range Scenario
   console.log(await getFBPageData(pageId, accessToken, null, null,'2024-01-01','2024-05-01'));
    //All Details Scenario 
    console.log(await getFBPageData(pageId, accessToken, null, null, null, null));
})();
