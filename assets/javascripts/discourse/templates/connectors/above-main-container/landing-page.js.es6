import { withPluginApi } from "discourse/lib/plugin-api";
import {ajax} from 'discourse/lib/ajax';

// Value are unique to each discourse instance
/***********/
const apiKey = '172d73af3122e6560fae33626f58130741877acfd1a9c8cfd9041a5ebc69fd9b';
const username = 'dturner';
const queryEnd = `?api_key=${apiKey}&api_username=${username}`;

const nowOnId = 12
const comingUpId =13
/***********/

function resolveTopic(res) {
  const body = res.post_stream.posts[0].cooked;
  let title = startTime = endTime = '';
  let urlLink = '';
  let speakers = [];
  let lines = body.split('<br>');
  lines.forEach((text) => {
    let line = text;
    line = line.replace('<p>', '');
    line = line.replace('</p>', '');
    line = line.trim();
    if (line.startsWith('Actual URL==' || line.startsWith('URL==') || line.startsWith('url=='))) {
      urlLink = line.split('==')[1].trim();
    }
    else if (line.startsWith('Start Time==') || line.startsWith('start time==')) {
      startTime = line.split('==')[1].trim();
    }
    else if (line.startsWith('End Time==') || line.startsWith('end time==')) {
      endTime = line.split('==')[1].trim();
    }
    else if (line.startsWith('Speakers==') || line.startsWith('speakers==')) {
      speakers = line.split('==')[1].trim().split(',');
      if (speakers.length === 1 && speakers[0] === '') {
        speakers = [];
      }
    }
  });
  let result = {};
  result.url = urlLink;
  result.startTime = startTime;
  result.endTime = endTime;
  result.speakers = speakers;
  return result;
}

function getCategoryCallback(data) {
  const arr = [];
  if (data && data.topic_list) {
    const topics = data.topic_list.topics;
    const topicPromiseArr = [];
    for (let i = 0; i < topics.length; i += 1) {
      if (!(topics[i].title.startsWith('About the')) && topics[i].closed === false) {
        arr.push(topics[i]);
        const p1 = ajax(`/t/${topics[i].id}.json${queryEnd}`);
        topicPromiseArr.push(p1);
      }
    }
    return Promise.all(topicPromiseArr).then((values) => {
      values.forEach((value) => {
        return resolveTopic(value);
      });
    }).then((finalResults) => {
      console.log('Final Results: ' + finalResults)
      // component.set(componentString, finalResult);
      return finalResult;
    }).catch((e) => {
      console.log('Promise error:');
      console.log(e);
    });
  }
}

function initializePlugin(api, component) {
  console.log('Initializing...')
  console.log(api)
  console.log(component)
  console.log('Finishing...')
  component.set('showLandingPage', true)
  component.set('liveEvents', [{ name: 'Test 1A' }, { name: 'Test 2A' }, { name: 'Test 3A' }]);
  component.set('nextEvents', [{ name: 'Test 1B' }, { name: 'Test 2B' }, { name: 'Test 3B' }]);
  console.log('--------------------')
  
  // Show or hide the landing page based on current url
  api.onPageChange((url, title) => {
    console.log('The page changed to: ' + url + ' and title ' + title)
    if (url == '/' || url == '/categories') {
      component.set('showLandingPage', true)
    } else {
      component.set('showLandingPage', false)
    }
    ``
    /*
    * every page change you should check if the 'Now on' and 'Coming up' topics have been updated
    */
    // Get the Now On list and update the template
    ajax(`/c/${nowOnId}.json${queryEnd}`).then((res) => {
      // Do something with the response
      getCategoryCallback(res).then((results) => {
        console.log('Got results from now on...')
        console.log(results)
      });
    }).catch((e) => {
      console.log('A "Now On" error occurred: ');
      console.log(e);
    });

    // Get the Coming up list and update the template 
    ajax(`/c/${comingUpId}.json${queryEnd}`).then((res) => {
      console.log('blaaaa not important')
      console.log(res)
      // Do something with the response 
      // getCategoryCallback(res, component, 'live-topics');
    }).catch((e) => {
      console.log('A "Coming Up" error occurred: ');
      console.log(e);
    });
  });
  
}

export default {
  setupComponent(args, component) {
    withPluginApi('0.8.8', api => initializePlugin(api, component, args))
  },
};