const axios = require('axios');

const mainUrl = 'https://api.deezer.com';

const getAxios = async (url) => {
  const response = await axios.get(
    url,
    {
      "Access-Control-Allow-Origin": "*",
      withCredentials: true,
    }
  );

  return response;
}

module.exports.searchTracks = async (event) => {
  const query = event.queryStringParameters ; // send query as artistName
  const url = `${mainUrl}/search?q=${query.artistName}`;

  try {
    const response = await getAxios(url);
    return {
      statusCode: 200,
      body: JSON.stringify(response.data.data) // axios data + data in deezer response
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(`${error}`)
    }
  }
};

module.exports.fetchArtistDetails = async (event) => {
  const pathParameters = event.pathParameters;
  const userDetailsUrl = `${mainUrl}/artist/${pathParameters.id}`; // user details 
  const tracksUrl = `${mainUrl}/artist/${pathParameters.id}/top?limit=5`; // top 5 tracks details
  try {
    const [user, tracks] = await Promise.all([
      getAxios(userDetailsUrl),
      getAxios(tracksUrl)
    ]);

    const userData = user.data;
    const tracksData = tracks.data.data // from deezer + axios
    const albums = []
    const allTracks = []

    tracksData?.map(track => {
      allTracks.push(
        {
          title: track.title,
          duration: track.duration
        }
      )

      // push albums
      albums.push({
        name: track.album.title,
        cover: track.album.cover,
      })
    })

    // create response from the details, with tracks, details and albums
    const response = {
      user: {
        name: userData.name,
        profilePicture: userData.picture,
        noOfAlbums: userData.nb_album,
        noOfFans: userData.nb_fan,
      },
      tracks: allTracks,
      albums: albums
    }
    return {
      statusCode: 200,
      body: JSON.stringify(response) // axios data + data in deezer response
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(`${error}`)
    }
  }
}
