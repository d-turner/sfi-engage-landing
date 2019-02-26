import { withPluginApi } from "discourse/lib/plugin-api";

function initializePlugin(api, component) {
  console.log('Initializing...')
  console.log(api)
  console.log(component)
  console.log('Finishing...')
  console.log('--------------------')
  component.set('showLandingPage', true);
}

export default {
  setupComponent(args, component) {
    withPluginApi('0.8.8', api => initializePlugin(api, component, args));
  },
};