const express = require('express');
const app = express();
const path = require('path');
const querylimit = process.env.QUERY_LIMIT || 10;

app.use(express.static(path.join(__dirname, 'public_html')));

app.get('/search', async (req, res) => {
  if (req.query.q) {
    try {
      const searchTerm = req.query.q;
      const limit = req.query.limit || querylimit;
      //const yandexGamesApiUrl = `https://yandex.com/games/api/catalogue/v3/search/?query=${searchTerm}&games_count=${limit}`;
      //const yandexGamesApiResponse = await fetch(yandexGamesApiUrl);
      //if (!yandexGamesApiResponse.ok) {
      //  throw new Error(`Failed to fetch data from Yandex Games API (${yandexGamesApiResponse.status} ${yandexGamesApiResponse.statusText})`);
      //}
      //const yandexGamesResponseJson = await yandexGamesApiResponse.json();
      //if (!yandexGamesResponseJson || !yandexGamesResponseJson.feed || !Array.isArray(yandexGamesResponseJson.feed)) {
      //  throw new Error('Unexpected response format from Yandex Games API');
      //}
      //const searchResultsYandexGames = yandexGamesApiResponse.json().then(response => {
      //  return response.feed[0].items.map(item => ({
      //    title: item.title,
      //    directGame: `https://yandex.com/games/app/${item.appID}`,
      //    cover: item.media.cover['prefix-url'],
      //    rating: item.rating,
      //  }));
      //});
      const crazyGamesApiUrl = `https://api.crazygames.com/v3/en_US/search?q=${searchTerm}&limit=${limit}&includeTopGames=true`;
      const crazyGamesApiResponse = await fetch(crazyGamesApiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        },
      });
      if (!crazyGamesApiResponse.ok) {
        throw new Error(`Failed to fetch data from CrazyGames API (${crazyGamesApiResponse.status} ${crazyGamesApiResponse.statusText})`);
      }
      const crazyGamesResponseJson = await crazyGamesApiResponse.json();
      if (!crazyGamesResponseJson || !crazyGamesResponseJson.result || !Array.isArray(crazyGamesResponseJson.result)) {
        throw new Error('Unexpected response format from CrazyGames API');
      }
      const searchResultsCrazyGames = crazyGamesResponseJson.result
        .filter(result => result.recordType !== 'tag')
        .map(result => ({
          title: result.name,
          directGame: `https://games.crazygames.com/en-US/${result.slug}/index.html`,
          cover: `https://images.crazygames.com/${result.cover}`,
          mobileFriendly: result.mobileFriendly,
        }));

      const flashpointApiUrl = `https://db-api.unstable.life/search?smartSearch=${searchTerm}&filter=true&fields=id,title,developer,publisher,platform,tags,originalDescription`;
      const flashpointApiResponse = await fetch(flashpointApiUrl);
      if (!flashpointApiResponse.ok) {
        throw new Error(`Failed to fetch data from Flashpoint API (${flashpointApiResponse.status} ${flashpointApiResponse.statusText})`);
      }
      const flashpointResponseJson = await flashpointApiResponse.json();
      if (!flashPointResponseJson || !Array.isArray(flashpointResponseJson)) {
        throw new Error('Unexpected response format from Flashpoint API');
      }
      const searchResultsFlashpoint = flashpointResponseJson
        .filter(result => result.platform === 'Flash')
        .map(result => ({
          id: result.id,
          title: result.title,
          developer: result.developer,
          publisher: result.publisher,
          cover: `https://infinity.unstable.life/images/Logos/${result.id.substring(0,2)}/${result.id.substring(2,4)}/${result.id}.png?type=jpg`
        }));
      //const combinedResults = [...searchResultsYandexGames, ...searchResultsCrazyGames, ...searchResultsFlashpoint];
      res.json(searchResultsFlashpoint);
    } catch (error) {
      console.error('Error fetching search results:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.redirect('/');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running http://localhost:${PORT}`);
});