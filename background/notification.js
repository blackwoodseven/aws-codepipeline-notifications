/* global chrome */

const preatyTime = () => {
  const now = new Date()
  return now.getHours() + ':' + ((now.getMinutes() <= 9) ? '0' + now.getMinutes() : now.getMinutes())
}

const showNoPipesDefinedNotification = (pipelines, frequency) =>
  chrome.notifications.create(chrome.runtime.getURL('options/index.html'), {
    type: 'basic',
    title: 'Error! No pipelines to check defined..',
    iconUrl: '../img/error.png',
    message: `Cannot run the pipelines notification system because no pipe is defined tobe checked. Please goto the options page and set the pipes that you want to check`,
    isClickable: false,
    contextMessage: 'Pipeline Notification'
  })


const showExtentionStartNotification = (pipelines, frequency) =>
  chrome.notifications.create('start', {
    type: 'basic',
    title: 'Pipeline Notification Start',
    iconUrl: '../img/48.png',
    message: `The extention has started looking for changes to the pipelines:\n${pipelines}\n @ a frequency of ${frequency} minutes.`,
    isClickable: false,
    contextMessage: 'Pipeline Notification'
  })

const showPipelineNotification = (pipelineName, stageName, status) => {
  var icon = ''
  var requireInteraction = false
  var priority = 0
  if (status === 'Succeeded') icon = '../img/success.png'
  else if (status === 'InProgress') icon = '../img/progress.png'
  else if (status === 'Faillure') {
    icon = '../img/failure.png'
    requireInteraction = true
    priority = 2
  }

  chrome.notifications.create(
    `https://eu-west-1.console.aws.amazon.com/codepipeline/home?region=eu-west-1#/view/${pipelineName}`, {
      type: 'basic',
      title: `${pipelineName} - ${preatyTime()}`,
      iconUrl: icon,
      message: `Stage: ${stageName}\nStatus: ${status}`,
      requireInteraction,
      priority,
      contextMessage: 'Pipeline Notification'
    })
}

const showPipelineStructureChangeNotification = (pipelineName) =>
  chrome.notifications.create(
    `https://eu-west-1.console.aws.amazon.com/codepipeline/home?region=eu-west-1#/view/${pipelineName}`, {
      type: 'basic',
      title: `${pipelineName} - ${preatyTime()}`,
      iconUrl: '../img/information.png',
      message: `This pipeline has change structure.`,
      contextMessage: 'Pipeline Notification'
    })

const showLoggedOutNotification = () => {
  chrome.notifications.create(
    'https://console.aws.amazon.com/console/home', {
      type: 'basic',
      title: `Error!! - ${preatyTime()}`,
      iconUrl: '../img/error.png',
      message: `Cant retrive the pipeline status. Most probable because you are logged out.\nIf you are logged it is probable that AWS changed something on the responses.. you will have to debug.`,
      contextMessage: 'Pipeline Notification'
    })
  openPage()
}

const openPage = (urlAsNotificationId = '') => {
  if (urlAsNotificationId.indexOf('aws.amazon.com') !== -1) {
    chrome.tabs.query({url: 'https://*.aws.amazon.com/*'},
    (tabs) => {
      if (tabs.length === 0) {
        chrome.tabs.create({url: 'https://eu-west-1.console.aws.amazon.com/codepipeline/home'})
      } else {
        chrome.tabs.update(tabs[0].id, {active: true})
      }
    })
  } else {
    chrome.tabs.create({url: urlAsNotificationId})
  }
}

chrome.notifications.onClicked.addListener((urlAsNotificationId) => {
  if (urlAsNotificationId !== 'start') {
    openPage(urlAsNotificationId)
  }
})
