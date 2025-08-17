const fetch = require('node-fetch');

exports.handler = async function (event) {
  const url = event.queryStringParameters.url;
  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'URL parameter is required' }),
    };
  }

  try {
    const response = await fetch(`https://hubtemp.p2mate.com/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
        'Origin': 'https://9xbuddy.io',
        'Referer': 'https://9xbuddy.io/',
      },
      body: `url=${encodeURIComponent(url)}`,
    });

    const data = await response.json();

    if (data.status === 'success') {
      // Modify download URLs to use hubcdnhub04.p2mate.com
      data.format = data.format.map(format => ({
        ...format,
        download_url: format.download_url.replace('hubcdnhubtemp.p2mate.com', 'hubcdnhub04.p2mate.com'),
      }));

      return {
        statusCode: 200,
        body: JSON.stringify({
          status: data.status,
          video_uploader: data.video_uploader,
          video_upload_date: data.video_upload_date,
          analyze_time: data.analyze_time,
          video_title: data.video_title,
          video_cover: data.video_cover,
          original_url: data.original_url,
          formats: data.format.map(f => ({
            resolution: f.resolution + 'p',
            download_url: f.download_url,
          })),
        }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Failed to fetch video details' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
