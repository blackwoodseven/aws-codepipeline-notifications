/* global options localStorage */

function ghost (isDeactivated) {
  // Grays out or [whatever the opposite of graying out is called] the option field.
  options.style.color = isDeactivated ? 'graytext' : 'black' // The label color.
  options.frequency.disabled = isDeactivated // The control manipulability.
  options.pipelines.disabled = isDeactivated // The control manipulability.
}

window.addEventListener('load', function () {
  // Initialize the option controls.
  options.isActivated.checked = JSON.parse(localStorage.isActivated) // The display activation.
  options.frequency.value = localStorage.frequency // The display frequency, in minutes.
  if (localStorage.pipelines) {
    const localStoragePipelines = JSON.parse(localStorage.pipelines)
    var pipelines = ''
    Object.keys(localStoragePipelines).forEach(pipeline => {
      pipelines += pipeline + ';'
    })
    options.pipelines.value = pipelines
  }

  if (!options.isActivated.checked) { ghost(true) }

  // Set the display activation and frequency.
  options.isActivated.onchange = function () {
    localStorage.isActivated = options.isActivated.checked
    ghost(!options.isActivated.checked)
  }

  options.frequency.onchange = function () {
    localStorage.frequency = options.frequency.value
  }

  options.pipelines.onblur = function () {
    var obj = {}
    options.pipelines.value.split(';').forEach(pipeline => {
      if (pipeline !== '') obj[pipeline.replace(' ', '')] = {}
    })
    localStorage.pipelines = JSON.stringify(obj)
  }
})
