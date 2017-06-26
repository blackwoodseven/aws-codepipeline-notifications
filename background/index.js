/* global chrome localStorage getPipelineState showNoPipesDefinedNotification showPipelineNotification showExtentionStartNotification showPipelineStructureChangeNotification _ */

const backgroundFn = () => {
  // Conditionally initialize the options.
  if (!localStorage.isInitialized) {
    localStorage.isActivated = true
    localStorage.frequency = 1        // The display frequency, in minutes.
    localStorage.pipelines = '{}'
    localStorage.typeOfNotif = 'all'
    localStorage.isInitialized = true // The option initialization.
  }

  if (window.Notification) {
    if (JSON.parse(localStorage.isActivated)) {
      var localStoragePipelines = JSON.parse(localStorage.pipelines)
      if (Object.keys(localStoragePipelines).length === 0) {
        showNoPipesDefinedNotification()
      } else {
        showExtentionStartNotification(Object.keys(localStoragePipelines), localStorage.frequency)
        console.info(`Extention Start looking for ${Object.keys(localStoragePipelines)} @ ${localStorage.frequency} min`)

        Object.keys(localStoragePipelines).forEach(pipelineName => {
          getPipelineState(pipelineName)
          .then(pipelineState => {
            // initialize the pipeline states
            localStoragePipelines[pipelineName] = pipelineState
            localStorage.pipelines = JSON.stringify(localStoragePipelines)
          })
          .catch((err) => {
            // log error and reset the pipeline states
            console.error(err)
            localStoragePipelines[pipelineName] = {}
            localStorage.pipelines = JSON.stringify(localStoragePipelines)
          })
        })
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
          console.info(`Going to get the pipeline state for ${pipelineName}`)
          new Promise((resolve) => setTimeout(resolve, 2000)) // for the fk tabs
          .then(() => getPipelineState(pipelineName))
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
                  showPipelineNotification(pipelineName, pipelineStageNewState.stageName, pipelineStageNewState.latestExecution.status, localStorage.typeOfNotif)
                }
              })
            }
            // update the pipeline states
            localStoragePipelines[pipelineName] = newPipelineState
            localStorage.pipelines = JSON.stringify(localStoragePipelines)
          })
          .catch((err) => {
            // log error and reset the pipeline states
            console.error(err)
            localStoragePipelines[pipelineName] = {}
            localStorage.pipelines = JSON.stringify(localStoragePipelines)
          })
        })
        interval = 0
      }
    }, 60000)
  }
}
backgroundFn()
