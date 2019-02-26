import { withPluginApi } from "discourse/lib/plugin-api";

function initializePlugin(api, component) {
  console.log('Initializing...')
}

export default {
  setupComponent(args, component) {
    withPluginApi('0.8.8', api => initializePlugin(api, component, args));
  },
};