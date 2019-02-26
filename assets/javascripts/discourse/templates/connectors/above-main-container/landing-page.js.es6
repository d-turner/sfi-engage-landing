import { withPluginApi } from "discourse/lib/plugin-api";

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
  });
  
}

export default {
  setupComponent(args, component) {
    withPluginApi('0.8.8', api => initializePlugin(api, component, args))
  },
};