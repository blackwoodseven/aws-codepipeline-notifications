/* global localStorage getPipelineState showNoPipesDefinedNotification showPipelineNotification showExtentionStartNotification showPipelineStructureChangeNotification _ */

const backgroundFn = () => {
  // Conditionally initialize the options.
  if (!localStorage.isInitialized) {
    localStorage.isActivated = true
    localStorage.frequency = 1        // The display frequency, in minutes.
    localStorage.pipelines = '{}'
    localStorage.isInitialized = true // The option initialization.
  }

  // Test for notification support.
  if (window.Notification) {
    if (JSON.parse(localStorage.isActivated)) {
      var localStoragePipelines = JSON.parse(localStorage.pipelines)
      Object.keys(localStoragePipelines).forEach(pipelineName => {
        getPipelineState(pipelineName)
        .then(pipelineState => {
          localStoragePipelines[pipelineName] = pipelineState
          localStorage.pipelines = JSON.stringify(localStoragePipelines)
        })
      })
      if (Object.keys(localStoragePipelines).length === 0) {
        showNoPipesDefinedNotification()
      } else {
        showExtentionStartNotification(Object.keys(localStoragePipelines), localStorage.frequency)
      }
    } else {
      chrome.browserAction.setIcon({path: 'img/48grey.png'})
    }
    var interval = 0 // The display interval, in minutes.
    setInterval(function () {
      interval++

      if (JSON.parse(localStorage.isActivated) && localStorage.frequency <= interval) {
        var localStoragePipelines = JSON.parse(localStorage.pipelines)
        Object.keys(localStoragePipelines).forEach(pipelineName => {
          getPipelineState(pipelineName)
          .then(newPipelineState => {
            const pipelineOldState = localStoragePipelines[pipelineName]
            if (pipelineOldState.stageStates && pipelineOldState.stageStates.length !== newPipelineState.stageStates.length) {
              showPipelineStructureChangeNotification(pipelineName)
            } else if (pipelineOldState.stageStates) {
              // -- for debug purposes --
              // pipelineOldState.stageStates.forEach(p => console.log(`${p.stageName} // ${p.latestExecution.status} - ${p.latestExecution.pipelineExecutionId}`))
              // newPipelineState.stageStates.forEach(p => console.log(`${p.stageName} // ${p.latestExecution.status} - ${p.latestExecution.pipelineExecutionId}`))

              newPipelineState.stageStates.forEach((pipelineStageNewState, index) => {
                if (!_.isEqual(pipelineOldState.stageStates[index], pipelineStageNewState)) {
                  showPipelineNotification(pipelineName, pipelineStageNewState.stageName, pipelineStageNewState.latestExecution.status)
                }
              })
            }
            localStoragePipelines[pipelineName] = newPipelineState
            localStorage.pipelines = JSON.stringify(localStoragePipelines)
          })
          .catch((err) => console.error(err))
        })
        interval = 0
      }
    }, 60000)
  }
}
backgroundFn()
