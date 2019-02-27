import { withPluginApi } from "discourse/lib/plugin-api"

// Value are unique to each discourse instance
/***********/
const apiKey = '172d73af3122e6560fae33626f58130741877acfd1a9c8cfd9041a5ebc69fd9b'
const username = 'dturner';
const queryEnd = `?api_key=${apiKey}&api_username=${username}`

const nowOnId = 12
const comingUpId = 13
/***********/

function resolveTopic(topicData) {
  const body = topicData.post_stream.posts[0].cooked;
  let title = startTime = endTime = ''
  let urlLink = ''
  let speakers = []
  let lines = body.split('<br>')
  lines.forEach((text) => {
    let line = text
    line = line.replace('<p>', '')
    line = line.replace('</p>', '')
    line = line.trim();
    if (line.startsWith('Actual URL==' || line.startsWith('URL==') || line.startsWith('url=='))) {
      urlLink = line.split('==')[1].trim();
    } else if (line.startsWith('Start Time==') || line.startsWith('start time==')) {
      startTime = line.split('==')[1].trim()
    } else if (line.startsWith('End Time==') || line.startsWith('end time==')) {
      endTime = line.split('==')[1].trim()
    } else if (line.startsWith('Speakers==') || line.startsWith('speakers==')) {
      speakers = line.split('==')[1].trim().split(',')
      if (speakers.length === 1 && speakers[0] === '') {
        speakers = []
      }
    }
  });
  let result = {}
  result.url = urlLink
  result.startTime = startTime
  result.endTime = endTime
  result.speakers = speakers
  return result;
}

function initializePlugin(api, component) {
  console.log('Initializing...')
  console.log(api)
  console.log(component)
  console.log('Finishing...')
  component.set('showLandingPage', true)
  console.log('--------------------')

  // Show or hide the landing page based on current url
  api.onPageChange((url, title) => {
    console.log('The page changed to: ' + url + ' and title ' + title)
    if (url == '/' || url == '/categories') {
      component.set('showLandingPage', true)
    } else {
      component.set('showLandingPage', false)
    }

    /*
     * every page change you should check if the 'Now on' and 'Coming up' topics have been updated
     */
    // Get the Now On list and update the template
    fetch(`/c/${nowOnId}.json${queryEnd}`)
      .then((res) => {
        return res.json();
      }).then((data) => {
        // console.log('Got results from now on...')
        // console.log(data)
        if (data && data.topic_list) {
          const topics = data.topic_list.topics;
          const topicArray = [];
          const topicPromiseArr = [];
          // for each topic (metadata) that is open in the topic_list get the actual topic text
          for (let i = 0; i < topics.length; i += 1) {
            // if the topic is open and isn't the default 'About the...' topic make a new request
            if (!(topics[i].title.startsWith('About the')) && topics[i].closed === false) {
              topicArray.push(topics[i]);
              const p1 = fetch(`/t/${topics[i].id}.json${queryEnd}`);
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
        console.log('Got all the topic data...')
        console.log(topicDataArray)
        return topicDataArray.each(topicData => resolveTopic(topicData))
      }).then((nowOnTopicData) => {
        console.log('Current "Now On" objects')
        console.log(nowOnTopicDta)
        component.set('liveEvents', [{ name: 'Test 1A' }, { name: 'Test 2A' }, { name: 'Test 3A' }]);
        component.set('nextEvents', [{ name: 'Test 1B' }, { name: 'Test 2B' }, { name: 'Test 3B' }]);
      }).catch((e) => {
        console.log('A "Now On" error occurred: ');
        console.log(e);
      });

    // Get the Coming up list and update the template 
    // ajax(`/c/${comingUpId}.json${queryEnd}`).then((res) => {
    //   console.log('blaaaa not important')
    //   console.log(res)
    //   // Do something with the response 
    //   // getCategoryCallback(res, component, 'live-topics');
    // }).catch((e) => {
    //   console.log('A "Coming Up" error occurred: ');
    //   console.log(e);
    // });
  });

}

export default {
  setupComponent(args, component) {
    withPluginApi('0.8.8', api => initializePlugin(api, component, args))
  },
};