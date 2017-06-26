/* global chrome */

// aux functions

const preatyTime = () => {
  const now = new Date()
  return now.getHours() + ':' + ((now.getMinutes() <= 9) ? '0' + now.getMinutes() : now.getMinutes())
}

const createNotification = (urlAsId, title, iconUrl, message, requireInteraction = false, priority = 0) =>
  chrome.notifications.create(urlAsId, {
    type: 'basic',
    title,
    iconUrl,
    message,
    isClickable: (urlAsId !== 'noLink'),
    contextMessage: 'Pipeline Notification',
    requireInteraction,
    priority
  })

// diferent notification creators

const showNoPipesDefinedNotification = () =>
  createNotification(
    chrome.runtime.getURL('options/index.html'),
    'Error! No pipelines to check defined..',
    '../img/error.png',
    `Cannot run the pipelines notification system because no pipe is defined tobe checked. Please goto the options page and set the pipes that you want to check`)

const showExtentionStartNotification = (pipelines, frequency) =>
  createNotification(
    'noLink',
    'Pipeline Notification Start',
    '../img/48.png',
    `The extention has started looking for changes to the pipelines:\n${pipelines}\n @ a frequency of ${frequency} minutes.`)

const showPipelineNotification = (pipelineName, stageName, status, typeOfNotif) => {
  var icon = ''
  var requireInteraction = false
  var priority = 0
  var now = new Date()
  if (status === 'Succeeded') icon = '../img/success.png'
  else if (status === 'InProgress') icon = '../img/progress.png'
  else if (status === 'Failed') {
    icon = '../img/failure.png'
    requireInteraction = true
    priority = 2
  }

  if (typeOfNotif === 'all' ||
     (typeOfNotif === 'failuresSuccesses' && (status === 'Succeeded' || status === 'Failed')) ||
     (typeOfNotif === 'onlyFailures' && status === 'Failed')) {
    console.info(`Notification... ${pipelineName} - ${preatyTime()} // Stage: ${stageName}\nStatus: ${status}`)
    createNotification(
      `https://eu-west-1.console.aws.amazon.com/codepipeline/home?region=eu-west-1#/view/${pipelineName}?ourtoken=${stageName}-${now.getTime()}`,
      `${pipelineName} - ${preatyTime()}`,
      icon,
      `Stage: ${stageName}\nStatus: ${status}`,
      requireInteraction,
      priority)
  } else {
    console.info(`Sillent notification... ${pipelineName} - ${preatyTime()} // Stage: ${stageName}\nStatus: ${status}`)
  }
}

const showPipelineStructureChangeNotification = (pipelineName) =>
  createNotification(
    `https://eu-west-1.console.aws.amazon.com/codepipeline/home?region=eu-west-1#/view/${pipelineName}`,
    `${pipelineName} - ${preatyTime()}`,
    '../img/information.png',
    `This pipeline has change structure.`)

const showLoggedOutNotification = () => {
  const url = 'https://eu-west-1.console.aws.amazon.com/codepipeline/home'
  createNotification(
    url,
    `Error!! - ${preatyTime()}`,
    '../img/error.png',
    `Cant retrive the pipeline status. Most probable because you are logged out.\nIf you are logged it is probable that AWS changed something on the responses.. you will have to debug.`)
  openPage(url)
}

// on click notifications handlers

const openPage = (urlAsNotificationId) => {
  if (urlAsNotificationId.indexOf('aws.amazon.com') !== -1) {
    chrome.tabs.query({url: 'https://*.aws.amazon.com/*'},
    (tabs) => {
      if (tabs.length === 0) {
        chrome.tabs.create({url: urlAsNotificationId})
      } else {
        chrome.tabs.update(tabs[0].id, {active: true})
      }
    })
  } else {
    chrome.tabs.create({url: urlAsNotificationId})
  }
}

chrome.notifications.onClicked.addListener((urlAsNotificationId) => {
  if (urlAsNotificationId !== 'noLink') {
    openPage(urlAsNotificationId)
  }
})
