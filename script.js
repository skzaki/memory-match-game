const themeSelect = document.getElementById("theme-select");
const selectedTheme = localStorage.getItem("selectedTheme") || "fruits";
themeSelect.value = selectedTheme;

// AWS Configuration
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: 'AKIA4TGIVNWAL54HUZUY',
  secretAccessKey: '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'
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

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
    onSuccess: async function (result) {
      document.getElementById("auth-message").innerText = "✅ Login successful!";
      document.getElementById("auth-section").style.display = "none";
      document.getElementById("auth-section").style.display = "none";
      document.getElementById("confirm-section").style.display = "none";
      document.getElementById("container").style.display = "block";

      // Fetch and display user's best scores
      const scores = await getUserBestScores(email);
      if (scores.length > 0) {
        // Update high score with the best time from DynamoDB
        const bestScore = Math.min(...scores.map(score => score.timeInSeconds));
        localStorage.setItem('highScore', bestScore);
        updateHighScoreDisplay();
      }

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

// Game variables
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let moves = 0;
let timer;
let time = 0;
let cards = [];
let imageUrls = [];

const movesElement = document.getElementById("moves");
const timerElement = document.getElementById("timer");
const highScoreElement = document.getElementById("high-score");
const gameBoard = document.getElementById("game-board");
let highScore = localStorage.getItem("highScore_" + selectedTheme) || null;

const flipSound = new Audio("https://aws-image-matching-game.s3.us-east-1.amazonaws.com/card+flip.mp3");

// Initialize the game board
function initializeGame(theme) {
  // Reset game state
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  matchedPairs = 0;
  moves = 0;
  time = 0;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  
  // Update moves and timer display
  movesElement.textContent = "Moves: 0";
  timerElement.textContent = "Time: 00:00";
  
  // Get images for selected theme
  imageUrls = getImageUrls(theme);
  cards = [...imageUrls, ...imageUrls].sort(() => 0.5 - Math.random());
  
  // Clear existing cards
  gameBoard.innerHTML = '';
  
  // Create and add cards
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
  
  // Update high score display for the current theme
  highScore = localStorage.getItem("highScore_" + theme) || null;
  updateHighScoreDisplay();
}

// Theme change handler
themeSelect.addEventListener("change", () => {
  const newTheme = themeSelect.value;
  localStorage.setItem("selectedTheme", newTheme);
  
  // Get new images
  const newImageUrls = getImageUrls(newTheme);
  cards = [...newImageUrls, ...newImageUrls].sort(() => 0.5 - Math.random());
  
  // Reset game state
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  matchedPairs = 0;
  moves = 0;
  time = 0;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  
  // Update displays
  movesElement.textContent = "Moves: 0";
  timerElement.textContent = "Time: 00:00";
  
  // Clear and rebuild game board
  gameBoard.innerHTML = '';
  
  // Create new cards
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
  
  // Update high score for new theme
  highScore = localStorage.getItem("highScore_" + newTheme) || null;
  updateHighScoreDisplay();
});

// Initialize game when document is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeGame(selectedTheme);
  
  // Check if user is already logged in
  const currentUser = userPool.getCurrentUser();
  if (currentUser) {
    currentUser.getSession((err, session) => {
      if (err || !session.isValid()) {
        document.getElementById("auth-section").style.display = "block";
        document.getElementById("container").style.display = "none";
        return;
      }
      // User is logged in
      document.getElementById("auth-section").style.display = "none";
      document.getElementById("confirm-section").style.display = "none";
      document.getElementById("forgot-section").style.display = "none";
      document.getElementById("container").style.display = "block";
      
      setTimeout(() => {
        document.getElementById('main').classList.add('show');
        document.getElementById('reset-btn').classList.add('show');
        document.getElementById('heading').classList.add('show');
      }, 500);
    });
  } else {
    // Show auth section for non-logged in users
    document.getElementById("container").style.display = "none";
    document.getElementById("auth-section").style.display = "block";
  }
});

// Reset button handler
document.getElementById("reset-btn").addEventListener("click", () => {
  initializeGame(selectedTheme);
});

function startTimer() {
  timer = setInterval(() => {
    time++;
    timerElement.textContent = `Time: ${formatTime(time)}`;
  }, 1000);
}

function stopTimer() {
  console.log('Game completed - stopTimer called');
  clearInterval(timer);
  const finalTime = document.getElementById('timer').textContent.split(': ')[1];
  const [minutes, seconds] = finalTime.split(':').map(Number);
  const totalSeconds = minutes * 60 + seconds;
  
  console.log('Final game stats:', { minutes, seconds, totalSeconds, moves });
  
  // Save score when game ends
  const currentUser = userPool.getCurrentUser();
  if (currentUser) {
    console.log('Current user found:', currentUser.username);
    currentUser.getSession((err, session) => {
      if (err) {
        console.error('Error getting user session:', err);
        return;
      }
      console.log('User session valid:', session);
      
      // Get user attributes to ensure we have the email
      currentUser.getUserAttributes((attrErr, attributes) => {
        if (attrErr) {
          console.error('Error getting user attributes:', attrErr);
          return;
        }
        
        console.log('User attributes:', attributes);
        const emailAttribute = attributes.find(attr => attr.Name === 'email');
        const userEmail = emailAttribute ? emailAttribute.Value : currentUser.username;
        
        console.log('Attempting to save score for user:', userEmail);
        saveScore(userEmail, totalSeconds, moves)
          .then(() => console.log('Score saved successfully'))
          .catch(error => console.error('Error saving score:', error));
      });
    });
  } else {
    console.error('No current user found');
  }
  
  // Update high score if better than previous
  const currentHighScore = localStorage.getItem('highScore') || Infinity;
  if (totalSeconds < currentHighScore) {
    localStorage.setItem('highScore', totalSeconds);
    updateHighScoreDisplay();
  }
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
        document.getElementById('confirm-section').classList.add('show');
        document.getElementById('forgot-section').classList.add('show');
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

// Function to save score to DynamoDB
async function saveScore(email, timeInSeconds, moves) {
  console.log('saveScore function called with:', { email, timeInSeconds, moves });
  
  const params = {
    TableName: 'MemoryGameScores',
    Item: {
      userEmail: email,
      timestamp: Date.now(),
      timeInSeconds: parseInt(timeInSeconds),
      moves: parseInt(moves)
    }
  };

  console.log('DynamoDB params:', JSON.stringify(params, null, 2));

  try {
    console.log('Attempting to save to DynamoDB...');
    const result = await dynamoDB.put(params).promise();
    console.log('DynamoDB save result:', result);
    console.log('Score saved successfully to DynamoDB');
    
    // Verify the save by immediately trying to read it back
    try {
      const verifyParams = {
        TableName: 'MemoryGameScores',
        KeyConditionExpression: 'userEmail = :email',
        ExpressionAttributeValues: {
          ':email': email
        },
        Limit: 1
      };
      const verifyResult = await dynamoDB.query(verifyParams).promise();
      console.log('Verification query result:', verifyResult);
    } catch (verifyError) {
      console.error('Verification query failed:', verifyError);
    }
  } catch (error) {
    console.error('Error saving score to DynamoDB:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      region: AWS.config.region,
      table: 'MemoryGameScores'
    });
    
    // Test DynamoDB connectivity
    try {
      console.log('Testing DynamoDB connectivity...');
      const testParams = {
        TableName: 'MemoryGameScores'
      };
      const tableInfo = await dynamoDB.describeTable(testParams).promise();
      console.log('Table info:', tableInfo);
    } catch (testError) {
      console.error('DynamoDB connectivity test failed:', testError);
    }
  }
}

// Function to get user's best scores
async function getUserBestScores(email) {
  const params = {
    TableName: 'MemoryGameScores',
    KeyConditionExpression: 'userEmail = :email',
    ExpressionAttributeValues: {
      ':email': email
    },
    ScanIndexForward: true,
    Limit: 5
  };

  try {
    const result = await dynamoDB.query(params).promise();
    return result.Items;
  } catch (error) {
    console.error('Error fetching scores:', error);
    return [];
  }
}
