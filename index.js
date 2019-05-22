const delayInterval = 250
let appState = {
  waitingForHotkey: false
}

chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === 'complete') {
      clearInterval(readyStateCheckInterval)
      init()
    }
  })
})

function init() {
  jQuery('body').on('contextmenu', rightClickBehavior)
  jQuery(document).on('keydown', handleHotkey)
}

async function rightClickBehavior(e) {
  e.preventDefault()

  let clickedEle = jQuery(e.target)
  let parentThumb = clickedEle.closest('ytd-grid-video-renderer')

  // Open context menu
  let menuBtn = parentThumb.find('#menu button')
  menuBtn.trigger('click')
  await forMs(delayInterval)

  // Select "Not interested"
  let notInterestedBtn = jQuery('ytd-menu-popup-renderer paper-item:contains("Not interested")')
  notInterestedBtn.trigger('click')
  await forMs(delayInterval)

  // Select "Tell us why"
  let tellUsWhyBtn = parentThumb.find('paper-button:contains("Tell us why")')
  tellUsWhyBtn.trigger('click')

  appState.waitingForHotkey = true
}

function handleHotkey(e) {
  if (!appState.waitingForHotkey) {
    return
  }

  switch (e.key) {
    case '1':
      selectFeedbackAndSubmit('already watched')
      break
    case '2':
      selectFeedbackAndSubmit('like the video')
      break
    case '3':
      selectFeedbackAndSubmit('not interested in this channel')
      break
    case '4':
      selectFeedbackAndSubmit('recommendations based on')
      break
  }

  appState.waitingForHotkey = false
}

async function selectFeedbackAndSubmit(feedbackLabelPart) {
  // Select "I've already watched this video"
  let feedbackCheckbox = jQuery(
    `ytd-dismissal-follow-up-renderer paper-checkbox:contains('${feedbackLabelPart}')`
  )
  if (!feedbackCheckbox.length) {
    return
  }

  feedbackCheckbox.trigger('click')
  await forMs(delayInterval)

  // Submit follow-up form
  let submitBtn = jQuery('ytd-dismissal-follow-up-renderer paper-button:contains("Submit")')
  submitBtn.trigger('click')
  await forMs(delayInterval)
}

function forMs(x) {
  return new Promise(res => {
    setTimeout(() => {
      res()
    }, x)
  })
}
