const axios = require('axios');
const config = require('../config');
const constants = require('./constants');

function getTeamGames(req, res) {
  console.log('[GET] /lol-team-games');
  const memory = req.body.conversation.memory
  const team = memory['team-name'];
  const teamId = constants.getTeamId(team.value);

  console.log('=================TEAMID=====================')
  console.log(teamId)
  console.log('=================TEAMID=====================')

  if (memory['next']) {
    return futureTeamGamesApiCall(teamId)
      .then(apiResultToCarousselle)
      .then(function(carouselle) {
        res.json({
          replies: carouselle,
        });
      })
      .catch(function(err) {
        console.error('getTeamGames::getGames error: ', err);
      });
  } else {
    return pastTeamGamesApiCall(teamId)
      .then(apiResultToCarousselle)
      .then(function(carouselle) {
        res.json({
          replies: carouselle,
        });
      })
      .catch(function(err) {
        console.error('getTeamGames::getGames error: ', err);
      });
  }
}

function futureTeamGamesApiCall(teamId) {
  return axios.get(`https://api.pandascore.co/teams/${teamId}/matches`, {
    headers: {
        Authorization: `Bearer ${config.PANDA_TOKEN}`
    },
    params: {
      'filter[future]': true,
      'sort': 'begin_at',
    },
  })
  .catch(function(error) {
    console.log('---------ERROR-----------')
    console.log(error)
    console.log('---------ERROR-----------')
      return null
  });
}

function pastTeamGamesApiCall(teamId) {
  return axios.get(`https://api.pandascore.co/teams/${teamId}/matches`, {
    headers: {
        Authorization: `Bearer ${config.PANDA_TOKEN}`
    },
    params: {
      'filter[past]': true,
      'sort': '-begin_at',
    },
  })
  .catch(function(error) {
    console.log('---------ERROR-----------')
    console.log(error)
    console.log('---------ERROR-----------')
      return null
  });
}

function apiResultToCarousselle(results) {
  console.log('---------RESULTS-----------')
  console.log(results)
  console.log('---------RESULTS-----------')
  if (results === null || results.data.length === 0) {
    return [
      {
        type: 'quickReplies',
        content: {
          title: 'Sorry, but I could not find any results for your request :(',
          buttons: [{ title: 'Start over', value: 'What can you do?' }],
        },
      },
    ];
  }

  const cards = results.data.slice(0, 10).map(e => ({
    title: e.name.replace(/-/g, ' '),
    subtitle: moment(e.begin_at).format('dddd, MMM Do YYYY, h:mm a') || 'Date to be determined',
    imageUrl: e.league.image_url,
    buttons: [
      {
        type: 'postback',
        value: `Get me some information about ${e.opponents[0].opponent.acronym}`,
        title: `More about ${e.opponents[0].opponent.acronym}`,
      },
      {
        type: 'postback',
        value: `Get me some information about ${e.opponents[1].opponent.acronym}`,
        title: `More about ${e.opponents[1].opponent.acronym}`,
      },
    ],
  }));

  return [
    { type: 'text', content: "Here's what I found for you!"},
    { type: 'carousel', content: cards },
  ];
}

module.exports = {
  getTeamGames,
};
