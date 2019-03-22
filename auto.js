const fetch = require('node-fetch');
// Value are unique to each discourse instance
/***********/
const url = 'https://www.sfiengage.ie'
const apiKey = '143c5560edd56dfe19bf4cf462b499fb00bea72cb8ba89bac6a5679d303672c7'
const username = 'Matthew.Nicholson';
const queryEnd = `?api_key=${apiKey}&api_username=${username}`

const eventDate = 7
const nowOnId = 12
const comingUpId = 13
const finishedId = 18

function resolveTopic(topicData) {
  const body = topicData.post_stream.posts[0].cooked;
  let startTime = ''
  let endTime = ''
  let lines = body.split('<br>')
  lines.forEach((text) => {
    let line = text
    line = line.replace('<p>', '')
    line = line.replace('</p>', '')
    line = line.trim();
    if (line.startsWith('Start Time==') || line.startsWith('start time==')) {
      startTime = line.split('==')[1].trim()
      let now = new Date()
      let tmp = startTime.split('am')[0]
      let hours = tmp.split('.')[0]
      let minutes = tmp.split('.')[1]
      now.setDate(eventDate)
      now.setHours(hours);
      now.setMinutes(minutes);
      now.setSeconds(0, 0)
      let topicTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      // console.log(title + ' time: ', topicTime.toUTCString())
      console.log(topicTime)
      let timeNow = new Date()
      console.log('Time now: ', timeNow.toUTCString())
      console.log(timeNow)
      console.log('Difference:', (timeNow - topicTime) / 1000 / 60 / 60)
      if ((timeNow - topicTime) >= 0) {
        console.log('HERE', `${url}/t/${topicData.slug}/${topicData.id}.json${queryEnd}`)
        fetch(`${url}/t/${topicData.slug}/${topicData.id}.json${queryEnd}`, {
          method: "PUT", // *GET, POST, PUT, DELETE, etc.
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "category_id": nowOnId,
            "title": topicData.title,
          }), // body data type must match "Content-Type" header
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.log(error))
      }
    }
  });
  let result = {}
  return result;
}

function getCategoryTopics(eventId) {
  // Get the category list and check the times
  fetch(`${url}/c/${eventId}.json${queryEnd}`)
  .then((res) => {
    return res.json();
  }).then((data) => {
    if (data && data.topic_list) {
      const topics = data.topic_list.topics;
      const topicArray = [];
      const topicPromiseArr = [];
      // for each topic (metadata) that is open in the topic_list get the actual topic text
      for (let i = 0; i < topics.length; i += 1) {
        // if the topic is open and isn't the default 'About the...' topic make a new request
        if (!(topics[i].title.startsWith('About the')) && topics[i].closed === false) {
          topicArray.push(topics[i]);
          const p1 = fetch(`${url}/t/${topics[i].id}.json${queryEnd}`);
          topicPromiseArr.push(p1);
        }
      }
      return Promise.all(topicPromiseArr).then((topicResponses) => {
        return Promise.all(topicResponses.map(singleTopicResponse => singleTopicResponse.json()))
      })
    } else {
      return [];
    }
  }).then((topicDataArray) => {
    // return topicDataArray.forEach(topicData => resolveTopic(topicData))
    const resultsData = topicDataArray.map(topicData => resolveTopic(topicData))
    return resultsData;
  }).then((finalTopicData) => {
    console.log('Final Topic Data')
    console.log(finalTopicData)
  }).catch((e) => {
    console.log('A "update landingPage()" error occurred: ');
    console.log(e);
  });
}


function resolveDeadTopic(topicData) {
  const body = topicData.post_stream.posts[0].cooked;
  let endTime = ''
  let lines = body.split('<br>')
  lines.forEach((text) => {
    let line = text
    line = line.replace('<p>', '')
    line = line.replace('</p>', '')
    line = line.trim();
    if (line.startsWith('End Time==') || line.startsWith('end time==')) {
      endTime = line.split('==')[1].trim()
      let now = new Date()
      let tmp = endTime.split('am')[0]
      let hours = tmp.split('.')[0]
      let minutes = tmp.split('.')[1]
      now.setDate(eventDate)
      now.setHours(hours);
      now.setMinutes(minutes);
      now.setSeconds(0, 0)
      let topicTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      // console.log(title + ' time: ', topicTime.toUTCString())
      console.log(topicTime)
      let timeNow = new Date()
      console.log('Time now: ', timeNow.toUTCString())
      console.log(timeNow)
      console.log('DEAD.....')
      console.log('Difference:', (timeNow - topicTime) / 1000 / 60 / 60)
      if ((timeNow - topicTime) >= 0) {
        console.log('HERE', `${url}/t/${topicData.slug}/${topicData.id}.json${queryEnd}`)
        fetch(`${url}/t/${topicData.slug}/${topicData.id}.json${queryEnd}`, {
          method: "PUT", // *GET, POST, PUT, DELETE, etc.
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "category_id": finishedId,
            "title": topicData.title,
          }), // body data type must match "Content-Type" header
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.log(error))
      }
    }
  });
  let result = {}
  return result;
}

function closeDeadTopics(eventId) {
  // Get the category list and check the times
  fetch(`${url}/c/${eventId}.json${queryEnd}`)
  .then((res) => {
    return res.json();
  }).then((data) => {
    if (data && data.topic_list) {
      const topics = data.topic_list.topics;
      const topicArray = [];
      const topicPromiseArr = [];
      // for each topic (metadata) that is open in the topic_list get the actual topic text
      for (let i = 0; i < topics.length; i += 1) {
        // if the topic is open and isn't the default 'About the...' topic make a new request
        if (!(topics[i].title.startsWith('About the')) && topics[i].closed === false) {
          topicArray.push(topics[i]);
          const p1 = fetch(`${url}/t/${topics[i].id}.json${queryEnd}`);
          topicPromiseArr.push(p1);
        }
      }
      return Promise.all(topicPromiseArr).then((topicResponses) => {
        return Promise.all(topicResponses.map(singleTopicResponse => singleTopicResponse.json()))
      })
    } else {
      return [];
    }
  }).then((topicDataArray) => {
    // return topicDataArray.forEach(topicData => resolveTopic(topicData))
    const resultsData = topicDataArray.map(topicData => resolveDeadTopic(topicData))
    return resultsData;
  }).then((finalTopicData) => {
    console.log('Final Topic Data')
    console.log(finalTopicData)
  }).catch((e) => {
    console.log('A "update landingPage()" error occurred: ');
    console.log(e);
  });
}

closeDeadTopics(nowOnId)
getCategoryTopics(comingUpId)
