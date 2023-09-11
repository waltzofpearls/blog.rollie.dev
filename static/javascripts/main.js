function watchScroll() {
  const smallLogo = document.querySelector('.small-logo')
  const smallLogoContainer = document.querySelector('.small-logo-container')
  const bigLogoContainer = document.querySelector('.big-logo-row')
  const navbar = document.querySelector('.navbar')
  const navbarHeader = document.querySelector('.navbar-header')

  const smallLogoHeight = smallLogo.clientHeight
  const bigLogoHeight = bigLogoContainer.clientHeight
  const navbarHeight = navbarHeader.clientHeight

  const smallLogoEndPos = 0;
  const smallSpeed = (smallLogoHeight / bigLogoHeight);
  const ySmall = (window.scrollY * smallSpeed);

  let smallPadding = navbarHeight - ySmall;
  if (smallPadding > navbarHeight) {
    smallPadding = navbarHeight;
  }
  if (smallPadding < smallLogoEndPos) {
    smallPadding = smallLogoEndPos;
  }
  if (smallPadding < 0) {
    smallPadding = 0;
  }

  smallLogoContainer.style.width = (smallLogoHeight > smallPadding) ? '50px' : 0
  smallLogoContainer.style.paddingTop = `${smallPadding}px`

  let navOpacity = ySmall / smallLogoHeight;
  if (navOpacity > 1) {
    navOpacity = 1;
  }
  if (navOpacity < 0) {
    navOpacity = 0;
  }

  let shadowOpacity = navOpacity * 0.3;
  if (ySmall > 1) {
    navbar.style.boxShadow = `0 2px 3px rgba(0,0,0,${shadowOpacity})`
  } else {
    navbar.style.boxShadow = 'none'
  }
}

document.addEventListener("DOMContentLoaded", function(){
  document.addEventListener("scroll", (event) => {
    watchScroll()
  })
})
