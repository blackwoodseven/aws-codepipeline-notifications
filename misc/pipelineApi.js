/* global chrome fetch Headers showLoggedOutNotification */

const codepipelineProxyCall = (content, target) =>
  new Promise((resolve, reject) => {
    const calcCSRF = (awsUserInfo) => {
      // Extracted from amazon land generates the CSRF token based on the user aws info that comes from the cookie aws-userInfo
      const auxFn = (e) => {
        var d, c, f
        if (!e) { return 0 }
        d = 1
        c = 0
        for (f = 0; f < e.length; f = f + 1) {
          d = (d + e[f]) % 65521
          c = (c + d) % 65521
        }
        return (c << 15) | d
      }
      var c, e
      if (awsUserInfo) {
        c = []
        for (e = 0; e < awsUserInfo.length; e = e + 1) {
          c.push(awsUserInfo.charCodeAt(e))
        }
        return auxFn(c)
      }
      return []
    }

    var payload = {
      region: 'eu-west-1',
      content,
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Date': 'Thu, 22 Jun 2017 18:02:35 GMT',
        'Content-Encoding': 'amz-1.0',
        'X-Amz-FinalRetry': false,
        'X-Amz-IsConsoleCall': true,
        'X-Amz-RetryAttempt': 0,
        'X-Amz-Target': target
      }
    }
    return chrome.cookies.getAll({name: 'aws-userInfo'}, (cookie) => {
      if (cookie.length === 0) {
        throw new Error('aws-userInfo cookie missing...')
      }
      const decodedCookieAwsUserInfo = decodeURIComponent(cookie[0].value)
      fetch('https://eu-west-1.console.aws.amazon.com/codepipeline/proxy', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(payload),
        headers: new Headers({
          host: 'eu-west-1.console.aws.amazon.com',
          'connection': 'keep-alive',
          'content-Length': 324,
          'X-Csrf-Token': calcCSRF(decodedCookieAwsUserInfo),
          'Content-Type': 'application/json;charset=UTF-8',
          'Accept': 'application/json, text/plain, */*',
          'DNT': 1,
          'Accept-Encoding': 'gzip, deflate, br'
        })
      })
      .then((data) => data.text())
      .then((dataText) => {
        var dataJson
        try {
          dataJson = JSON.parse(dataText)
        } catch (e) {
          throw new Error('Not good json!')
        }
        console.log(dataJson)
        return resolve(dataJson)
      })
      .catch((err) => {
        showLoggedOutNotification()
        return reject(err)
      })
    })
  })

const getPipelineState = (pipelineName) => {
  const content = {name: pipelineName}
  const target = 'CodePipeline_20150709.GetPipelineState'
  return codepipelineProxyCall(content, target)
}
