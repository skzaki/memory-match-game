const themeSelect = document.getElementById("theme-select");
const selectedTheme = localStorage.getItem("selectedTheme") || "fruits";
themeSelect.value = selectedTheme;

// Cognito Configuration
const poolData = {
  UserPoolId: 'us-east-1_PUImPipJ4',
  ClientId: '5s6gluaua0jbegq2dlbvd76oak'
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

// Auth Functions
function loginUser() {
  const email = document.getElementById('user-email').value;
  const password = document.getElementById('user-password').value;

  const authDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: email,
    Password: password
  });

  const userData = {
    Username: email,
    Pool: userPool
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authDetails, {
    onSuccess: function (result) {
      
      
      
      document.getElementById("auth-message").innerText = "✅ Login successful!";
      document.getElementById("auth-section").style.display = "none";
      document.getElementById("forgot-section").style.display = "none";
      document.getElementById("confirm-section").style.display = "none";
      document.getElementById("container").style.display = "block";

      setTimeout(() => {
        document.getElementById('main').classList.add('show');
        document.getElementById('reset-btn').classList.add('show');
        document.getElementById('heading').classList.add('show');
      }, 500);

    },
    onFailure: function (err) {
      document.getElementById("auth-message").innerText = `❌ ${err.message || JSON.stringify(err)}`;
    }
  });
}

const currentUser = userPool.getCurrentUser();

if (currentUser) {
  currentUser.getSession((err, session) => {
    if (err || !session.isValid()) {
      return;
    }

    // User is logged in
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("confirm-section").style.display = "none";
    document.getElementById("forgot-section").style.display = "none";
    document.getElementById("container").style.display = "block";
    document.getElementById("confirm-reset-btn").style.display = "block";


    // Animate elements
    setTimeout(() => {
      document.getElementById('main').classList.add('show');
      document.getElementById('reset-btn').classList.add('show');
      document.getElementById('heading').classList.add('show');
      document.getElementById("confirm-reset-btn").style.display = "block";

    }, 500);
  });
}

function signUpUser() {
  const email = document.getElementById('user-email').value;
  const password = document.getElementById('user-password').value;

  const attributeList = [];
  const dataEmail = {
    Name: 'email',
    Value: email
  };
  const attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
  attributeList.push(attributeEmail);

  userPool.signUp(email, password, attributeList, null, function(err, result) {
    if (err) {
      document.getElementById("auth-message").innerText = `❌ ${err.message || JSON.stringify(err)}`;
      return;
    }

    document.getElementById("auth-message").innerText = "✅ Sign up successful! Check your email for the confirmation code.";
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("confirm-section").style.display = "block";
    document.getElementById("confirm-email").value = email;
  });
}

function confirmUser() {
  const email = document.getElementById('confirm-email').value;
  const code = document.getElementById('confirm-code').value;

  const userData = {
    Username: email,
    Pool: userPool
  };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.confirmRegistration(code, true, function(err, result) {
    if (err) {
      document.getElementById("confirm-message").innerText = `❌ ${err.message || JSON.stringify(err)}`;
      return;
    }
    document.getElementById("confirm-message").innerText = "✅ Account confirmed! You can now log in.";
    document.getElementById("confirm-section").style.display = "none";
    document.getElementById("auth-section").style.display = "block";
  });
}


function showForgotPassword() {
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("forgot-section").style.display = "block";
}

function startForgotPassword() {
  const email = document.getElementById('forgot-email').value;
  const userData = {
    Username: email,
    Pool: userPool
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.forgotPassword({
    onSuccess: function (data) {
      document.getElementById("forgot-message").innerText = "📧 Code sent to your email.";
      document.getElementById("forgot-code").style.display = "block";
      document.getElementById("new-password").style.display = "block";
      document.getElementById("confirm-reset-btn").style.display = "block";
    },
    onFailure: function (err) {
      document.getElementById("forgot-message").innerText = `❌ ${err.message || JSON.stringify(err)}`;
    }
  });
}

function confirmForgotPassword() {
  const email = document.getElementById('forgot-email').value;
  const code = document.getElementById('forgot-code').value;
  const newPassword = document.getElementById('new-password').value;

  const userData = {
    Username: email,
    Pool: userPool
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.confirmPassword(code, newPassword, {
    onSuccess() {
      document.getElementById("forgot-message").innerText = "✅ Password has been reset!";
    },
    onFailure(err) {
      document.getElementById("forgot-message").innerText = `❌ ${err.message || JSON.stringify(err)}`;
    }
  });
}


       const storageKey = 'theme-preference'

const onClick = () => {
  // flip current value
  theme.value = theme.value === 'light'
    ? 'dark'
    : 'light'

  setPreference()
}

const getColorPreference = () => {
  if (localStorage.getItem(storageKey))
    return localStorage.getItem(storageKey)
  else
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
}

const setPreference = () => {
  localStorage.setItem(storageKey, theme.value)
  reflectPreference()
}

const reflectPreference = () => {
  document.firstElementChild
    .setAttribute('data-theme', theme.value)

  document
    .querySelector('#theme-toggle')
    ?.setAttribute('aria-label', theme.value)
}

const theme = {
  value: getColorPreference(),
}

// set early so no page flashes / CSS is made aware
reflectPreference()

window.onload = () => {
  // set on load so screen readers can see latest value on the button
  reflectPreference()

  // now this script can find and listen for clicks on the control
  document
    .querySelector('#theme-toggle')
    .addEventListener('click', onClick)
}

// sync with system changes
window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', ({matches:isDark}) => {
    theme.value = isDark ? 'dark' : 'light'
    setPreference()
  })
        
 

function getImageUrls(theme) {
  const themes = {
    fruits: [
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/apple.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/banana.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/grapes.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/kiwi.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/melon.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/orange.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/papaya.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/pineapple.jpg"
    ],
    animals: [
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/animals/bear.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/animals/cati.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/animals/cow.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/animals/horse.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/animals/lion.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/animals/monkey.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/animals/og.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/animals/tiger.jpg"
    ],
    memes: [
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/memes/1.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/memes/2.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/memes/3.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/memes/4.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/memes/5.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/memes/6.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/memes/7.jpg",
      "https://aws-image-matching-game.s3.us-east-1.amazonaws.com/memes/8.jpg"
    ]
  };
  return themes[theme];
}

const imageUrls = getImageUrls(selectedTheme);
let cards = [...imageUrls, ...imageUrls].sort(() => 0.5 - Math.random());
const gameBoard = document.getElementById("game-board");

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let moves = 0;
const movesElement = document.getElementById("moves");

let timer;
let time = 0;
const timerElement = document.getElementById("timer");

let highScore = localStorage.getItem("highScore_" + selectedTheme) || null;
const highScoreElement = document.getElementById("high-score");

const flipSound = new Audio("https://www.soundjay.com/button/sounds/button-16.mp3");

function startTimer() {
  timer = setInterval(() => {
    time++;
    timerElement.textContent = `Time: ${formatTime(time)}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateHighScoreDisplay() {
  if (highScore) {
    highScoreElement.textContent = `Best Time: ${formatTime(highScore)}`;
  } else {
    highScoreElement.textContent = `Best Time: --:--`;
  }
}

function incrementMoves() {
  moves++;
  movesElement.textContent = `Moves: ${moves}`;
}

updateHighScoreDisplay();

cards.forEach((url) => {
  const card = document.createElement("div");
  card.classList.add("card");

  const cardInner = document.createElement("div");
  cardInner.classList.add("card-inner");

  const front = document.createElement("div");
  front.classList.add("card-front");
  front.textContent = "🎴";

  const back = document.createElement("div");
  back.classList.add("card-back");
  const img = document.createElement("img");
  img.src = url;
  img.alt = "Card image";
  back.appendChild(img);

  cardInner.appendChild(front);
  cardInner.appendChild(back);
  card.appendChild(cardInner);
  card.dataset.url = url;

  card.addEventListener("click", () => {
    if (lockBoard || card.classList.contains("flipped") || firstCard === card) return;

    if (time === 0 && !timer) startTimer();

    flipSound.play();
    card.classList.add("flipped");

    if (!firstCard) {
      firstCard = card;
    } else {
      secondCard = card;
      incrementMoves();
      checkMatch();
    }
  });

  gameBoard.appendChild(card);
});

function checkMatch() {
  if (firstCard.dataset.url === secondCard.dataset.url) {
    matchedPairs++;
    resetTurn();

    if (matchedPairs === imageUrls.length) {
      stopTimer();

      if (!highScore || time < highScore) {
        highScore = time;
        localStorage.setItem("highScore_" + selectedTheme, highScore);
        updateHighScoreDisplay();
      }

      setTimeout(() => {
        alert(`🎉 Congratulations! You matched all cards in ${formatTime(time)} with ${moves} moves!`);
      }, 500);
    }
  } else {
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetTurn();
    }, 1000);
  }
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

document.getElementById("reset-btn").addEventListener("click", () => {
  location.reload();
});

themeSelect.addEventListener("change", () => {
  localStorage.setItem("selectedTheme", themeSelect.value);
  location.reload();
});

const coords = { x: 0, y: 0 };
const circles = document.querySelectorAll('.circle');
const colors = ["#ffc8c8", "#feb1bc", "#fc99b7", "#f680b7", "#e96abc", "#d45dbf", "#b857bc", "#9c54b3", "#8050a5", "#674b94", "#514580", "#3e3e6b"];

circles.forEach(function (circle, index) {
  circle.x = 0;
  circle.y = 0;
  circle.style.backgroundColor = colors[index % colors.length];
});

window.addEventListener('mousemove', function (e) {
  coords.x = e.clientX;
  coords.y = e.clientY;
});

function animateCircles() {
  let x = coords.x;
  let y = coords.y;
  circles.forEach(function (circle, index) {
    circle.style.left = x - 12 + 'px';
    circle.style.top = y - 12 + 'px';
    const scaleValue = (circles.length - index) / 30;
    circle.style.transform = `scale(${scaleValue})`;
    circle.x = x;
    circle.y = y;
    const nextCircle = circles[index + 1] || circles[0];
    x += (nextCircle.x - x) * 0.3;
    y += (nextCircle.y - y) * 0.3;
  });
  requestAnimationFrame(animateCircles);
}

animateCircles();

// delay in login page  
window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        document.getElementById('auth-section').classList.add('show');
      }, 50);
    });


// dark mode 
function darkMode() {
   var eyeball = document.getElementById('eyeball');
   var heading = document.getElementById('heading');
   var timer = document.getElementById('timer');
   var highscore = document.getElementById('high-score');
   var moves = document.getElementById("moves");
   var logoutbtn = document.getElementById("logout-btn");
   var resetbtn = document.getElementById("reset-btn");
   var choosetheme = document.getElementById("choose-theme");
   var selector = document.getElementById("theme-select");
   var gameboard = document.getElementById("game-board");
   gameBoard.classList.toggle("dark-mode");
   selector.classList.toggle("dark-mode");
   choosetheme.classList.toggle("dark-mode");
   resetbtn.classList.toggle("dark-mode");
   logoutbtn.classList.toggle("dark-mode");
   moves.classList.toggle("dark-mode");
   highscore.classList.toggle("dark-mode");
   timer.classList.toggle("dark-mode");
   heading.classList.toggle("dark-mode");
   eyeball.classList.toggle("dark-mode");
}




document.getElementById("logout-btn").addEventListener("click", () => {
  const user = userPool.getCurrentUser();
  if (user) {
    user.signOut();
  }
  location.reload(); // Reload to return to login screen
});

document.getElementById("logout-btn").style.display = "inline-block";
