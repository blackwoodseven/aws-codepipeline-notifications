/* global localStorage chrome */

const goToTab = (url) =>
  chrome.tabs.query({url},
  (tabs) => {
    if (tabs.length === 0) {
      chrome.tabs.create({url})
    } else {
      chrome.tabs.update(tabs[0].id, {active: true})
    }
  })

var optionAnchor = document.getElementById('optionAnchor')
optionAnchor.onclick = () => goToTab(chrome.runtime.getURL('options/index.html'))

var refreshAnchor = document.getElementById('refreshAnchor')
refreshAnchor.onclick = () => {
  console.log('test refreshAnchor')
  chrome.runtime.reload()
}

var content = document.getElementById('content')
if (JSON.parse(localStorage.isActivated)) {
  debugger
  var localStoragePipelines = JSON.parse(localStorage.pipelines)
  if (Object.keys(localStoragePipelines).length === 0) {
    var noPipesDiv = document.createElement('div')
    noPipesDiv.className = 'noPipes'
    noPipesDiv.innerText = 'There are no pipes loaded. Please check your options our wait a bit.'
    content.appendChild(noPipesDiv)
  } else {
    Object.keys(localStoragePipelines).forEach(pipelineName => {
      const pipe = localStoragePipelines[pipelineName]
      var pipeDiv = document.createElement('div')
      pipeDiv.className = 'pipe'

      var title = document.createElement('a')
      title.href = '#'
      title.innerText = pipelineName
      title.onclick = () => goToTab(`https://eu-west-1.console.aws.amazon.com/codepipeline/home?region=eu-west-1#/view/${pipelineName}`)
      pipeDiv.appendChild(title)

      if (pipe.stageStates) {
        pipe.stageStates.forEach(stage => {
          var stageDiv = document.createElement('div')
          stageDiv.className = 'stage'

          const stageStatus = stage.latestExecution.status
          var stateImg = document.createElement('img')
          if (stageStatus === 'Succeeded') stateImg.src = '../img/success.png'
          else if (stageStatus === 'InProgress') stateImg.src = '../img/progress.png'
          else if (stageStatus === 'Faillure') stateImg.src = '../img/failure.png'
          stageDiv.appendChild(stateImg)

          var stageNameP = document.createElement('p')
          stageNameP.innerText = `Stage: ${stage.stageName}`
          stageDiv.appendChild(stageNameP)

          var stageStatusP = document.createElement('p')
          stageStatusP.innerText = `Status: ${stageStatus}`
          stageDiv.appendChild(stageStatusP)

          var latestExecutionIdP = document.createElement('p')
          latestExecutionIdP.innerText = `ExeId: ${stage.latestExecution.pipelineExecutionId}`
          stageDiv.appendChild(latestExecutionIdP)

          pipeDiv.appendChild(stageDiv)
        })
      } else {
        var errorMsg = document.createElement('p')
        errorMsg.innerText = 'Cant retreive the stages of this pipe. Most probable is that you are logged out.'
        pipeDiv.appendChild(errorMsg)
      }

      content.appendChild(pipeDiv)
    })
  }
} else {
  var notActiveDiv = document.createElement('div')
  notActiveDiv.className = 'notActive'
  notActiveDiv.innerText = 'The notification system is not active. Please goto options and set it up.'
  content.appendChild(notActiveDiv)
}
